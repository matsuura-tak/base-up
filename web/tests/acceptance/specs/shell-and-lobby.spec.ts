import { expect, test } from '@playwright/test';
import { attachPageMonitors, expectZeroAxeViolations } from '../helpers/test-utils.js';

const EXPECTED_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";

test.describe('Shell and Lobby Acceptance Suite', () => {
  test('AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証', async ({
    page,
  }) => {
    const monitors = attachPageMonitors(page);

    const response = await page.goto('/');
    expect(response).not.toBeNull();
    const headers = response!.headers();
    expect(headers['content-security-policy']).toBe(EXPECTED_CSP);
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toBe(
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=()',
    );
    expect(headers['x-frame-options']).toBe('DENY');
    expect(response!.status()).toBe(200);

    await expect(page.getByTestId('screen-lobby')).toBeVisible({ timeout: 1000 });

    const lobbyCombinatorLink = page.getByTestId('lobby-mode-combinator');
    const lobbyFermiLink = page.getByTestId('lobby-mode-fermi');
    const lobbyDiagnosticLink = page.getByTestId('lobby-mode-diagnostic');
    const navCombinatorLink = page.getByTestId('nav-mode-combinator');
    const navFermiLink = page.getByTestId('nav-mode-fermi');
    const navDiagnosticLink = page.getByTestId('nav-mode-diagnostic');

    await expect(lobbyCombinatorLink).toBeVisible({ timeout: 1000 });
    await expect(lobbyFermiLink).toBeVisible({ timeout: 1000 });
    await expect(lobbyDiagnosticLink).toBeVisible({ timeout: 1000 });
    await expect(navCombinatorLink).toBeVisible({ timeout: 1000 });
    await expect(navFermiLink).toBeVisible({ timeout: 1000 });
    await expect(navDiagnosticLink).toBeVisible({ timeout: 1000 });

    const readyElapsedMs = await page.evaluate(() => window.performance.now());
    expect(readyElapsedMs).toBeLessThanOrEqual(1000);

    await expect(page).toHaveTitle('モード選択 | LOGIC ARCADE');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('LOGIC ARCADE');

    await expect(lobbyCombinatorLink).toHaveAttribute('href', '/combinator');
    await expect(lobbyFermiLink).toHaveAttribute('href', '/fermi');
    await expect(lobbyDiagnosticLink).toHaveAttribute('href', '/diagnostic');

    const primaryCta = page.getByTestId('lobby-primary-start-button');
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toHaveAttribute('href', '/combinator?stage=1');
    await expect(primaryCta).toContainText('3-ACT COMBINATOR の STAGE 1 を始める');

    await expect(page.getByTestId('lobby-progress-combinator')).toContainText('0 / 10');
    await expect(page.getByTestId('lobby-progress-fermi')).toContainText('0 / 9');
    await expect(page.getByTestId('lobby-rank-badge')).toContainText('UNRANKED');

    /* アカウント登録欄・迷路ドットイート盤面・Coming Soon・動作しないダミーボタンが0件であること */
    await expect(page.locator('input[type="password"], input[type="email"]')).toHaveCount(0);
    await expect(page.getByTestId('screen-lobby').locator('canvas')).toHaveCount(0);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/coming\s*soon|準備中/i);
    await expect(page.getByTestId('screen-lobby').locator('button:disabled')).toHaveCount(0);

    await expectZeroAxeViolations(page);

    /* 日英言語切替の確認 */
    const langEnButton = page.getByTestId('header-lang-en');
    const langJaButton = page.getByTestId('header-lang-ja');
    await expect(langJaButton).toHaveAttribute('aria-pressed', 'true');
    await langEnButton.click();
    await expect(langEnButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveTitle('Mode Select | LOGIC ARCADE');
    await expect(navDiagnosticLink).toContainText('Diagnostic Chart');
    await langJaButton.click();
    await expect(page).toHaveTitle('モード選択 | LOGIC ARCADE');

    /* 未定義パス直アクセス時の安全な404案内とトップ復帰 */
    const unknownResp = await page.goto('/unknown-arcade-route');
    expect(unknownResp?.status()).toBe(200);
    await expect(page.getByTestId('not-found-section')).toBeVisible();
    await expect(page).toHaveTitle('ページが見つかりません | LOGIC ARCADE');
    await page.getByTestId('not-found-home-link').click();
    await expect(page.getByTestId('screen-lobby')).toBeVisible();

    expect(monitors.uncaughtErrors).toEqual([]);
    expect(monitors.externalRequests).toEqual([]);
  });
});
