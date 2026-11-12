import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { PersistedArcadeStateV1 } from '../domain/types';
import { PERSISTED_STORAGE_KEY, createDefaultPersistedState } from '../storage/safeStorage';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

function ThrowingWidget(): ReactElement {
  throw new Error('Simulated render crash');
}

describe('App UI shell, test seam, i18n toggle, and ErrorBoundary', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    window.scrollTo = () => {
      /* Stub scrollTo in jsdom */
    };
    HTMLCanvasElement.prototype.getContext = () => null;
    window.localStorage.clear();
    window.history.replaceState(null, '', '/');
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
    window.localStorage.clear();
  });

  it('registers window.__ARCADE_TEST_API__, switches JA/EN locale, toggles mute, and steps Mode 1', () => {
    act(() => {
      root.render(<App />);
    });

    const api = window.__ARCADE_TEST_API__;
    expect(api).toBeDefined();
    expect(document.documentElement.lang).toBe('ja');
    expect(document.title).toBe('モード選択 | LOGIC ARCADE');

    const eventsAfterBoot = api!.getEmittedEvents();
    expect(eventsAfterBoot.some((ev) => ev.event === 'Session Started')).toBe(true);

    const enButton = host.querySelector<HTMLButtonElement>('[data-testid="header-lang-en"]');
    expect(enButton).not.toBeNull();
    act(() => {
      enButton!.click();
    });
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Mode Select | LOGIC ARCADE');

    const soundToggle = host.querySelector<HTMLButtonElement>('[data-testid="header-sound-toggle"]');
    expect(soundToggle?.getAttribute('data-sound-state')).toBe('on');
    act(() => {
      soundToggle!.click();
    });
    expect(soundToggle?.getAttribute('data-sound-state')).toBe('off');
    expect(api!.getAudioState().masterGainValue).toBe(0);

    const navComb = host.querySelector<HTMLAnchorElement>('[data-testid="nav-mode-combinator"]');
    act(() => {
      navComb!.click();
    });
    expect(document.title).toBe('3-ACT COMBINATOR | LOGIC ARCADE');

    const telemetryEnDts = Array.from(
      host.querySelectorAll('[data-testid="combinator-telemetry-bar"] dt'),
    ).map((el) => el.textContent);
    expect(telemetryEnDts).toEqual(['Energy', 'Output', 'Heat']);
    expect(host.querySelector('[data-testid="combinator-module-card-1"]')?.textContent).toContain(
      'Energy Cost',
    );

    const jaButton = host.querySelector<HTMLButtonElement>('[data-testid="header-lang-ja"]');
    act(() => {
      jaButton!.click();
    });
    const telemetryJaDts = Array.from(
      host.querySelectorAll('[data-testid="combinator-telemetry-bar"] dt'),
    ).map((el) => el.textContent);
    expect(telemetryJaDts).toEqual([
      '残りエネルギー (ENERGY)',
      '現在出力 (OUTPUT)',
      '現在発熱 (HEAT)',
    ]);
    expect(host.querySelector('[data-testid="combinator-module-card-1"]')?.textContent).toContain(
      'エネルギーコスト',
    );

    for (const k of [1, 2, 3]) {
      const card = host.querySelector<HTMLButtonElement>(
        `[data-testid="combinator-module-card-${String(k)}"]`,
      );
      act(() => {
        card!.click();
      });
    }

    const stepButton = host.querySelector<HTMLButtonElement>('[data-testid="combinator-step-button"]');
    expect(stepButton?.disabled).toBe(false);
    act(() => {
      stepButton!.click();
    });
    const snapStepping = api!.getSimulationSnapshot();
    expect(snapStepping.status).toBe('STEPPING');
    expect(snapStepping.stepIndex).toBe(1);
    expect(snapStepping.officialAttemptCount).toBe(0);

    const resetButton = host.querySelector<HTMLButtonElement>(
      '[data-testid="combinator-reset-button"]',
    );
    act(() => {
      resetButton!.click();
    });
    const snapReset = api!.getSimulationSnapshot();
    expect(snapReset.status).toBe('IDLE');
    expect(snapReset.assignedSlots).toEqual(['s1-seed', 's1-amp2', 's1-amp2b']);
  });

  it('syncs manual-copy textarea text immediately on JA/EN toggle when clipboard fails (AC-20)', async () => {
    const unlockedState: PersistedArcadeStateV1 = {
      ...createDefaultPersistedState(1000),
      combinatorTotalRuns: 1,
      combinatorStages: {
        '1': {
          stageId: 1,
          cleared: true,
          runAttemptsBeforeFirstClear: 1,
          totalRunAttempts: 1,
          bestScore: 1105,
        },
      },
      fermiTotalFires: 1,
      fermiStages: {
        '1': {
          stageId: 1,
          cleared: true,
          bestJudgment: 'PERFECT_ORDER',
          totalFireAttempts: 1,
        },
      },
    };
    window.localStorage.setItem(PERSISTED_STORAGE_KEY, JSON.stringify(unlockedState));
    window.history.replaceState(null, '', '/diagnostic');

    const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error('Clipboard permission denied')),
      },
    });

    try {
      act(() => {
        root.render(<App />);
      });

      const copyButton = host.querySelector<HTMLButtonElement>(
        '[data-testid="diagnostic-copy-button"]',
      );
      expect(copyButton?.disabled).toBe(false);

      await act(async () => {
        copyButton!.click();
        await Promise.resolve();
      });

      const textarea = host.querySelector<HTMLTextAreaElement>(
        '[data-testid="diagnostic-manual-copy-textarea"]',
      );
      expect(textarea).not.toBeNull();
      expect(textarea!.value).toContain('LOGIC ARCADE 思考力診断カルテ');

      const enButton = host.querySelector<HTMLButtonElement>('[data-testid="header-lang-en"]');
      act(() => {
        enButton!.click();
      });
      expect(textarea!.value).toContain('LOGIC ARCADE Diagnostic Chart');

      const jaButton = host.querySelector<HTMLButtonElement>('[data-testid="header-lang-ja"]');
      act(() => {
        jaButton!.click();
      });
      expect(textarea!.value).toContain('LOGIC ARCADE 思考力診断カルテ');
    } finally {
      if (originalClipboardDescriptor) {
        Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
      } else {
        Reflect.deleteProperty(navigator, 'clipboard');
      }
    }
  });

  it('renders recovery button when ErrorBoundary catches a runtime render error', () => {
    const origConsoleError = console.error;
    console.error = () => {
      /* Suppress expected React error boundary log during unit assertion */
    };
    let runtimeErrors = 0;

    try {
      act(() => {
        root.render(
          <ErrorBoundary
            locale="ja"
            onRuntimeError={() => {
              runtimeErrors += 1;
            }}
          >
            <ThrowingWidget />
          </ErrorBoundary>,
        );
      });

      expect(runtimeErrors).toBe(1);
      const reloadButton = host.querySelector('[data-testid="error-reload-button"]');
      expect(reloadButton).not.toBeNull();
    } finally {
      console.error = origConsoleError;
    }
  });
});
