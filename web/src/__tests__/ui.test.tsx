import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';

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
