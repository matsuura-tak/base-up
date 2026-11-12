import type {
  CombinatorStageRecord,
  FermiBestJudgment,
  FermiStageRecord,
  Locale,
  PersistedArcadeStateV1,
  StorageStatus,
} from '../domain/types';

export const PERSISTED_STORAGE_KEY = 'logic_arcade_state_v1';
const CURRENT_SCHEMA_VERSION = 1;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNonNegativeInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
    return value;
  }
  return fallback;
}

function readNullableNonNegativeInt(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
    return value;
  }
  return null;
}

function readNullablePositiveInt(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) {
    return value;
  }
  return null;
}

function readLocale(value: unknown): Locale {
  if (value === 'en') {
    return 'en';
  }
  return 'ja';
}

function readFermiBestJudgment(value: unknown): FermiBestJudgment | null {
  if (value === 'PERFECT_ORDER' || value === 'GOOD_RANGE') {
    return value;
  }
  return null;
}

export function createDefaultPersistedState(
  firstVisitedAtMs: number | null = null,
): PersistedArcadeStateV1 {
  return {
    schemaVersion: 1,
    locale: 'ja',
    soundEnabled: true,
    firstVisitedAtMs,
    firstEverClearedAtMs: null,
    hasRecorded7dReturnPlay: false,
    combinatorTotalRuns: 0,
    combinatorCrashedRuns: 0,
    combinatorStages: {},
    fermiTotalFires: 0,
    fermiTrapFires: 0,
    fermiStages: {},
  };
}

export function clonePersistedState(state: PersistedArcadeStateV1): PersistedArcadeStateV1 {
  const combinatorStages: Record<string, CombinatorStageRecord> = {};
  for (const [key, rec] of Object.entries(state.combinatorStages)) {
    combinatorStages[key] = { ...rec };
  }
  const fermiStages: Record<string, FermiStageRecord> = {};
  for (const [key, rec] of Object.entries(state.fermiStages)) {
    fermiStages[key] = { ...rec };
  }
  return {
    ...state,
    combinatorStages,
    fermiStages,
  };
}

export interface SanitizeResult {
  readonly state: PersistedArcadeStateV1;
  readonly recoveredFromCorruption: boolean;
  readonly newerSchemaDetected: boolean;
}

export function sanitizePersistedPayload(rawUnknown: unknown): SanitizeResult {
  if (!isPlainRecord(rawUnknown)) {
    return {
      state: createDefaultPersistedState(null),
      recoveredFromCorruption: true,
      newerSchemaDetected: false,
    };
  }

  const version = rawUnknown['schemaVersion'];
  if (typeof version === 'number' && Number.isInteger(version) && version > CURRENT_SCHEMA_VERSION) {
    return {
      state: createDefaultPersistedState(null),
      recoveredFromCorruption: false,
      newerSchemaDetected: true,
    };
  }

  if (version !== CURRENT_SCHEMA_VERSION) {
    return {
      state: createDefaultPersistedState(null),
      recoveredFromCorruption: true,
      newerSchemaDetected: false,
    };
  }

  const combinatorStages: Record<string, CombinatorStageRecord> = {};
  const rawComb = rawUnknown['combinatorStages'];
  if (isPlainRecord(rawComb)) {
    for (const [k, rawEntry] of Object.entries(rawComb)) {
      if (!isPlainRecord(rawEntry)) {
        continue;
      }
      const stageId = readNonNegativeInt(rawEntry['stageId'], Number.parseInt(k, 10));
      if (!Number.isInteger(stageId) || stageId < 1 || stageId > 10) {
        continue;
      }
      const cleared = rawEntry['cleared'] === true;
      const runAttemptsBeforeFirstClear = cleared
        ? (readNullablePositiveInt(rawEntry['runAttemptsBeforeFirstClear']) ?? 1)
        : null;
      const totalRunAttempts = readNonNegativeInt(
        rawEntry['totalRunAttempts'],
        cleared ? 1 : 0,
      );
      const bestScore = readNullableNonNegativeInt(rawEntry['bestScore']);

      combinatorStages[String(stageId)] = {
        stageId,
        cleared,
        runAttemptsBeforeFirstClear,
        totalRunAttempts,
        bestScore,
      };
    }
  }

  const fermiStages: Record<string, FermiStageRecord> = {};
  const rawFermi = rawUnknown['fermiStages'];
  if (isPlainRecord(rawFermi)) {
    for (const [k, rawEntry] of Object.entries(rawFermi)) {
      if (!isPlainRecord(rawEntry)) {
        continue;
      }
      const stageId = readNonNegativeInt(rawEntry['stageId'], Number.parseInt(k, 10));
      if (!Number.isInteger(stageId) || stageId < 1 || stageId > 9) {
        continue;
      }
      const bestJudgment = readFermiBestJudgment(rawEntry['bestJudgment']);
      const cleared = rawEntry['cleared'] === true && bestJudgment !== null;
      const totalFireAttempts = readNonNegativeInt(
        rawEntry['totalFireAttempts'],
        cleared ? 1 : 0,
      );

      fermiStages[String(stageId)] = {
        stageId,
        cleared,
        bestJudgment: cleared ? bestJudgment : null,
        totalFireAttempts,
      };
    }
  }

  const state: PersistedArcadeStateV1 = {
    schemaVersion: 1,
    locale: readLocale(rawUnknown['locale']),
    soundEnabled: typeof rawUnknown['soundEnabled'] === 'boolean' ? rawUnknown['soundEnabled'] : true,
    firstVisitedAtMs: readNullableNonNegativeInt(rawUnknown['firstVisitedAtMs']),
    firstEverClearedAtMs: readNullableNonNegativeInt(rawUnknown['firstEverClearedAtMs']),
    hasRecorded7dReturnPlay: rawUnknown['hasRecorded7dReturnPlay'] === true,
    combinatorTotalRuns: readNonNegativeInt(rawUnknown['combinatorTotalRuns'], 0),
    combinatorCrashedRuns: readNonNegativeInt(rawUnknown['combinatorCrashedRuns'], 0),
    combinatorStages,
    fermiTotalFires: readNonNegativeInt(rawUnknown['fermiTotalFires'], 0),
    fermiTrapFires: readNonNegativeInt(rawUnknown['fermiTrapFires'], 0),
    fermiStages,
  };

  return {
    state,
    recoveredFromCorruption: false,
    newerSchemaDetected: false,
  };
}

