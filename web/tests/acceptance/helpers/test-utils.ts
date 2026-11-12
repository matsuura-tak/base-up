import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  PERSISTED_STORAGE_KEY,
  type ArcadeTestApi,
  type PersistedArcadeStateV1,
} from './contracts.js';

export interface PageMonitors {
  uncaughtErrors: string[];
  consoleErrors: string[];
  externalRequests: string[];
  audioAssetRequests: string[];
  failedRequests: string[];
}

const AUDIO_FILE_PATTERN = /\.(mp3|wav|ogg|m4a|aac|flac|opus)(\?|$)/i;

export function attachPageMonitors(page: Page, allowedOrigin = 'http://127.0.0.1:4173'): PageMonitors {
  const monitors: PageMonitors = {
    uncaughtErrors: [],
    consoleErrors: [],
    externalRequests: [],
    audioAssetRequests: [],
    failedRequests: [],
  };

  page.on('pageerror', (err) => {
    monitors.uncaughtErrors.push(err.message);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      monitors.consoleErrors.push(msg.text());
    }
  });

  page.on('request', (req) => {
    const url = req.url();
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) {
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.origin !== allowedOrigin) {
        monitors.externalRequests.push(url);
      }
      if (req.resourceType() === 'media' || AUDIO_FILE_PATTERN.test(parsed.pathname)) {
        monitors.audioAssetRequests.push(url);
      }
    } catch {
      monitors.externalRequests.push(url);
    }
  });

  page.on('requestfailed', (req) => {
    monitors.failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText ?? 'failed'})`);
  });

  return monitors;
}

export async function expectZeroAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.map((n) => n.html),
  }));
  expect(summary).toEqual([]);
}

export async function seedPersistedState(
  page: Page,
  seed: PersistedArcadeStateV1,
): Promise<void> {
  await page.addInitScript(
    ({ key, payload }) => {
      const flagKey = '__arcade_seed_applied__';
      if (window.sessionStorage.getItem(flagKey) !== '1') {
        window.localStorage.setItem(key, JSON.stringify(payload));
        window.sessionStorage.setItem(flagKey, '1');
      }
    },
    { key: PERSISTED_STORAGE_KEY, payload: seed },
  );
}

export async function invokeTestApi<K extends keyof ArcadeTestApi>(
  page: Page,
  method: K,
): Promise<ReturnType<ArcadeTestApi[K]>> {
  return page.evaluate((methodName) => {
    const api = window.__ARCADE_TEST_API__;
    if (!api) {
      throw new Error('window.__ARCADE_TEST_API__ is not registered');
    }
    const fn = api[methodName] as () => ReturnType<ArcadeTestApi[K]>;
    return fn.call(api);
  }, method);
}

export async function assignCombinatorModules(
  page: Page,
  moduleIds: readonly [string, string, string],
): Promise<void> {
  for (let idx = 0; idx < moduleIds.length; idx += 1) {
    const moduleId = moduleIds[idx];
    const cardButton = page.locator(
      `button[data-testid^="combinator-module-card-"][data-module-id="${moduleId}"]`,
    );
    await expect(cardButton).toBeVisible();
    await expect(cardButton).toBeEnabled();
    await cardButton.click();
    await expect(page.getByTestId(`combinator-slot-${idx + 1}`)).toHaveAttribute(
      'data-assigned-module',
      moduleId,
    );
  }
}

export async function selectFermiHypothesisCards(
  page: Page,
  choices: readonly [number, number, number],
): Promise<void> {
  for (let slotIndex = 0; slotIndex < 3; slotIndex += 1) {
    const act = slotIndex + 1;
    const cardNumber = choices[slotIndex];
    const cardButton = page.getByTestId(`fermi-card-act${act}-${cardNumber}`);
    await expect(cardButton).toBeVisible();
    await expect(cardButton).toBeEnabled();
    await cardButton.click();
    await expect(cardButton).toHaveAttribute('aria-pressed', 'true');
  }
}

export async function tabToElementByTestId(
  page: Page,
  targetTestId: string,
  maxTabs = 80,
): Promise<void> {
  const checkActive = async () =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) {
        return { testId: null, outlineWidthPx: 0, outlineStyle: 'none' };
      }
      const style = window.getComputedStyle(el);
      return {
        testId: el.getAttribute('data-testid'),
        outlineWidthPx: Number.parseFloat(style.outlineWidth || '0'),
        outlineStyle: style.outlineStyle,
      };
    });

  for (const key of ['Tab', 'Shift+Tab'] as const) {
    for (let i = 0; i < maxTabs; i += 1) {
      const activeInfo = await checkActive();
      if (activeInfo.testId === targetTestId) {
        expect(activeInfo.outlineStyle).not.toBe('none');
        expect(activeInfo.outlineWidthPx).toBeGreaterThanOrEqual(2);
        return;
      }
      await page.keyboard.press(key);
    }
  }
  throw new Error(`Keyboard navigation did not reach data-testid="${targetTestId}" within ${maxTabs} presses`);
}
