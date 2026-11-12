import { expect, test } from '@playwright/test';
import {
  PERSISTED_STORAGE_KEY,
  createPersistedStateSeed,
  type CombinatorStageRecord,
  type FermiStageRecord,
  type PersistedArcadeStateV1,
} from '../helpers/contracts.js';
import {
  assignCombinatorModules,
  attachPageMonitors,
  expectZeroAxeViolations,
  invokeTestApi,
  seedPersistedState,
  selectFermiHypothesisCards,
} from '../helpers/test-utils.js';

function buildBothClearedRankASeed(): PersistedArcadeStateV1 {
  return createPersistedStateSeed({
    firstEverClearedAtMs: 1731369660000,
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
  });
}

test.describe('Screen 4: Diagnostic Chart Acceptance Suite', () => {
  test('AC-10 / AC10_両モードクリア後の5軸整数スコア算出・正五角形レーダーチャート描画・総合認定ランク表示', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    /* モード1 STAGE 1 を1発クリア */
    const resp1 = await page.goto('/combinator?stage=1');
    expect(resp1?.status()).toBe(200);
    await assignCombinatorModules(page, ['s1-seed', 's1-amp2', 's1-amp2b']);
    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'STAGE CLEAR',
      { timeout: 1500 },
    );

    /* 初回クリア確定後に再プレイしても runAttemptsBeforeFirstClear=1 が上書きされないことを確認 */
    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'STAGE CLEAR',
      { timeout: 1500 },
    );

    /* モード2 STAGE 1 を罠0枚の PERFECT ORDER で1発クリア */
    await page.getByTestId('nav-mode-fermi').click();
    await expect(page.getByTestId('screen-fermi')).toBeVisible();
    await selectFermiHypothesisCards(page, [1, 1, 1]);
    await page.getByTestId('fermi-fire-button').click();
    await expect(page.getByTestId('fermi-result-status')).toHaveAttribute(
      'data-status',
      'PERFECT ORDER',
      { timeout: 1500 },
    );

    /* 思考力診断カルテへ遷移 */
    await page.getByTestId('nav-mode-diagnostic').click();
    await expect(page.getByTestId('screen-diagnostic')).toBeVisible();
    await expect(page).toHaveTitle('思考力診断カルテ | LOGIC ARCADE');

    /*
     * PRD 11章の算出式による厳密な整数期待値:
     * C_1=1, F_count=1, a_1=1(e_1=1.0), R_1=2, K_1=0 -> 仕様読解力=64, 順序構築力=73, リソース制御力=73
     * C_2=1, q_1=1.0, F_2=1, T_2=0 -> フェルミ概算センス=73, 仮説精度=73
     * overallScore = Math.round((64+73+73+73+73)/5) = 71 -> ランク A (65..79)
     */
    await expect(page.getByTestId('diagnostic-axis-spec-score')).toHaveText('64');
    await expect(page.getByTestId('diagnostic-axis-sequence-score')).toHaveText('73');
    await expect(page.getByTestId('diagnostic-axis-resource-score')).toHaveText('73');
    await expect(page.getByTestId('diagnostic-axis-fermi-score')).toHaveText('73');
    await expect(page.getByTestId('diagnostic-axis-hypothesis-score')).toHaveText('73');

    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'A');
    await expect(page.getByTestId('diagnostic-overall-rank')).toContainText('A');
    await expect(page.getByTestId('diagnostic-overall-score')).toContainText('71');

    /* 正五角形レーダーチャート SVG と5頂点ポリゴンの描画確認 */
    const radarSvg = page.getByTestId('diagnostic-radar-chart');
    const radarPolygon = page.getByTestId('diagnostic-radar-polygon');
    await expect(radarSvg).toBeVisible();
    await expect(radarPolygon).toBeVisible();
    await expect(radarPolygon).toHaveAttribute('data-vertex-count', '5');
    const pointsAttr = (await radarPolygon.getAttribute('points'))?.trim() ?? '';
    const coordinatePairs = pointsAttr.split(/\s+/).filter((token) => token.includes(','));
    expect(coordinatePairs).toHaveLength(5);

    /* コピー共有ボタンが活性状態（非 disabled） */
    await expect(page.getByTestId('diagnostic-copy-button')).toBeEnabled();
    await expect(page.getByTestId('diagnostic-unranked-notice')).toHaveCount(0);

    await expectZeroAxeViolations(page);
    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-10 / AC10_思考力診断カルテのSプラス・S・B・Cランク境界値と5軸算出式の網羅検証', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    const resp = await page.goto('/diagnostic');
    expect(resp?.status()).toBe(200);

    const applySeedAndReload = async (seed: PersistedArcadeStateV1): Promise<void> => {
      await page.evaluate(
        ({ key, value }) => {
          window.localStorage.setItem(key, JSON.stringify(value));
        },
        { key: PERSISTED_STORAGE_KEY, value: seed },
      );
      await page.reload();
      await expect(page.getByTestId('screen-diagnostic')).toBeVisible();
    };

    /* 1. S+ ランク（全19ステージ1発完璧クリア -> 全軸100, overallScore=100 -> S+） */
    const allCombinatorCleared: Record<string, CombinatorStageRecord> = {};
    for (let s = 1; s <= 10; s += 1) {
      allCombinatorCleared[String(s)] = {
        stageId: s,
        cleared: true,
        runAttemptsBeforeFirstClear: 1,
        totalRunAttempts: 1,
        bestScore: 1500,
      };
    }
    const allFermiCleared: Record<string, FermiStageRecord> = {};
    for (let s = 1; s <= 9; s += 1) {
      allFermiCleared[String(s)] = {
        stageId: s,
        cleared: true,
        bestJudgment: 'PERFECT_ORDER',
        totalFireAttempts: 1,
      };
    }
    await applySeedAndReload(
      createPersistedStateSeed({
        combinatorTotalRuns: 10,
        combinatorCrashedRuns: 0,
        combinatorStages: allCombinatorCleared,
        fermiTotalFires: 9,
        fermiTrapFires: 0,
        fermiStages: allFermiCleared,
      }),
    );
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'S+');
    await expect(page.getByTestId('diagnostic-overall-score')).toContainText('100');
    const sPlusProfile = await invokeTestApi(page, 'getDiagnosticProfile');
    expect(sPlusProfile.axes).toEqual({
      specComprehension: 100,
      sequenceDesign: 100,
      resourceControl: 100,
      fermiSense: 100,
      hypothesisPrecision: 100,
    });

    /* 2. S ランク（C_1=5 一発クリア, C_2=5 PERFECT罠0 -> 80,85,85,87,87 => overallScore=85 -> S） */
    const fiveCombinator: Record<string, CombinatorStageRecord> = {};
    for (let s = 1; s <= 5; s += 1) {
      fiveCombinator[String(s)] = {
        stageId: s,
        cleared: true,
        runAttemptsBeforeFirstClear: 1,
        totalRunAttempts: 1,
        bestScore: 1200,
      };
    }
    const fiveFermi: Record<string, FermiStageRecord> = {};
    for (let s = 1; s <= 5; s += 1) {
      fiveFermi[String(s)] = {
        stageId: s,
        cleared: true,
        bestJudgment: 'PERFECT_ORDER',
        totalFireAttempts: 1,
      };
    }
    await applySeedAndReload(
      createPersistedStateSeed({
        combinatorTotalRuns: 5,
        combinatorCrashedRuns: 0,
        combinatorStages: fiveCombinator,
        fermiTotalFires: 5,
        fermiTrapFires: 0,
        fermiStages: fiveFermi,
      }),
    );
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'S');
    await expect(page.getByTestId('diagnostic-overall-score')).toContainText('85');

    /* 3. B ランク（C_1=1 で2回目クリア・クラッシュ0, C_2=1 PERFECT罠0 -> 4,56,73,73,73 => overallScore=56 -> B） */
    await applySeedAndReload(
      createPersistedStateSeed({
        combinatorTotalRuns: 2,
        combinatorCrashedRuns: 0,
        combinatorStages: {
          '1': {
            stageId: 1,
            cleared: true,
            runAttemptsBeforeFirstClear: 2,
            totalRunAttempts: 2,
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
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'B');
    await expect(page.getByTestId('diagnostic-overall-score')).toContainText('56');

    /* 4. C ランク（C_1=1 で5回目クリア・クラッシュ4, C_2=1 GOOD_RANGE・罠3/4 -> 4,3,17,45,21 => overallScore=18 -> C） */
    await applySeedAndReload(
      createPersistedStateSeed({
        combinatorTotalRuns: 5,
        combinatorCrashedRuns: 4,
        combinatorStages: {
          '1': {
            stageId: 1,
            cleared: true,
            runAttemptsBeforeFirstClear: 5,
            totalRunAttempts: 5,
            bestScore: 1105,
          },
        },
        fermiTotalFires: 4,
        fermiTrapFires: 3,
        fermiStages: {
          '1': {
            stageId: 1,
            cleared: true,
            bestJudgment: 'GOOD_RANGE',
            totalFireAttempts: 4,
          },
        },
      }),
    );
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'C');
    await expect(page.getByTestId('diagnostic-overall-score')).toContainText('18');
    await expect(page.getByTestId('diagnostic-axis-spec-score')).toHaveText('4');
    await expect(page.getByTestId('diagnostic-axis-sequence-score')).toHaveText('3');
    await expect(page.getByTestId('diagnostic-axis-resource-score')).toHaveText('17');
    await expect(page.getByTestId('diagnostic-axis-fermi-score')).toHaveText('45');
    await expect(page.getByTestId('diagnostic-axis-hypothesis-score')).toHaveText('21');

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-11 / AC11_思考力診断カルテの結果サマリーテキストのクリップボード書き込みと2秒以上の完了通知表示', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.clock.install();
    await seedPersistedState(page, buildBothClearedRankASeed());

    await page.addInitScript(() => {
      window.__CAPTURED_CLIPBOARD_TEXT__ = null;
      const existingClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            window.__CAPTURED_CLIPBOARD_TEXT__ = text;
            if (existingClipboard && typeof existingClipboard.writeText === 'function') {
              try {
                await existingClipboard.writeText(text);
              } catch {
                /* ヘッドレスOS権限差異に影響されず書き込み要求引数と成功解決を検証 */
              }
            }
          },
          readText: async () => window.__CAPTURED_CLIPBOARD_TEXT__ ?? '',
        },
      });
    });

    const response = await page.goto('/diagnostic');
    expect(response?.status()).toBe(200);

    const copyButton = page.getByTestId('diagnostic-copy-button');
    await expect(copyButton).toBeEnabled();
    await copyButton.click();

    const toast = page.getByTestId('diagnostic-copy-toast');
    await expect(toast).toBeVisible();

    const copiedText = await page.evaluate(() => window.__CAPTURED_CLIPBOARD_TEXT__);
    expect(copiedText).toBeTruthy();
    expect(copiedText!.length).toBeGreaterThan(0);
    expect(copiedText).toContain('A');
    expect(copiedText).toContain('71');
    expect(copiedText).toContain('仕様読解力');
    expect(copiedText).toContain('64');
    expect(copiedText).toContain('順序構築力');
    expect(copiedText).toContain('リソース制御力');
    expect(copiedText).toContain('フェルミ概算センス');
    expect(copiedText).toContain('仮説精度');
    expect(copiedText).toContain('73');

    /* 2.0秒（2000ms）以上経過した時点でも完了通知が画面上に表示され続けていること */
    await page.clock.fastForward(2100);
    await expect(toast).toBeVisible();

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-12 / AC12_認定ランク未解放3パターン（履歴0件・失敗のみ・片モードのみクリア）のUNRANKED表示と開始導線', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);

    /* パターン1：プレイ履歴 0件の初期状態 */
    const resp = await page.goto('/diagnostic');
    expect(resp?.status()).toBe(200);
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute(
      'data-rank',
      'UNRANKED',
    );
    await expect(page.getByTestId('diagnostic-copy-button')).toBeDisabled();
    await expect(page.getByTestId('diagnostic-axis-spec-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-axis-sequence-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-axis-resource-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-axis-fermi-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-axis-hypothesis-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-start-combinator-button')).toHaveAttribute(
      'href',
      '/combinator?stage=1',
    );
    await expect(page.getByTestId('diagnostic-start-fermi-button')).toHaveAttribute(
      'href',
      '/fermi?stage=1',
    );

    const setStorageAndReload = async (seed: PersistedArcadeStateV1): Promise<void> => {
      await page.evaluate(
        ({ key, value }) => {
          window.localStorage.setItem(key, JSON.stringify(value));
        },
        { key: PERSISTED_STORAGE_KEY, value: seed },
      );
      await page.reload();
    };

    /* パターン2：失敗履歴のみでクリア 0件の状態 */
    await setStorageAndReload(
      createPersistedStateSeed({
        combinatorTotalRuns: 3,
        combinatorCrashedRuns: 2,
        combinatorStages: {
          '1': {
            stageId: 1,
            cleared: false,
            runAttemptsBeforeFirstClear: null,
            totalRunAttempts: 3,
            bestScore: null,
          },
        },
        fermiTotalFires: 2,
        fermiTrapFires: 1,
        fermiStages: {
          '1': {
            stageId: 1,
            cleared: false,
            bestJudgment: null,
            totalFireAttempts: 2,
          },
        },
      }),
    );
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute(
      'data-rank',
      'UNRANKED',
    );
    await expect(page.getByTestId('diagnostic-copy-button')).toBeDisabled();
    await expect(page.getByTestId('diagnostic-axis-spec-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-axis-fermi-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-start-combinator-button')).toBeVisible();
    await expect(page.getByTestId('diagnostic-start-fermi-button')).toBeVisible();

    /* パターン3a：モード1のみクリア・モード2クリア 0件の準空状態（C_1=2, C_2=0） */
    await setStorageAndReload(
      createPersistedStateSeed({
        combinatorTotalRuns: 2,
        combinatorCrashedRuns: 0,
        combinatorStages: {
          '1': {
            stageId: 1,
            cleared: true,
            runAttemptsBeforeFirstClear: 1,
            totalRunAttempts: 1,
            bestScore: 1105,
          },
          '2': {
            stageId: 2,
            cleared: true,
            runAttemptsBeforeFirstClear: 1,
            totalRunAttempts: 1,
            bestScore: 1150,
          },
        },
      }),
    );
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute(
      'data-rank',
      'UNRANKED',
    );
    await expect(page.getByTestId('diagnostic-copy-button')).toBeDisabled();
    /* モード1の3軸のみ算出値（68, 76, 76）、未クリアのモード2軸は 0 */
    await expect(page.getByTestId('diagnostic-axis-spec-score')).toHaveText('68');
    await expect(page.getByTestId('diagnostic-axis-sequence-score')).toHaveText('76');
    await expect(page.getByTestId('diagnostic-axis-resource-score')).toHaveText('76');
    await expect(page.getByTestId('diagnostic-axis-fermi-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-axis-hypothesis-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-start-fermi-button')).toBeVisible();
    await expect(page.getByTestId('diagnostic-start-combinator-button')).toHaveCount(0);

    /* パターン3b：モード2のみクリア・モード1クリア 0件の準空状態（C_1=0, C_2=3） */
    await setStorageAndReload(
      createPersistedStateSeed({
        fermiTotalFires: 3,
        fermiTrapFires: 0,
        fermiStages: {
          '1': { stageId: 1, cleared: true, bestJudgment: 'PERFECT_ORDER', totalFireAttempts: 1 },
          '2': { stageId: 2, cleared: true, bestJudgment: 'PERFECT_ORDER', totalFireAttempts: 1 },
          '3': { stageId: 3, cleared: true, bestJudgment: 'PERFECT_ORDER', totalFireAttempts: 1 },
        },
      }),
    );
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute(
      'data-rank',
      'UNRANKED',
    );
    await expect(page.getByTestId('diagnostic-copy-button')).toBeDisabled();
    await expect(page.getByTestId('diagnostic-axis-spec-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-axis-sequence-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-axis-resource-score')).toHaveText('0');
    await expect(page.getByTestId('diagnostic-axis-fermi-score')).toHaveText('80');
    await expect(page.getByTestId('diagnostic-axis-hypothesis-score')).toHaveText('80');
    await expect(page.getByTestId('diagnostic-start-combinator-button')).toBeVisible();
    await expect(page.getByTestId('diagnostic-start-fermi-button')).toHaveCount(0);

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-20 / AC20_クリップボード書き込み拒否および未定義時の失敗通知と手動コピー用テキスト領域展開', async ({
    page,
    browser,
  }) => {
    const monitors = attachPageMonitors(page);
    await seedPersistedState(page, buildBothClearedRankASeed());

    /* (a) navigator.clipboard.writeText が NotAllowedError を送出する状態 */
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {
            throw new DOMException('Clipboard write permission denied', 'NotAllowedError');
          },
        },
      });
    });

    const response = await page.goto('/diagnostic');
    expect(response?.status()).toBe(200);

    await page.getByTestId('diagnostic-copy-button').click();

    await expect(page.getByTestId('diagnostic-copy-toast')).toHaveCount(0);
    await expect(page.getByTestId('diagnostic-copy-error')).toBeVisible();

    const manualTextarea = page.getByTestId('diagnostic-manual-copy-textarea');
    await expect(manualTextarea).toBeVisible();
    await expect(manualTextarea).toHaveAttribute('readonly', '');

    const manualText = await manualTextarea.inputValue();
    expect(manualText).toContain('A');
    expect(manualText).toContain('71');
    expect(manualText).toContain('仕様読解力');
    expect(manualText).toContain('64');
    expect(manualText).toContain('順序構築力');
    expect(manualText).toContain('リソース制御力');
    expect(manualText).toContain('フェルミ概算センス');
    expect(manualText).toContain('仮説精度');
    expect(manualText).toContain('73');

    await expect(page.getByLabel('手動コピー用の診断結果サマリー')).toBeVisible();
    expect(monitors.uncaughtErrors).toEqual([]);

    /* (b) navigator.clipboard 自体が undefined の状態 */
    const undefinedClipContext = await browser.newContext();
    const pageB = await undefinedClipContext.newPage();
    const monitorsB = attachPageMonitors(pageB);
    await seedPersistedState(pageB, buildBothClearedRankASeed());
    await pageB.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: undefined,
      });
    });

    const respB = await pageB.goto('/diagnostic');
    expect(respB?.status()).toBe(200);
    await pageB.getByTestId('diagnostic-copy-button').click();
    await expect(pageB.getByTestId('diagnostic-copy-error')).toBeVisible();
    await expect(pageB.getByTestId('diagnostic-manual-copy-textarea')).toHaveValue(/仕様読解力/);
    expect(monitorsB.uncaughtErrors).toEqual([]);
    await undefinedClipContext.close();
  });
});
