FAIL

## 指摘
- 重大、[web/tests/acceptance/helpers/test-utils.ts](file:///Users/takumamatsuura/src/base-up/web/tests/acceptance/helpers/test-utils.ts#L141-L172)（160行目、呼び出し元 [web/tests/acceptance/specs/responsive-and-a11y.spec.ts](file:///Users/takumamatsuura/src/base-up/web/tests/acceptance/specs/responsive-and-a11y.spec.ts#L178-L227)）：`tabToElementByTestId` が全環境で `'Tab'` / `'Shift+Tab'` を固定送出しているが、macOS 環境（`process.platform === 'darwin'`）の Playwright `webkit`（`Desktop Safari`）は Safari 既定の `WebKitTabToLinksPreferenceKey = false` に従うため、`page.keyboard.press('Tab')` / `'Shift+Tab'` ではテキスト `<input>` 以外の標準 `<a href>` リンクおよび `<button type="button">` がすべてスキップされ、`document.activeElement` が `BODY`（`data-testid = null`）から1ミリも動かず `AC-18` キーボード完走テストが 100% 確定失敗（誤検知）する。ステップ 13 で `web-engineer` は `web/tests/acceptance/` を編集できないため、このまま通すと仕様どおり標準 HTML 要素で実装してもローカル `webkit` テストが必ず落ちる。根拠：[docs/org/gates.md](file:///Users/takumamatsuura/src/base-up/docs/org/gates.md#L42-L56)（Chromium / Firefox / WebKit 3ブラウザ合格要件）、[design/001-arcade-core.md](file:///Users/takumamatsuura/src/base-up/design/001-arcade-core.md#L81-L89)（全操作を標準 `<a>`・`<button>` で構成）、[contracts/arcade-test-seam.md](file:///Users/takumamatsuura/src/base-up/contracts/arcade-test-seam.md#L271)（3エンジン構成）、および本判定での `@playwright/test@1.65.0` 実機検証出力。直す方向：`tabToElementByTestId` 内で `const browserName = page.context().browser()?.browserType().name(); const keys = browserName === 'webkit' && process.platform === 'darwin' ? (['Alt+Tab', 'Alt+Shift+Tab'] as const) : (['Tab', 'Shift+Tab'] as const);` に切り替え、macOS `webkit` では Safari 標準の全要素フォーカス移動キー（`Option+Tab` = `'Alt+Tab'`）、Chromium / Firefox および Linux `ubuntu-latest` CI の WebKitGTK では `'Tab'` / `'Shift+Tab'` を送出する（実機 `webkit` で `'Alt+Tab'` により `<a>`・`<button>` とも `:focus-visible === true`・`outlineWidth === '3px'`・`Enter` 発火・末尾折り返しが Chromium と同一に動くことを確認済み）。
- 要修正、[web/tests/acceptance/helpers/contracts.ts](file:///Users/takumamatsuura/src/base-up/web/tests/acceptance/helpers/contracts.ts#L86-L95)（および [web/tests/acceptance/specs/fermi.spec.ts](file:///Users/takumamatsuura/src/base-up/web/tests/acceptance/specs/fermi.spec.ts#L151-L158)、192〜196行目）：`helpers/contracts.ts` の `FermiExplanation` 型定義で、[contracts/openapi.yaml](file:///Users/takumamatsuura/src/base-up/contracts/openapi.yaml#L427-L468)（440・466〜467行目）で必須（`required`）となっている `showRetryHint: boolean` が欠落している。また `TelemetryEvent.event`（193行目）が任意の `string` になっており、[contracts/openapi.yaml](file:///Users/takumamatsuura/src/base-up/contracts/openapi.yaml#L1400-L1412) の9種イベントリテラル型より緩い。根拠：[contracts/openapi.yaml](file:///Users/takumamatsuura/src/base-up/contracts/openapi.yaml#L427-L468)、[contracts/arcade-test-seam.md](file:///Users/takumamatsuura/src/base-up/contracts/arcade-test-seam.md#L88-L108) 第2章および第3.3節（156〜157行目：`OVERKILL` / `UNDERESTIMATE` 時の `fermi-retry-hint` 表示契約）。直す方向：`helpers/contracts.ts` の `FermiExplanation` に `showRetryHint: boolean` を追加し、`TelemetryEvent.event` を契約の9種イベント名ユニオン型に揃えたうえで、`fermi.spec.ts` の `AC-9`（`OVERKILL` 実行箇所）で `expect(snap.fermiExplanation!.showRetryHint).toBe(true)` と `await expect(page.getByTestId('fermi-retry-hint')).toBeVisible()` も検証する。

## 証拠
- 対象：`2530b75f91387411c17101c40154936ac5c8d6a5...74a9643a3d32c452f8057eb2cf5b747ac994bb3c`（ステップ 10：実装より先の受け入れテスト一式・テスト計画・赤ログに対する `tech-lead` G2 判定。全15ファイル確認済み、`.claude/`・`.github/` 変更 `0件`）
  - [x] `docs/verification/001-arcade-core/evidence/red.log`
  - [x] `docs/verification/001-arcade-core/test-plan.md`
  - [x] `web/tests/acceptance/helpers/contracts.ts`
  - [x] `web/tests/acceptance/helpers/test-utils.ts`
  - [x] `web/tests/acceptance/package-lock.json`
  - [x] `web/tests/acceptance/package.json`
  - [x] `web/tests/acceptance/playwright.config.ts`
  - [x] `web/tests/acceptance/scripts/serve-dist.mjs`
  - [x] `web/tests/acceptance/specs/combinator.spec.ts`
  - [x] `web/tests/acceptance/specs/diagnostic.spec.ts`
  - [x] `web/tests/acceptance/specs/fermi.spec.ts`
  - [x] `web/tests/acceptance/specs/resilience-and-media.spec.ts`
  - [x] `web/tests/acceptance/specs/responsive-and-a11y.spec.ts`
  - [x] `web/tests/acceptance/specs/shell-and-lobby.spec.ts`
  - [x] `web/tests/acceptance/tsconfig.json`

- 観点の表：
  - `AC-1`〜`AC-20` 全20件のテスト・つなぎ口・結果値検証表：全22テストで `contracts/arcade-test-seam.md` 第1.2節（展開 `154` 識別子）・第2〜8章・`contracts/openapi.yaml` と照合（未知識別子 `0件`、PRD 11章算出式検算完全一致）。上記 macOS `webkit` キーボード移動キー1件と `FermiExplanation.showRetryHint` / `TelemetryEvent.event` 1件のみ修正要。

- 読んだファイル：`.claude/skills/craft-tech-lead/SKILL.md`、`.claude/skills/craft-tech-lead/web.md`、`.claude/agents/tech-lead.md`、`.claude/org/app.json`、`.github/workflows/web.yml`、`CLAUDE.md`、`docs/org/gates.md`、`docs/templates/review-report.md`、`docs/templates/test-plan.md`、`docs/prd/001-arcade-core.md`、`design/001-arcade-core.md`、`design/tokens.json`、`contracts/openapi.yaml`、`contracts/arcade-test-seam.md`、`contracts/dependencies.md`、`docs/adr/001-web-foundation.md`、`docs/adr/002-client-state-and-simulation-engine.md`、`docs/adr/features/001-arcade-core.md`、および検証対象全15ファイル
- 実行したコマンドと結果：
  1. `git diff --name-only 2530b75f91387411c17101c40154936ac5c8d6a5...HEAD -- .claude .github` → `0件`
  2. `cd web/tests/acceptance && npx tsc --noEmit` → 終了コード `0`
  3. `cd web/tests/acceptance && npm ls --depth=0` → 4パッケージすべて固定版一致
  4. `grep` による禁止パターン・`.exists` 検査 → `0件`
  5. Node.js スクリプトによる `154` 識別子突合・5軸数理式検算 → 不一致 `0件`
  6. `serve-dist.mjs` 実起動検証（`/__health` 200、未ビルド `/` 404、安全ヘッダー5種確認）
  7. `red.log` 精査および Playwright `chromium` / `webkit` 実機クロスブラウザ検証（macOS `webkit` の `'Alt+Tab'` 動作確認）
- 開いた URL と確認した日付：2026-11-12（WebKit macOS Safari vs Linux WebKitGTK の `Tab` / `Option+Tab` フォーカス仕様確認）
- 未検証：なし

## 記録
- 関門：G2（受け入れテスト先行）
- 判定した役：tech-lead
- 回：r1
- 対象：`web/tests/acceptance/`, `docs/verification/001-arcade-core/`、`feat/001-arcade-core`、`2530b75f91387411c17101c40154936ac5c8d6a5...74a9643a3d32c452f8057eb2cf5b747ac994bb3c`
- 日付：2026-11-12
