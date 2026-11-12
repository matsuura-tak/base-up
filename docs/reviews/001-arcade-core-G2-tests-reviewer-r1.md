FAIL

## 指摘
- 重大、`web/tests/acceptance/helpers/test-utils.ts:160-170`（呼び出し元：`web/tests/acceptance/specs/responsive-and-a11y.spec.ts:178-226`）、macOS 環境の Playwright `webkit` プロジェクト（`devices['Desktop Safari']`）において `tabToElementByTestId` が `['Tab', 'Shift+Tab']` のみを送信しているため、仕様どおり `tabindex` を付与しない標準 `<a href="...">`（`lobby-primary-start-button`、`nav-mode-fermi`、`nav-mode-diagnostic`）および `<button type="button">`（`combinator-module-card-*`、`combinator-run-button` 等）に一切フォーカスが当たらず（macOS WebKit の既定 `WebKitTabToLinksPreferenceKey = false` により `document.activeElement` が `BODY` のまま留まる）、正しい実装を `Error: Keyboard navigation did not reach data-testid="lobby-primary-start-button" within 80 presses` で必ず落としてしまう（あるいは本番 HTML の全リンク・全ボタンへの不要な `tabindex="0"` 付与を強いる過剰拘束になる）、根拠：`design/001-arcade-core.md` 第6章（148〜207行）・第9章（472〜473行）、`contracts/arcade-test-seam.md` 第1.2節（20〜81行）・第8.2節（271行）、`docs/org/gates.md` G3（71・74行）、および当方の `@playwright/test@1.65.0` WebKit 実機再現結果（`WebKit Tab` では `<input>` 以外の `<a>`/`<button>` がすべてスキップされ、`Alt+Tab` / `Alt+Shift+Tab` では全要素へ DOM 順に到達し `:focus-visible` の `2px solid` 枠も点灯することを実証）、直す方向：`tabToElementByTestId` 内で `const isMacWebKit = page.context().browser()?.browserType().name() === 'webkit' && process.platform === 'darwin';` を判定し、macOS WebKit 時は `['Alt+Tab', 'Alt+Shift+Tab']`、それ以外（Chromium / Firefox / Linux WebKit）は `['Tab', 'Shift+Tab']` でフォーカス移動するよう修正する（併せてテスト名の `(TabとEnter)` 表記が必要なら実態に合わせる）。
- 提案、`web/tests/acceptance/helpers/contracts.ts:86-95`、`FermiExplanation` インターフェースに `contracts/openapi.yaml` で `required` 指定されている `showRetryHint: boolean` プロパティが欠落している（TypeScript の構造的部分型によりコンパイル・実行は阻害しないが契約定義との完全一致のため揃えるのが望ましい）、根拠：`contracts/openapi.yaml:431-468`（`FermiExplanation.required` および `properties.showRetryHint`）、直す方向：`FermiExplanation` に `showRetryHint: boolean;` を追加する。
- 提案、`web/tests/acceptance/specs/combinator.spec.ts:232-240` および `web/tests/acceptance/specs/fermi.spec.ts:162-170`、`RESET` 操作の `0.2秒（200ms）以内` 復帰計測において `resetStartMs` を `await resetButton.click()` の**前**に `page.evaluate(() => window.performance.now())` で取得しているため、ブラウザ内の `RESET` 処理時間だけでなく Playwright 側のアクション可能性検査・スクロール・マウス移動・CDP/WebKit IPC 往復時間まで計測値に含まれている（当方の単体計測でも `0ms` 同期更新に対して WebKit 初回クリックは IPC 往復だけで `131ms` を消費しており、CI 2-vCPU や G3 の `--repeat-each=5` 並列負荷時にフレーク要因になり得る）、根拠：`docs/prd/001-arcade-core.md` `AC-5`（166行）・`AC-9`（194行）、`contracts/arcade-test-seam.md` 第7章（249行）、直す方向：ブラウザページ内で `resetButton` の `click` イベント発火時点の `performance.now()` を記録するか `MutationObserver` で `IDLE` 遷移時刻を捕捉して純粋な応答時間を判定すると並列負荷に対して安定する。

