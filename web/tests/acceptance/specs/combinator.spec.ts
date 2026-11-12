import { expect, test } from '@playwright/test';
import { COMBINATOR_STAGE_EXPECTATIONS } from '../helpers/contracts.js';
import {
  assignCombinatorModules,
  attachPageMonitors,
  expectZeroAxeViolations,
  invokeTestApi,
} from '../helpers/test-utils.js';

test.describe('Mode 1: 3-ACT COMBINATOR Acceptance Suite', () => {
  test('AC-2 / AC2_モード1全10ステージ選択と5から7個のユニークモジュール4属性・目標・暴走上限表示', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    const response = await page.goto('/combinator');
    expect(response?.status()).toBe(200);

    await expect(page.getByTestId('screen-combinator')).toBeVisible();
    await expect(page).toHaveTitle('3-ACT COMBINATOR | LOGIC ARCADE');
    await expect(page.getByRole('heading', { level: 1, name: '3-ACT COMBINATOR' })).toBeVisible();

    for (const stageExp of COMBINATOR_STAGE_EXPECTATIONS) {
      const stageBtn = page.getByTestId(`combinator-stage-${stageExp.stageId}`);
      await expect(stageBtn).toBeVisible();
      await stageBtn.click();
      await expect(stageBtn).toHaveAttribute('aria-pressed', 'true');

      const targetEl = page.getByTestId('combinator-target-condition');
      const limitEl = page.getByTestId('combinator-overheat-limit');
      await expect(targetEl).toBeVisible();
      await expect(targetEl).toContainText('ターゲット達成条件');
      await expect(targetEl).toContainText(String(stageExp.targetOutput));

      await expect(limitEl).toBeVisible();
      await expect(limitEl).toContainText('暴走上限値');
      await expect(limitEl).toContainText(String(stageExp.overloadLimit));

      const moduleCards = page.locator('button[data-testid^="combinator-module-card-"]');
      const count = await moduleCards.count();
      expect(count).toBeGreaterThanOrEqual(5);
      expect(count).toBeLessThanOrEqual(7);
      expect(count).toBe(stageExp.moduleCount);

      const moduleIds = new Set<string>();
      for (let k = 1; k <= count; k += 1) {
        const card = page.getByTestId(`combinator-module-card-${k}`);
        await expect(card).toBeVisible();
        const moduleId = await card.getAttribute('data-module-id');
        expect(moduleId).toBeTruthy();
        moduleIds.add(moduleId!);

        const cardText = await card.innerText();
        expect(cardText).toContain('基本性能');
        expect(cardText).toContain('エネルギーコスト');
        expect(cardText).toContain('副作用');
        expect(cardText).toContain('発動条件');

        for (const attrKey of ['effect', 'cost', 'side-effect', 'condition'] as const) {
          const attrEl = page.getByTestId(`combinator-module-${attrKey}-${k}`);
          await expect(attrEl).toBeVisible();
          const attrVal = (await attrEl.innerText()).trim();
          expect(attrVal.length).toBeGreaterThan(0);
        }
      }
      expect(moduleIds.size).toBe(count);
    }

    await expectZeroAxeViolations(page);

    /* 範囲外の ?stage= 指定時は STAGE 1 に安全補正され案内通知が1件出る */
    await page.goto('/combinator?stage=99');
    await expect(page.getByTestId('stage-fallback-notice')).toBeVisible();
    await expect(page.getByTestId('combinator-stage-1')).toHaveAttribute('aria-pressed', 'true');

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-3 / AC3_モード1の3ステップ配置とRUN3秒以内シミュレーション再生・STAGE_CLEARスコア算出・クリア記録', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    const response = await page.goto('/combinator?stage=1');
    expect(response?.status()).toBe(200);

    await expect(page.getByTestId('combinator-simulation-canvas')).toBeVisible();
    await assignCombinatorModules(page, ['s1-seed', 's1-amp2', 's1-amp2b']);

    /* 3スロット満杯時は残りの未配置モジュールカードが disabled になる */
    await expect(page.getByTestId('combinator-module-card-4')).toBeDisabled();
    await expect(page.getByTestId('combinator-module-card-5')).toBeDisabled();

    const runButton = page.getByTestId('combinator-run-button');
    await expect(runButton).toBeEnabled();

    const startMs = await page.evaluate(() => window.performance.now());
    await runButton.click();

    const statusBadge = page.getByTestId('combinator-result-status');
    await expect(statusBadge).toHaveAttribute('data-status', 'STAGE CLEAR', { timeout: 3000 });
    const endMs = await page.evaluate(() => window.performance.now());
    expect(endMs - startMs).toBeLessThanOrEqual(3000);

    await expect(statusBadge).toContainText('STAGE CLEAR');
    await expect(page.getByTestId('combinator-score-value')).toContainText('1105');

    const snapshot = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(snapshot.status).toBe('STAGE CLEAR');
    expect(snapshot.stepIndex).toBe(3);
    expect(snapshot.currentParams).toEqual({
      energy: 0,
      output: 24,
      sideEffect: 9,
      shieldActive: false,
      score: 1105,
    });
    expect(snapshot.officialAttemptCount).toBe(1);

    const stage1Button = page.getByTestId('combinator-stage-1');
    await expect(stage1Button).toHaveAttribute('data-cleared', 'true');
    await expect(stage1Button).toContainText('S1 CLEAR');

    /* リロード後もクリア記録が永続化されていることを確認 */
    await page.reload();
    await expect(page.getByTestId('combinator-stage-1')).toHaveAttribute('data-cleared', 'true');
    const persisted = await invokeTestApi(page, 'getPersistedState');
    expect(persisted.combinatorStages['1']?.cleared).toBe(true);
    expect(persisted.combinatorStages['1']?.bestScore).toBe(1105);
    expect(persisted.combinatorStages['1']?.runAttemptsBeforeFirstClear).toBe(1);

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-4 / AC4_モード1全10ステージの全順列解存在・50パーセント以下・ステージ8から10非自明性の保証', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto('/combinator?stage=1');
    expect(response?.status()).toBe(200);

    const audit = await invokeTestApi(page, 'auditAllStages');
    expect(audit.combinatorStages).toHaveLength(10);

    for (let idx = 0; idx < 10; idx += 1) {
      const entry = audit.combinatorStages[idx]!;
      const expectedStageId = idx + 1;
      expect(entry.stageId).toBe(expectedStageId);
      expect(entry.moduleCount).toBeGreaterThanOrEqual(5);
      expect(entry.moduleCount).toBeLessThanOrEqual(7);
      const expectedPerms =
        entry.moduleCount * (entry.moduleCount - 1) * (entry.moduleCount - 2);
      expect(entry.totalPermutations).toBe(expectedPerms);
      expect(entry.clearCount).toBeGreaterThanOrEqual(1);
      expect(entry.clearRatio).toBeGreaterThan(0);
      expect(entry.clearRatio).toBeLessThanOrEqual(0.5);
      expect(entry.passesAc4).toBe(true);

      if (expectedStageId >= 8) {
        expect(entry.clearsWithoutSideEffectOrIf).toBe(0);
      }
    }

    /* 高難度ステージ8〜10（副作用活用 + if条件発火必須）を実画面の操作でも検証 */
    for (const highStageId of [8, 9, 10] as const) {
      const exp = COMBINATOR_STAGE_EXPECTATIONS[highStageId - 1]!;
      await page.getByTestId(`combinator-stage-${highStageId}`).click();
      await assignCombinatorModules(page, exp.clearSeq);
      await page.getByTestId('combinator-run-button').click();
      await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
        'data-status',
        'STAGE CLEAR',
        { timeout: 1500 },
      );
      await expect(page.getByTestId('combinator-score-value')).toContainText(
        String(exp.clearScore),
      );
      await expect(page.getByTestId(`combinator-stage-${highStageId}`)).toHaveAttribute(
        'data-cleared',
        'true',
      );
    }

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-5 / AC5_モード1のSTEP1手検証による試行回数非加算とRESET0.2秒以内スロット維持初期化', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    const response = await page.goto('/combinator?stage=1');
    expect(response?.status()).toBe(200);

    await assignCombinatorModules(page, ['s1-seed', 's1-amp2', 's1-amp2b']);
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'IDLE',
    );

    const stepButton = page.getByTestId('combinator-step-button');
    await expect(stepButton).toBeEnabled();
    await stepButton.click();

    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'STEPPING',
      { timeout: 1000 },
    );
    await expect(page.getByTestId('combinator-result-status')).toContainText('1/3');

    const steppingSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(steppingSnap.status).toBe('STEPPING');
    expect(steppingSnap.stepIndex).toBe(1);
    expect(steppingSnap.currentParams).toEqual({
      energy: 7,
      output: 6,
      sideEffect: 2,
      shieldActive: false,
      score: null,
    });
    /* STEP 検証では公式 RUN 試行回数・クリア履歴に加算しない */
    expect(steppingSnap.officialAttemptCount).toBe(0);
    expect(steppingSnap.stageAttemptCount).toBe(0);
    const persistedAfterStep = await invokeTestApi(page, 'getPersistedState');
    expect(persistedAfterStep.combinatorTotalRuns).toBe(0);

    await expect(page.getByTestId('combinator-param-energy')).toContainText('7');
    await expect(page.getByTestId('combinator-param-output')).toContainText('6');
    await expect(page.getByTestId('combinator-param-side-effect')).toContainText('2');

    /* RESET 押下から 0.2秒（200ms）以内に3スロット維持のまま初期値・IDLE へ戻る */
    const resetButton = page.getByTestId('combinator-reset-button');
    const resetStartMs = await page.evaluate(() => window.performance.now());
    await resetButton.click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'IDLE',
      { timeout: 200 },
    );
    const resetElapsedMs = (await page.evaluate(() => window.performance.now())) - resetStartMs;
    expect(resetElapsedMs).toBeLessThanOrEqual(200);

    await expect(page.getByTestId('combinator-slot-1')).toHaveAttribute(
      'data-assigned-module',
      's1-seed',
    );
    await expect(page.getByTestId('combinator-slot-2')).toHaveAttribute(
      'data-assigned-module',
      's1-amp2',
    );
    await expect(page.getByTestId('combinator-slot-3')).toHaveAttribute(
      'data-assigned-module',
      's1-amp2b',
    );

    const idleSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(idleSnap.status).toBe('IDLE');
    expect(idleSnap.stepIndex).toBe(0);
    expect(idleSnap.currentParams).toEqual({
      energy: 10,
      output: 0,
      sideEffect: 0,
      shieldActive: false,
      score: null,
    });

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-6 / AC6_モード1途中制約違反時のCRASHED中断と完走未達時のFAILED判定およびデバッグログ3項目表示', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto('/combinator?stage=1');
    expect(response?.status()).toBe(200);

    /* (a-1) エネルギー枯渇による CRASHED（STAGE 1, STEP 3 で ENERGY = -1 < 0） */
    await assignCombinatorModules(page, ['s1-seed', 's1-amp2', 's1-over']);
    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'CRASHED',
      { timeout: 1500 },
    );
    await expect(page.getByTestId('combinator-debug-log')).toBeVisible();
    await expect(page.getByTestId('combinator-debug-location')).toContainText('STEP 3');
    await expect(page.getByTestId('combinator-debug-reason')).toContainText('エネルギー枯渇');
    await expect(page.getByTestId('combinator-debug-values')).toContainText('0');
    await expect(page.getByTestId('combinator-debug-values')).toContainText('-1');

    const crashEnergySnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(crashEnergySnap.debugLog?.location).toBe('STEP 3');
    expect(crashEnergySnap.debugLog?.reason).toBe('ENERGY_DEPLETED');
    expect(crashEnergySnap.debugLog?.expectedValue).toBe(0);
    expect(crashEnergySnap.debugLog?.actualValue).toBe(-1);

    /* (b) 3手完走後のターゲット未達による FAILED（STAGE 1, FINAL CHECK で OUTPUT = 17 < 24） */
    await page.getByTestId('combinator-slot-3').click();
    const add5Card = page.locator(
      'button[data-testid^="combinator-module-card-"][data-module-id="s1-add5"]',
    );
    await add5Card.click();
    await page.getByTestId('combinator-run-button').click();

    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'FAILED',
      { timeout: 1500 },
    );
    await expect(page.getByTestId('combinator-debug-log')).toBeVisible();
    await expect(page.getByTestId('combinator-debug-location')).toContainText('FINAL CHECK');
    await expect(page.getByTestId('combinator-debug-reason')).toContainText('ターゲット未達');
    await expect(page.getByTestId('combinator-debug-values')).toContainText('24');
    await expect(page.getByTestId('combinator-debug-values')).toContainText('17');
    await expect(page.getByTestId('combinator-stage-1')).toHaveAttribute('data-cleared', 'false');

    const failedSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(failedSnap.stepIndex).toBe(3);
    expect(failedSnap.debugLog?.location).toBe('FINAL CHECK');
    expect(failedSnap.debugLog?.reason).toBe('TARGET_UNMET');
    expect(failedSnap.debugLog?.expectedValue).toBe(24);
    expect(failedSnap.debugLog?.actualValue).toBe(17);

    /* (a-2) 暴走上限超過による CRASHED（STAGE 2, STEP 3 で HEAT = 14 > 12）および STEP 1 途中中断 */
    await page.getByTestId('combinator-stage-2').click();
    await assignCombinatorModules(page, ['s2-cell', 's2-boost', 's2-burn']);
    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'CRASHED',
      { timeout: 1500 },
    );
    await expect(page.getByTestId('combinator-debug-location')).toContainText('STEP 3');
    await expect(page.getByTestId('combinator-debug-reason')).toContainText('暴走上限超過');
    await expect(page.getByTestId('combinator-debug-values')).toContainText('12');
    await expect(page.getByTestId('combinator-debug-values')).toContainText('14');

    /* STEP 1 時点で枯渇した場合に後続ステップを実行せず STEP 1 で中断すること */
    await page.getByTestId('combinator-slot-1').click();
    await page.getByTestId('combinator-slot-2').click();
    await page.getByTestId('combinator-slot-3').click();
    await assignCombinatorModules(page, ['s2-tri', 's2-cell', 's2-patch']);
    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'CRASHED',
      { timeout: 1500 },
    );
    await expect(page.getByTestId('combinator-debug-location')).toContainText('STEP 1');
    const step1CrashSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(step1CrashSnap.stepIndex).toBe(1);
    expect(step1CrashSnap.debugLog?.location).toBe('STEP 1');

    expect(monitors.uncaughtErrors).toEqual([]);
  });
});
