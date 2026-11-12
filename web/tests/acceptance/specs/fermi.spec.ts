import { expect, test } from '@playwright/test';
import { FERMI_STAGE_EXPECTATIONS } from '../helpers/contracts.js';
import {
  attachPageMonitors,
  expectZeroAxeViolations,
  invokeTestApi,
  selectFermiHypothesisCards,
} from '../helpers/test-utils.js';

test.describe('Mode 2: FERMI BLASTER Acceptance Suite', () => {
  test('AC-7 / AC7_モード2全9ステージ（初級3・中級3・上級3）と3スロット各3から4枚の仮説カード選択・自由入力欄0件', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    const response = await page.goto('/fermi');
    expect(response?.status()).toBe(200);

    await expect(page.getByTestId('screen-fermi')).toBeVisible();
    await expect(page).toHaveTitle('FERMI BLASTER | LOGIC ARCADE');
    await expect(page.getByRole('heading', { level: 1, name: 'FERMI BLASTER' })).toBeVisible();

    /* 自由記述の数値入力欄・テキスト入力欄が 0件であること */
    await expect(page.getByTestId('screen-fermi').locator('input')).toHaveCount(0);

    for (const stageExp of FERMI_STAGE_EXPECTATIONS) {
      const stageBtn = page.getByTestId(`fermi-stage-${stageExp.stageId}`);
      await expect(stageBtn).toBeVisible();
      await expect(stageBtn).toHaveAttribute('data-tier', stageExp.tier);
      await stageBtn.click();
      await expect(stageBtn).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId('fermi-question-heading')).toBeVisible();

      for (const act of [1, 2, 3] as const) {
        const slotFieldset = page.getByTestId(`fermi-slot-act-${act}`);
        await expect(slotFieldset).toBeVisible();
        await expect(slotFieldset).toContainText(`ACT ${act}`);

        const cards = page.locator(`button[data-testid^="fermi-card-act${act}-"]`);
        const cardCount = await cards.count();
        expect(cardCount).toBeGreaterThanOrEqual(3);
        expect(cardCount).toBeLessThanOrEqual(4);
      }
    }

    /* ステージ1に戻り、各スロットから1枚ずつ計3枚を選択して推定式を組み立てる */
    await page.getByTestId('fermi-stage-1').click();
    await expect(page.getByTestId('fermi-formula-preview')).toContainText('?');
    await selectFermiHypothesisCards(page, [1, 1, 1]);
    await expect(page.getByTestId('fermi-fire-button')).toBeEnabled();
    const formulaText = await page.getByTestId('fermi-formula-preview').innerText();
    expect(formulaText).not.toContain('?');

    await expectZeroAxeViolations(page);
    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-8 / AC8_モード2のFIRE3秒以内視覚シミュレーションと対数誤差・罠有無による4段階オーダー判定・クリア記録', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    const response = await page.goto('/fermi?stage=1');
    expect(response?.status()).toBe(200);

    await expect(page.getByTestId('fermi-simulation-canvas')).toBeVisible();

    /* 1. PERFECT ORDER: |d| <= 0.5 かつ罠カード選択 0枚 -> クリア記録 */
    await selectFermiHypothesisCards(page, FERMI_STAGE_EXPECTATIONS[0]!.perfectChoices);
    const fireStartMs = await page.evaluate(() => window.performance.now());
    await page.getByTestId('fermi-fire-button').click();

    const statusBadge = page.getByTestId('fermi-result-status');
    await expect(statusBadge).toHaveAttribute('data-status', 'PERFECT ORDER', { timeout: 3000 });
    const fireElapsedMs = (await page.evaluate(() => window.performance.now())) - fireStartMs;
    expect(fireElapsedMs).toBeLessThanOrEqual(3000);
    await expect(statusBadge).toContainText('PERFECT ORDER');
    await expect(page.getByTestId('fermi-stage-1')).toHaveAttribute('data-cleared', 'true');
    await expect(page.getByTestId('fermi-stage-1')).toContainText('S1 CLEAR');

    /* 動き軽減モードで残りの3判定区分も正確に検証 */
    await page.emulateMedia({ reducedMotion: 'reduce' });

    /* 2a. GOOD RANGE（|d| <= 0.5 だが罠カード1枚選択のため GOOD RANGE になるケース：S1 (1, 3, 2)） */
    await selectFermiHypothesisCards(page, FERMI_STAGE_EXPECTATIONS[0]!.goodChoices);
    await page.getByTestId('fermi-fire-button').click();
    await expect(statusBadge).toHaveAttribute('data-status', 'GOOD RANGE', { timeout: 1500 });
    const goodWithTrapSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(Math.abs(goodWithTrapSnap.fermiParams!.logError!)).toBeLessThanOrEqual(0.5);
    expect(goodWithTrapSnap.fermiParams!.trapTriggeredCount).toBeGreaterThanOrEqual(1);

    /* 2b. GOOD RANGE（罠0枚で 0.5 < |d| <= 1.0：未クリアの S3 (1, 1, 3) -> クリア記録） */
    await page.getByTestId('fermi-stage-3').click();
    await selectFermiHypothesisCards(page, FERMI_STAGE_EXPECTATIONS[2]!.goodChoices);
    await page.getByTestId('fermi-fire-button').click();
    await expect(statusBadge).toHaveAttribute('data-status', 'GOOD RANGE', { timeout: 1500 });
    await expect(page.getByTestId('fermi-stage-3')).toHaveAttribute('data-cleared', 'true');

    /* 3. OVERKILL（d > 1.0：未クリアの S4 (1, 1, 2) -> 未クリアのまま） */
    await page.getByTestId('fermi-stage-4').click();
    await selectFermiHypothesisCards(page, FERMI_STAGE_EXPECTATIONS[3]!.overkillChoices);
    await page.getByTestId('fermi-fire-button').click();
    await expect(statusBadge).toHaveAttribute('data-status', 'OVERKILL', { timeout: 1500 });
    await expect(page.getByTestId('fermi-stage-4')).toHaveAttribute('data-cleared', 'false');

    /* 4. UNDERESTIMATE（d < -1.0：未クリアの S5 (1, 1, 3) -> 未クリアのまま） */
    await page.getByTestId('fermi-stage-5').click();
    await selectFermiHypothesisCards(page, FERMI_STAGE_EXPECTATIONS[4]!.underestimateChoices);
    await page.getByTestId('fermi-fire-button').click();
    await expect(statusBadge).toHaveAttribute('data-status', 'UNDERESTIMATE', { timeout: 1500 });
    await expect(page.getByTestId('fermi-stage-5')).toHaveAttribute('data-cleared', 'false');

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-9 / AC9_モード2の基準因数分解式・罠カード解説3項目表示とRESET0.2秒以内全スロット未選択初期化', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto('/fermi?stage=1');
    expect(response?.status()).toBe(200);

    await selectFermiHypothesisCards(page, [1, 1, 2]);
    await page.getByTestId('fermi-fire-button').click();
    await expect(page.getByTestId('fermi-result-status')).toHaveAttribute(
      'data-status',
      'OVERKILL',
      { timeout: 1500 },
    );

    const explainPanel = page.getByTestId('fermi-explanation-panel');
    await expect(explainPanel).toBeVisible();

    /* 解説必須3項目すべての検証 */
    const comparisonEl = page.getByTestId('fermi-comparison-values');
    const breakdownEl = page.getByTestId('fermi-baseline-breakdown');
    const trapNotesEl = page.getByTestId('fermi-trap-notes');

    await expect(comparisonEl).toBeVisible();
    await expect(comparisonEl).toContainText('推定値');
    await expect(comparisonEl).toContainText('基準値');

    await expect(breakdownEl).toBeVisible();
    const breakdownText = (await breakdownEl.innerText()).trim();
    expect(breakdownText).toContain('ACT 1 × ACT 2 × ACT 3');
    expect(breakdownText.length).toBeGreaterThan(25);

    await expect(trapNotesEl).toBeVisible();
    const trapNotesText = (await trapNotesEl.innerText()).trim();
    expect(trapNotesText.length).toBeGreaterThan(10);

    const snap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(snap.fermiExplanation).not.toBeNull();
    expect(snap.fermiExplanation!.baselineBreakdownText.ja.trim().length).toBeGreaterThanOrEqual(1);
    expect(snap.fermiExplanation!.trapNotes.length).toBeGreaterThanOrEqual(1);
    for (const note of snap.fermiExplanation!.trapNotes) {
      expect(note.cardLabel.ja.trim().length).toBeGreaterThanOrEqual(1);
      expect(note.reason.ja.trim().length).toBeGreaterThanOrEqual(1);
    }

    /* RESET 押下から 0.2秒（200ms）以内に ACT 1〜3 全スロット未選択・IDLE に戻る */
    const resetBtn = page.getByTestId('fermi-reset-button');
    const resetStartMs = await page.evaluate(() => window.performance.now());
    await resetBtn.click();
    await expect(page.getByTestId('fermi-result-status')).toHaveAttribute(
      'data-status',
      'IDLE',
      { timeout: 200 },
    );
    const resetElapsedMs = (await page.evaluate(() => window.performance.now())) - resetStartMs;
    expect(resetElapsedMs).toBeLessThanOrEqual(200);

    const pressedCards = page.locator('button[data-testid^="fermi-card-act"][aria-pressed="true"]');
    await expect(pressedCards).toHaveCount(0);
    await expect(page.getByTestId('fermi-fire-button')).toBeDisabled();
    await expect(page.getByTestId('fermi-formula-preview')).toContainText('?');

    const resetSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(resetSnap.assignedSlots).toEqual([null, null, null]);
    expect(resetSnap.unassignedSlotNames).toEqual(['ACT 1', 'ACT 2', 'ACT 3']);

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-19 / AC19_モード2全9ステージの全組み合わせPERFECT_ORDER解存在・50パーセント以下・罠カード1枚以上配置の保証', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto('/fermi?stage=1');
    expect(response?.status()).toBe(200);

    const audit = await invokeTestApi(page, 'auditAllStages');
    expect(audit.allPassed).toBe(true);
    expect(audit.fermiStages).toHaveLength(9);

    for (let idx = 0; idx < 9; idx += 1) {
      const entry = audit.fermiStages[idx]!;
      const expectedExp = FERMI_STAGE_EXPECTATIONS[idx]!;
      expect(entry.stageId).toBe(expectedExp.stageId);
      expect(entry.tier).toBe(expectedExp.tier);
      expect(entry.totalCombinations).toBeGreaterThanOrEqual(27);
      expect(entry.totalCombinations).toBeLessThanOrEqual(64);
      expect(entry.perfectOrderCount).toBeGreaterThanOrEqual(1);
      expect(entry.perfectOrderRatio).toBeGreaterThan(0);
      expect(entry.perfectOrderRatio).toBeLessThanOrEqual(0.5);
      expect(entry.trapCardCount).toBeGreaterThanOrEqual(1);
      expect(entry.passesAc19).toBe(true);
    }

    /* 初級・中級・上級それぞれの代表ステージで実際に PERFECT ORDER 到達を画面確認 */
    for (const repStageId of [1, 6, 9] as const) {
      const exp = FERMI_STAGE_EXPECTATIONS[repStageId - 1]!;
      await page.getByTestId(`fermi-stage-${repStageId}`).click();
      await selectFermiHypothesisCards(page, exp.perfectChoices);
      await page.getByTestId('fermi-fire-button').click();
      await expect(page.getByTestId('fermi-result-status')).toHaveAttribute(
        'data-status',
        'PERFECT ORDER',
        { timeout: 1500 },
      );
      await expect(page.getByTestId(`fermi-stage-${repStageId}`)).toHaveAttribute(
        'data-cleared',
        'true',
      );
    }

    expect(monitors.uncaughtErrors).toEqual([]);
  });
});
