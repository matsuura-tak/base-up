import { expect, test } from '@playwright/test';
import { PERSISTED_STORAGE_KEY } from '../helpers/contracts.js';
import {
  assignCombinatorModules,
  attachPageMonitors,
  invokeTestApi,
  selectFermiHypothesisCards,
} from '../helpers/test-utils.js';

test.describe('Resilience, Offline, Storage, Audio & Motion Acceptance Suite', () => {
  test('AC-13 / AC13_モード1およびモード2のスロット未充足時の実行ボタンdisabled化・未配置スロット案内文・試行回数0回保証', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);

    /* モード1（/combinator?stage=1）：0個・2個・1つ解除の各未充足状態 */
    const resp1 = await page.goto('/combinator?stage=1');
    expect(resp1?.status()).toBe(200);

    const runBtn = page.getByTestId('combinator-run-button');
    const stepBtn = page.getByTestId('combinator-step-button');
    const combGuidance = page.getByTestId('combinator-slot-guidance');

    await expect(runBtn).toBeDisabled();
    await expect(stepBtn).toBeDisabled();
    await expect(combGuidance).toHaveCount(1);
    await expect(combGuidance).toBeVisible();
    await expect(combGuidance).toContainText('STEP 1');
    await expect(combGuidance).toContainText('STEP 2');
    await expect(combGuidance).toContainText('STEP 3');

    await page.getByTestId('combinator-module-card-1').click();
    await page.getByTestId('combinator-module-card-2').click();
    await expect(runBtn).toBeDisabled();
    await expect(stepBtn).toBeDisabled();
    await expect(combGuidance).toContainText('STEP 3');

    /* 3つ埋めた後に STEP 2 を解除すると再び disabled + STEP 2 案内表示になる */
    await page.getByTestId('combinator-module-card-3').click();
    await expect(runBtn).toBeEnabled();
    await expect(stepBtn).toBeEnabled();
    await expect(combGuidance).toHaveCount(0);

    await page.getByTestId('combinator-slot-2').click();
    await expect(runBtn).toBeDisabled();
    await expect(stepBtn).toBeDisabled();
    await expect(combGuidance).toHaveCount(1);
    await expect(combGuidance).toContainText('STEP 2');

    const combSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(combSnap.status).toBe('IDLE');
    expect(combSnap.officialAttemptCount).toBe(0);
    expect(combSnap.stageAttemptCount).toBe(0);

    /* モード2（/fermi?stage=1）：0枚・2枚選択の各未充足状態 */
    const resp2 = await page.goto('/fermi?stage=1');
    expect(resp2?.status()).toBe(200);

    const fireBtn = page.getByTestId('fermi-fire-button');
    const fermiGuidance = page.getByTestId('fermi-slot-guidance');

    await expect(fireBtn).toBeDisabled();
    await expect(fermiGuidance).toHaveCount(1);
    await expect(fermiGuidance).toBeVisible();
    await expect(fermiGuidance).toContainText('ACT 1');
    await expect(fermiGuidance).toContainText('ACT 2');
    await expect(fermiGuidance).toContainText('ACT 3');

    await page.getByTestId('fermi-card-act1-1').click();
    await page.getByTestId('fermi-card-act3-1').click();
    await expect(fireBtn).toBeDisabled();
    await expect(fermiGuidance).toHaveCount(1);
    await expect(fermiGuidance).toContainText('ACT 2');

    const fermiSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(fermiSnap.status).toBe('IDLE');
    expect(fermiSnap.officialAttemptCount).toBe(0);
    expect(fermiSnap.stageAttemptCount).toBe(0);

    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-14 / AC14_初期読み込み後の完全オフライン両モードクリア・外部通信0件・リロード後のlocalStorage履歴復元', async ({
    page,
    context,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId('screen-lobby')).toBeVisible();

    /* オフラインへ切り替え */
    await context.setOffline(true);

    /* オフラインのままモード1 STAGE 1 をクリア */
    await page.getByTestId('lobby-mode-combinator').click();
    await expect(page.getByTestId('screen-combinator')).toBeVisible();
    await assignCombinatorModules(page, ['s1-seed', 's1-amp2', 's1-amp2b']);
    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'STAGE CLEAR',
      { timeout: 1500 },
    );

    /* オフラインのままモード2 STAGE 1 をクリア */
    await page.getByTestId('nav-mode-fermi').click();
    await expect(page.getByTestId('screen-fermi')).toBeVisible();
    await selectFermiHypothesisCards(page, [1, 1, 1]);
    await page.getByTestId('fermi-fire-button').click();
    await expect(page.getByTestId('fermi-result-status')).toHaveAttribute(
      'data-status',
      'PERFECT ORDER',
      { timeout: 1500 },
    );

    /* オフラインのまま思考力診断カルテを表示して認定ランク算出を確認 */
    await page.getByTestId('nav-mode-diagnostic').click();
    await expect(page.getByTestId('screen-diagnostic')).toBeVisible();
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'A');
    await expect(page.getByTestId('diagnostic-overall-score')).toContainText('71');

    expect(monitors.uncaughtErrors).toEqual([]);
    expect(monitors.externalRequests).toEqual([]);
    expect(monitors.audioAssetRequests).toEqual([]);
    expect(monitors.failedRequests).toEqual([]);
    expect(await context.cookies()).toEqual([]);

    /* オンライン復帰してリロードしてもクリア済みステージ数と5軸スコア・ランクが完全復元される */
    await context.setOffline(false);
    await page.reload();
    await expect(page.getByTestId('screen-diagnostic')).toBeVisible();
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'A');
    await expect(page.getByTestId('diagnostic-overall-score')).toContainText('71');
    await expect(page.getByTestId('diagnostic-progress-combinator')).toContainText('1 / 10');
    await expect(page.getByTestId('diagnostic-progress-fermi')).toContainText('1 / 9');
    await expect(page.getByTestId('diagnostic-axis-spec-score')).toHaveText('64');
    await expect(page.getByTestId('diagnostic-axis-fermi-score')).toHaveText('73');

    expect(monitors.uncaughtErrors).toEqual([]);
    expect(monitors.externalRequests).toEqual([]);
  });

  test('AC-15 / AC15_Web_Audioシンセ効果音発音・外部音声通信0件・SOUND_OFFゲイン0抑止とリロード後永続化', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const response = await page.goto('/combinator?stage=1');
    expect(response?.status()).toBe(200);

    const soundToggle = page.getByTestId('header-sound-toggle');
    const soundStateBadge = page.getByTestId('header-sound-state');

    /* 初回起動時は既定 SOUND ON であり、操作前の自動音声再生は 0回 */
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(soundToggle).toHaveAttribute('data-sound-state', 'on');
    await expect(soundStateBadge).toHaveText('SOUND ON');

    const initialAudio = await invokeTestApi(page, 'getAudioState');
    expect(initialAudio.soundEnabled).toBe(true);
    expect(initialAudio.autoPlayBeforeGestureCount).toBe(0);
    expect(initialAudio.synthTriggerCount).toBe(0);
    expect(initialAudio.masterGainValue).toBeGreaterThan(0);

    /* SOUND ON のまま RUN 操作を行うと Web Audio シンセ発音が 1回以上行われる */
    await assignCombinatorModules(page, ['s1-seed', 's1-amp2', 's1-amp2b']);
    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'STAGE CLEAR',
      { timeout: 1500 },
    );

    const afterOnRunAudio = await invokeTestApi(page, 'getAudioState');
    expect(afterOnRunAudio.synthTriggerCount).toBeGreaterThanOrEqual(1);
    expect(afterOnRunAudio.masterGainValue).toBeGreaterThan(0);

    /* 常設ミュート切替で SOUND OFF にするとマスター出力ゲインが 0 になり新規発音が抑止される */
    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(soundToggle).toHaveAttribute('data-sound-state', 'off');
    await expect(soundStateBadge).toHaveText('SOUND OFF');

    const mutedAudio = await invokeTestApi(page, 'getAudioState');
    expect(mutedAudio.soundEnabled).toBe(false);
    expect(mutedAudio.masterGainValue).toBe(0);
    const countWhenMuted = mutedAudio.synthTriggerCount;

    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'STAGE CLEAR',
      { timeout: 1500 },
    );

    const afterMutedRunAudio = await invokeTestApi(page, 'getAudioState');
    expect(afterMutedRunAudio.masterGainValue).toBe(0);
    expect(afterMutedRunAudio.synthTriggerCount).toBe(countWhenMuted);

    /* リロード後も SOUND OFF が維持される */
    await page.reload();
    await expect(page.getByTestId('header-sound-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('header-sound-toggle')).toHaveAttribute('data-sound-state', 'off');
    await expect(page.getByTestId('header-sound-state')).toHaveText('SOUND OFF');

    const reloadedAudio = await invokeTestApi(page, 'getAudioState');
    expect(reloadedAudio.soundEnabled).toBe(false);
    expect(reloadedAudio.masterGainValue).toBe(0);

    expect(monitors.audioAssetRequests).toEqual([]);
    expect(monitors.externalRequests).toEqual([]);
    expect(monitors.uncaughtErrors).toEqual([]);
  });

  test('AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録', async ({
    page,
    browser,
  }) => {
    /* (a) window.localStorage プロパティ参照自体が SecurityError を送出する状態 */
    const monitorsA = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('Storage disabled by user preferences', 'SecurityError');
        },
      });
    });

    const respA = await page.goto('/');
    expect(respA?.status()).toBe(200);
    await expect(page.getByTestId('storage-fallback-banner')).toHaveCount(1);
    await expect(page.getByTestId('storage-fallback-banner')).toBeVisible();

    const storageStatusA = await invokeTestApi(page, 'getStorageStatus');
    expect(storageStatusA.storageAvailable).toBe(false);
    expect(storageStatusA.fallbackBannerVisible).toBe(true);

    await page.getByTestId('lobby-mode-combinator').click();
    await assignCombinatorModules(page, ['s1-seed', 's1-amp2', 's1-amp2b']);
    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'STAGE CLEAR',
      { timeout: 1500 },
    );

    await page.getByTestId('nav-mode-fermi').click();
    await selectFermiHypothesisCards(page, [1, 1, 1]);
    await page.getByTestId('fermi-fire-button').click();
    await expect(page.getByTestId('fermi-result-status')).toHaveAttribute(
      'data-status',
      'PERFECT ORDER',
      { timeout: 1500 },
    );

    await page.getByTestId('nav-mode-diagnostic').click();
    await expect(page.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'A');
    await expect(page.getByTestId('storage-fallback-banner')).toBeVisible();
    expect(monitorsA.uncaughtErrors).toEqual([]);

    /* (b) localStorage の保存キーに破損した JSON 文字列が格納されている状態 */
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    const monitorsB = attachPageMonitors(pageB);
    await pageB.emulateMedia({ reducedMotion: 'reduce' });
    await pageB.addInitScript((key) => {
      const injectedFlag = '__corrupt_injected_once__';
      if (window.sessionStorage.getItem(injectedFlag) !== '1') {
        window.localStorage.setItem(key, '{corrupted_json: [unclosed');
        window.sessionStorage.setItem(injectedFlag, '1');
      }
    }, PERSISTED_STORAGE_KEY);

    const respB = await pageB.goto('/');
    expect(respB?.status()).toBe(200);
    await expect(pageB.getByTestId('screen-lobby')).toBeVisible();
    await expect(pageB.getByTestId('storage-fallback-banner')).toHaveCount(0);
    await expect(pageB.getByTestId('lobby-progress-combinator')).toContainText('0 / 10');

    const storageStatusB = await invokeTestApi(pageB, 'getStorageStatus');
    expect(storageStatusB.storageAvailable).toBe(true);
    expect(storageStatusB.recoveredFromCorruption).toBe(true);

    await pageB.getByTestId('lobby-mode-combinator').click();
    await assignCombinatorModules(pageB, ['s1-seed', 's1-amp2', 's1-amp2b']);
    await pageB.getByTestId('combinator-run-button').click();
    await expect(pageB.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'STAGE CLEAR',
      { timeout: 1500 },
    );

    await pageB.getByTestId('nav-mode-fermi').click();
    await selectFermiHypothesisCards(pageB, [1, 1, 1]);
    await pageB.getByTestId('fermi-fire-button').click();
    await expect(pageB.getByTestId('fermi-result-status')).toHaveAttribute(
      'data-status',
      'PERFECT ORDER',
      { timeout: 1500 },
    );

    await pageB.getByTestId('nav-mode-diagnostic').click();
    await expect(pageB.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'A');

    /* 再記録された正常な JSON がリロード後も読めること */
    await pageB.reload();
    await expect(pageB.getByTestId('diagnostic-overall-rank')).toHaveAttribute('data-rank', 'A');
    expect(monitorsB.uncaughtErrors).toEqual([]);
    await contextB.close();
  });

  test('AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    /* モード1：CRASHED（通常ならシェイク対象）および STAGE CLEAR で 0px かつ <= 1.0秒完了を確認 */
    const resp1 = await page.goto('/combinator?stage=1');
    expect(resp1?.status()).toBe(200);

    await assignCombinatorModules(page, ['s1-seed', 's1-amp2', 's1-over']);
    const combCrashStartMs = await page.evaluate(() => window.performance.now());
    await page.getByTestId('combinator-run-button').click();
    await expect(page.getByTestId('combinator-result-status')).toHaveAttribute(
      'data-status',
      'CRASHED',
      { timeout: 1000 },
    );
    const combCrashElapsedMs =
      (await page.evaluate(() => window.performance.now())) - combCrashStartMs;
    expect(combCrashElapsedMs).toBeLessThanOrEqual(1000);

    const combSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(combSnap.maxShakeOffsetPx).toBe(0);
    expect(combSnap.currentShakeOffsetPx).toBe(0);

    const combTransform = await page
      .getByTestId('screen-combinator')
      .evaluate((el) => window.getComputedStyle(el).transform);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(combTransform);

    /* モード2：FIRE 実行で 0px かつ <= 1.0秒完了を確認 */
    const resp2 = await page.goto('/fermi?stage=1');
    expect(resp2?.status()).toBe(200);

    await selectFermiHypothesisCards(page, [1, 1, 2]);
    const fermiStartMs = await page.evaluate(() => window.performance.now());
    await page.getByTestId('fermi-fire-button').click();
    await expect(page.getByTestId('fermi-result-status')).toHaveAttribute(
      'data-status',
      'OVERKILL',
      { timeout: 1000 },
    );
    const fermiElapsedMs = (await page.evaluate(() => window.performance.now())) - fermiStartMs;
    expect(fermiElapsedMs).toBeLessThanOrEqual(1000);

    const fermiSnap = await invokeTestApi(page, 'getSimulationSnapshot');
    expect(fermiSnap.maxShakeOffsetPx).toBe(0);
    expect(fermiSnap.currentShakeOffsetPx).toBe(0);

    const fermiTransform = await page
      .getByTestId('screen-fermi')
      .evaluate((el) => window.getComputedStyle(el).transform);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(fermiTransform);

    expect(monitors.uncaughtErrors).toEqual([]);
  });
});