export interface StorageLoadOutcome {
  readonly state: PersistedArcadeStateV1;
  readonly isFirstVisit: boolean;
  readonly hadStorageException: boolean;
}

export class SafeStorageAdapter {
  private memoryState: PersistedArcadeStateV1;
  private storageAvailable = true;
  private fallbackBannerVisible = false;
  private recoveredFromCorruption = false;
  private newerSchemaFreeze = false;
  private readonly onNewerSchema?: () => void;

  constructor(onNewerSchema?: () => void) {
    this.memoryState = createDefaultPersistedState(null);
    this.onNewerSchema = onNewerSchema;
  }

  loadInitial(nowMs: number): StorageLoadOutcome {
    let rawText: string | null = null;
    try {
      const store = window.localStorage;
      rawText = store.getItem(PERSISTED_STORAGE_KEY);
    } catch {
      this.storageAvailable = false;
      this.fallbackBannerVisible = true;
      this.recoveredFromCorruption = false;
      this.memoryState = createDefaultPersistedState(nowMs);
      return {
        state: clonePersistedState(this.memoryState),
        isFirstVisit: true,
        hadStorageException: true,
      };
    }

    if (rawText === null) {
      const initial = createDefaultPersistedState(nowMs);
      this.memoryState = initial;
      const saved = this.tryWriteToBrowserStorage(initial);
      return {
        state: clonePersistedState(this.memoryState),
        isFirstVisit: true,
        hadStorageException: !saved,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      this.recoveredFromCorruption = true;
      const resetState = createDefaultPersistedState(nowMs);
      this.memoryState = resetState;
      const saved = this.tryWriteToBrowserStorage(resetState);
      return {
        state: clonePersistedState(this.memoryState),
        isFirstVisit: true,
        hadStorageException: !saved,
      };
    }

    const sanitized = sanitizePersistedPayload(parsed);
    if (sanitized.newerSchemaDetected) {
      this.newerSchemaFreeze = true;
      this.memoryState = sanitized.state;
      this.onNewerSchema?.();
      return {
        state: clonePersistedState(this.memoryState),
        isFirstVisit: false,
        hadStorageException: false,
      };
    }

    if (sanitized.recoveredFromCorruption) {
      this.recoveredFromCorruption = true;
      const resetState = createDefaultPersistedState(nowMs);
      this.memoryState = resetState;
      const saved = this.tryWriteToBrowserStorage(resetState);
      return {
        state: clonePersistedState(this.memoryState),
        isFirstVisit: true,
        hadStorageException: !saved,
      };
    }

    const isFirstVisit = sanitized.state.firstVisitedAtMs === null;
    const loadedState: PersistedArcadeStateV1 = isFirstVisit
      ? { ...sanitized.state, firstVisitedAtMs: nowMs }
      : sanitized.state;
    this.memoryState = loadedState;
    if (isFirstVisit) {
      this.tryWriteToBrowserStorage(loadedState);
    }

    return {
      state: clonePersistedState(this.memoryState),
      isFirstVisit,
      hadStorageException: false,
    };
  }

  save(nextState: PersistedArcadeStateV1): boolean {
    this.memoryState = clonePersistedState(nextState);
    if (!this.storageAvailable || this.newerSchemaFreeze) {
      return false;
    }
    return this.tryWriteToBrowserStorage(this.memoryState);
  }

  getStateSnapshot(): PersistedArcadeStateV1 {
    return clonePersistedState(this.memoryState);
  }

  getStatusSnapshot(): StorageStatus {
    return {
      storageAvailable: this.storageAvailable,
      fallbackBannerVisible: this.fallbackBannerVisible,
      persistedKey: 'logic_arcade_state_v1',
      recoveredFromCorruption: this.recoveredFromCorruption,
    };
  }

  isNewerSchemaFrozen(): boolean {
    return this.newerSchemaFreeze;
  }

  attachCrossTabListener(): () => void {
    const onStorage = (ev: StorageEvent): void => {
      if (ev.key !== PERSISTED_STORAGE_KEY || !ev.newValue) {
        return;
      }
      try {
        const incoming: unknown = JSON.parse(ev.newValue);
        if (isPlainRecord(incoming)) {
          const ver = incoming['schemaVersion'];
          if (typeof ver === 'number' && ver > CURRENT_SCHEMA_VERSION) {
            this.newerSchemaFreeze = true;
            this.onNewerSchema?.();
          }
        }
      } catch {
        /* Ignore malformed external storage events */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }

  private tryWriteToBrowserStorage(state: PersistedArcadeStateV1): boolean {
    try {
      const store = window.localStorage;
      store.setItem(PERSISTED_STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      this.storageAvailable = false;
      this.fallbackBannerVisible = true;
      return false;
    }
  }
}