## 証拠
- 対象：
  - 比較範囲：`2530b75f91387411c17101c40154936ac5c8d6a5...74a9643a3d32c452f8057eb2cf5b747ac994bb3c`（機能 `001-arcade-core`、ステップ 10 `verifier` 先行受け入れテスト G2 判定）
  - 観点：**テスト**（受け入れテスト、Web の画面）
  - `git diff --name-only 2530b75f91387411c17101c40154936ac5c8d6a5...HEAD` の全15ファイルと読了印：
    - [x] `docs/verification/001-arcade-core/evidence/red.log`（全2,230行読了）
    - [x] `docs/verification/001-arcade-core/test-plan.md`（全139行読了）
    - [x] `web/tests/acceptance/helpers/contracts.ts`（全465行読了）
    - [x] `web/tests/acceptance/helpers/test-utils.ts`（全172行読了）
    - [x] `web/tests/acceptance/package-lock.json`（全120行読了）
    - [x] `web/tests/acceptance/package.json`（全17行読了）
    - [x] `web/tests/acceptance/playwright.config.ts`（全41行読了）
    - [x] `web/tests/acceptance/scripts/serve-dist.mjs`（全127行読了）
    - [x] `web/tests/acceptance/specs/combinator.spec.ts`（全356行読了）
    - [x] `web/tests/acceptance/specs/diagnostic.spec.ts`（全540行読了）
    - [x] `web/tests/acceptance/specs/fermi.spec.ts`（全229行読了）
    - [x] `web/tests/acceptance/specs/resilience-and-media.spec.ts`（全375行読了）
    - [x] `web/tests/acceptance/specs/responsive-and-a11y.spec.ts`（全235行読了）
    - [x] `web/tests/acceptance/specs/shell-and-lobby.spec.ts`（全91行読了）
    - [x] `web/tests/acceptance/tsconfig.json`（全21行読了）

- 観点の表：
  - 全20 AC（`AC-1`〜`AC-20`）対応表：全22テストに AC 番号あり（AC なしテスト `0件`）、`AC-18` キーボードテストの macOS WebKit `Alt+Tab` 未対応1件のみ FAIL、他全19 AC は具体的な結果値検証 OK。
  - `test-plan.md` 独立監査：読んだファイル一覧（PRD・`design/`・`contracts/` のみ）、リスク表、2章20行、3章9行、4章つなぎ口8行、6章チャーター5本、8章赤の証拠すべて適合。
  - 依存許可リスト照合：`@axe-core/playwright@4.14.0`、`@playwright/test@1.65.0`、`@types/node@24.19.2`、`typescript@5.9.3` 完全一致、`postinstall` `0件`、`npm audit` 脆弱性 `0件`。
  - テスト弱体化・壊れやすいセレクタ・内部 import・秘密情報・保護領域変更：すべて `0件`。

- 読んだファイル：`.claude/skills/craft-reviewer/SKILL.md`、`.claude/skills/craft-reviewer/web.md`、`.claude/org/app.json`、`CLAUDE.md`、`docs/org/gates.md`、`docs/templates/review-report.md`、`docs/templates/test-plan.md`、`.gitignore`、`.github/workflows/web.yml`、`docs/prd/001-arcade-core.md`、`design/001-arcade-core.md`、`design/tokens.json`、`contracts/openapi.yaml`、`contracts/arcade-test-seam.md`、`contracts/dependencies.md`、`docs/adr/001-web-foundation.md`、`docs/adr/002-client-state-and-simulation-engine.md`、`docs/adr/features/001-arcade-core.md`、および差分全15ファイル
- 実行したコマンドと結果：
  1. `git diff --name-only 2530b75f91387411c17101c40154936ac5c8d6a5...HEAD -- .claude .github .agents` → `0件`
  2. `git grep` による `skip` / `only` / `fixme` / `xfail` / `waitForTimeout` / `sleep` / `setTimeout` / `retries` / `any` / 壊れやすいセレクタ / 内部 import 検査 → すべて `0 matches`
  3. 秘密情報・`.env`・`postinstall` 検査 → すべて `0件`
  4. `cd web/tests/acceptance && npx tsc --noEmit && npm audit` → 終了コード `0`、`found 0 vulnerabilities`
  5. `cd web/tests/acceptance && FORCE_COLOR=0 CI=1 npx playwright test --reporter=list` → `66 failed`（404 による正しい Red 失敗）
  6. macOS Playwright `webkit` における `Tab` vs `Alt+Tab` 実機再現スクリプト実行 → `Tab` では `<a>`/`<button>` がスキップされ、`Alt+Tab` で全要素到達・`:focus-visible` `2px solid` 点灯を確認
- 開いた URL と確認した日付：なし
- 未検証：なし

## 記録
- 関門：G2（受け入れテスト先行）
- 判定した役：reviewer（観点：テスト）
- 回：r1
- 対象：`web/tests/acceptance/`, `docs/verification/001-arcade-core/`、`feat/001-arcade-core`、`2530b75f91387411c17101c40154936ac5c8d6a5...74a9643a3d32c452f8057eb2cf5b747ac994bb3c`
- 日付：2026-11-12
