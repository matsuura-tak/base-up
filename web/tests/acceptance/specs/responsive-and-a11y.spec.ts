import { expect, test, type Page } from '@playwright/test';
import { createPersistedStateSeed } from '../helpers/contracts.js';
import {
  attachPageMonitors,
  expectZeroAxeViolations,
  seedPersistedState,
  tabToElementByTestId,
} from '../helpers/test-utils.js';

interface ViewportZoomCondition {
  label: string;
  width: number;
  height: number;
  fontScalePercent: 100 | 200;
}

const DISPLAY_CONDITIONS: readonly ViewportZoomCondition[] = [
  { label: '320px_100pct', width: 320, height: 640, fontScalePercent: 100 },
  { label: '1280px_100pct', width: 1280, height: 800, fontScalePercent: 100 },
  { label: '1280px_200pct', width: 1280, height: 800, fontScalePercent: 200 },
  { label: '320px_200pct', width: 320, height: 640, fontScalePercent: 200 },
] as const;

const TARGET_SCREENS = [
  { path: '/', testId: 'screen-lobby' },
  { path: '/combinator?stage=1', testId: 'screen-combinator' },
  { path: '/fermi?stage=1', testId: 'screen-fermi' },
  { path: '/diagnostic', testId: 'screen-diagnostic' },
] as const;

async function auditLayoutAndTargets(page: Page, conditionLabel: string, path: string): Promise<void> {
  const metrics = await page.evaluate(() => {
    const horizontalOverflowPx =
      document.documentElement.scrollWidth - window.innerWidth;

    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('button, a[href], textarea, select, input'),
    );

    const undersized: string[] = [];
    const occluded: string[] = [];

    for (const el of candidates) {
      const testId = el.getAttribute('data-testid') ?? el.tagName.toLowerCase();
      if (testId === 'skip-to-main-link') {
        /* スキップリンクはキーボードフォーカス時に可視展開される標準パターン */
        continue;
      }
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        continue;
      }

      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        continue;
      }

      if (rect.width < 23.95 || rect.height < 23.95) {
        undersized.push(
          `${testId} (${rect.width.toFixed(1)}x${rect.height.toFixed(1)}px)`,
        );
      }

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (cx >= 0 && cx <= window.innerWidth && cy >= 0 && cy <= window.innerHeight) {
        const hit = document.elementFromPoint(cx, cy);
        if (hit && !el.contains(hit) && !hit.contains(el)) {
          const hitId = hit.getAttribute('data-testid') ?? hit.tagName.toLowerCase();
          occluded.push(`${testId} covered by ${hitId}`);
        }
      }
    }

    return {
      horizontalOverflowPx,
      checkedCount: candidates.length,
      undersized,
      occluded,
    };
  });

  expect(
    metrics.horizontalOverflowPx,
    `Horizontal overflow at ${conditionLabel} on ${path}`,
  ).toBeLessThanOrEqual(0);
  expect(metrics.checkedCount).toBeGreaterThan(0);
  expect(metrics.undersized, `Undersized targets at ${conditionLabel} on ${path}`).toEqual([]);
  expect(metrics.occluded, `Occluded targets at ${conditionLabel} on ${path}`).toEqual([]);
}

test.describe('Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite', () => {
  test('AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);

    /* 両モードクリア済シードでレーダーチャート・コピーボタンを含む全要素を描画対象にする */
    await seedPersistedState(
      page,
      createPersistedStateSeed({
        combinatorTotalRuns: 1,
        combinatorCrashedRuns: 0,
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
        fermiTrapFires: 0,
        fermiStages: {
          '1': {
            stageId: 1,
            cleared: true,
            bestJudgment: 'PERFECT_ORDER',
            totalFireAttempts: 1,
          },
        },
      }),
    );

    for (const cond of DISPLAY_CONDITIONS) {
      await page.setViewportSize({ width: cond.width, height: cond.height });

      for (const screen of TARGET_SCREENS) {
        const resp = await page.goto(screen.path);
        expect(resp?.status()).toBe(200);
        await expect(page.getByTestId(screen.testId)).toBeVisible();

        await page.evaluate((scalePct) => {
          document.documentElement.style.fontSize = `${scalePct}%`;
        }, cond.fontScalePercent);

        await auditLayoutAndTargets(page, cond.label, screen.path);

        if (cond.fontScalePercent === 100 && cond.width === 1280) {
          await page.emulateMedia({ colorScheme: 'light' });
          await expectZeroAxeViolations(page);
          await page.emulateMedia({ colorScheme: 'dark' });
          await expectZeroAxeViolations(page);
          await page.emulateMedia({ colorScheme: 'light' });
        }
      }
    }

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.addInitScript(() => {
      window.__CAPTURED_CLIPBOARD_TEXT__ = null;
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            window.__CAPTURED_CLIPBOARD_TEXT__ = text;
          },
        },
      });
    });

    const resp = await page.goto('/');
    expect(resp?.status()).toBe(200);
    await expect(page.getByTestId('screen-lobby')).toBeVisible();

    /* 1. キーボードのみでトップからモード1 STAGE 1 を開く */
    await tabToElementByTestId(page, 'lobby-primary-start-button');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('screen-combinator')).toBeVisible();

    /* 2. キーボードのみで3モジュールを配置し RUN を実行して STAGE CLEAR */
    await tabToElementByTestId(page, 'combinator-module-card-1');
    await page.keyboard.press('Enter');
    await tabToElementByTestId(page, 'combinator-module-card-2');
    await page.keyboard.press('Enter');
    await tabToElementByTestId(page, 'combinator-module-card-3');
    await page.keyboard.press('Enter');

    /* RUN ボタンへ Tab / Shift+Tab（macOS WebKit は Alt+Tab / Alt+Shift+Tab）で移動して Enter 実行 */
    await tabToElementByTestId(page, 'combinator-run-button');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'STAGE CLEAR',
      { timeout: 1500 },
    );

    /* 3. キーボードのみで上部ナビからモード2へ移動 */
    await tabToElementByTestId(page, 'nav-mode-fermi');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('screen-fermi')).toBeVisible();

    /* 4. キーボードのみで ACT 1〜3 の仮説カードを選択し FIRE で PERFECT ORDER */
    await tabToElementByTestId(page, 'fermi-card-act1-1');
    await page.keyboard.press('Enter');
    await tabToElementByTestId(page, 'fermi-card-act2-1');
    await page.keyboard.press('Enter');
    await tabToElementByTestId(page, 'fermi-card-act3-1');
    await page.keyboard.press('Enter');

    await tabToElementByTestId(page, 'fermi-fire-button');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('fermi-result-status')).toHaveAttribute(
      'data-status',
      'PERFECT ORDER',
      { timeout: 1500 },
    );

    /* 5. キーボードのみで思考力診断カルテへ移動し、診断結果をコピー */
    await tabToElementByTestId(page, 'nav-mode-diagnostic');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('screen-diagnostic')).toBeVisible();
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'A');

    await tabToElementByTestId(page, 'diagnostic-copy-button');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('diagnostic-copy-toast')).toBeVisible();

    const copied = await page.evaluate(() => window.__CAPTURED_CLIPBOARD_TEXT__);
    expect(copied).toContain('A');

    expect(monitors.uncaughtErrors).toEqual([]);
  });
});
