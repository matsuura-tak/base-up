import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveRouteFromLocation } from '../domain/router';
import {
  PERSISTED_STORAGE_KEY,
  SafeStorageAdapter,
  sanitizePersistedPayload,
} from '../storage/safeStorage';

describe('URL router & SafeStorageAdapter resilience (AC-1, AC-2, AC-16)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('resolves canonical routes and normalizes out-of-range ?stage= queries', () => {
    expect(resolveRouteFromLocation('/', '')).toEqual({
      route: 'lobby',
      stageId: null,
      stageFallbackNotice: false,
      canonicalPath: '/',
    });

    expect(resolveRouteFromLocation('/combinator', '')).toEqual({
      route: 'combinator',
      stageId: 1,
      stageFallbackNotice: false,
      canonicalPath: '/combinator?stage=1',
    });

    expect(resolveRouteFromLocation('/combinator', '?stage=10')).toEqual({
      route: 'combinator',
      stageId: 10,
      stageFallbackNotice: false,
      canonicalPath: '/combinator?stage=10',
    });

    expect(resolveRouteFromLocation('/combinator', '?stage=99')).toEqual({
      route: 'combinator',
      stageId: 1,
      stageFallbackNotice: true,
      canonicalPath: '/combinator?stage=1',
    });

    expect(resolveRouteFromLocation('/fermi', '?stage=0')).toEqual({
      route: 'fermi',
      stageId: 1,
      stageFallbackNotice: true,
      canonicalPath: '/fermi?stage=1',
    });

    expect(resolveRouteFromLocation('/fermi', '?stage=9')).toEqual({
      route: 'fermi',
      stageId: 9,
      stageFallbackNotice: false,
      canonicalPath: '/fermi?stage=9',
    });

    expect(resolveRouteFromLocation('/diagnostic', '')).toEqual({
      route: 'diagnostic',
      stageId: null,
      stageFallbackNotice: false,
      canonicalPath: '/diagnostic',
    });

    expect(resolveRouteFromLocation('/non-existent', '')).toEqual({
      route: 'notFound',
      stageId: null,
      stageFallbackNotice: false,
      canonicalPath: '/non-existent',
    });
  });

  it('initializes first-visit state and restores valid saved history cleanly', () => {
    const adapter1 = new SafeStorageAdapter();
    const firstLoad = adapter1.loadInitial(1700000000000);
    expect(firstLoad.isFirstVisit).toBe(true);
    expect(firstLoad.hadStorageException).toBe(false);
    expect(firstLoad.state.firstVisitedAtMs).toBe(1700000000000);

    const updated = {
      ...firstLoad.state,
      locale: 'en' as const,
      soundEnabled: false,
    };
    expect(adapter1.save(updated)).toBe(true);

    const adapter2 = new SafeStorageAdapter();
    const secondLoad = adapter2.loadInitial(1700000050000);
    expect(secondLoad.isFirstVisit).toBe(false);
    expect(secondLoad.state.locale).toBe('en');
    expect(secondLoad.state.soundEnabled).toBe(false);
    expect(secondLoad.state.firstVisitedAtMs).toBe(1700000000000);
  });

  it('recovers safely from corrupted JSON and sanitizes invalid field types', () => {
    window.localStorage.setItem(PERSISTED_STORAGE_KEY, '{broken_json_payload');
    const adapter = new SafeStorageAdapter();
    const outcome = adapter.loadInitial(1700000100000);

    expect(outcome.isFirstVisit).toBe(true);
    expect(adapter.getStatusSnapshot().recoveredFromCorruption).toBe(true);
    expect(adapter.getStatusSnapshot().storageAvailable).toBe(true);

    const sanitized = sanitizePersistedPayload({
      schemaVersion: 1,
      locale: 'fr',
      soundEnabled: 'yes',
      combinatorStages: {
        '1': { stageId: 1, cleared: true, runAttemptsBeforeFirstClear: 1, totalRunAttempts: 1, bestScore: 1105 },
        '99': { stageId: 99, cleared: true },
      },
      fermiStages: {
        '1': { stageId: 1, cleared: true, bestJudgment: 'UNKNOWN_BADGE', totalFireAttempts: 1 },
      },
    });
    expect(sanitized.recoveredFromCorruption).toBe(false);
    expect(sanitized.state.locale).toBe('ja');
    expect(sanitized.state.soundEnabled).toBe(true);
    expect(sanitized.state.combinatorStages['1']?.cleared).toBe(true);
    expect(sanitized.state.combinatorStages['99']).toBeUndefined();
    expect(sanitized.state.fermiStages['1']?.cleared).toBe(false);
  });

  it('freezes writes when a newer schemaVersion is present in storage', () => {
    let notified = false;
    window.localStorage.setItem(PERSISTED_STORAGE_KEY, JSON.stringify({ schemaVersion: 2 }));
    const adapter = new SafeStorageAdapter(() => {
      notified = true;
    });
    const outcome = adapter.loadInitial(1700000200000);
    expect(notified).toBe(true);
    expect(adapter.isNewerSchemaFrozen()).toBe(true);
    expect(adapter.save({ ...outcome.state, locale: 'en' })).toBe(false);
    expect(window.localStorage.getItem(PERSISTED_STORAGE_KEY)).toBe(
      JSON.stringify({ schemaVersion: 2 }),
    );
  });

  it('falls back to in-memory storage and exposes fallbackBannerVisible when getter throws', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });

    try {
      const adapter = new SafeStorageAdapter();
      const outcome = adapter.loadInitial(1700000300000);
      expect(outcome.hadStorageException).toBe(true);
      expect(adapter.getStatusSnapshot().storageAvailable).toBe(false);
      expect(adapter.getStatusSnapshot().fallbackBannerVisible).toBe(true);

      expect(adapter.save({ ...outcome.state, soundEnabled: false })).toBe(false);
      expect(adapter.getStateSnapshot().soundEnabled).toBe(false);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(window, 'localStorage', originalDescriptor);
      }
    }
  });
});
