# B ADR 001：Web の土台（単一バンドル SPA・対応ブラウザ・標準 HTML 部品・性能予算・静的配信と安全ヘッダー）

- 状態：承認
- 書いた役：tech-lead　日付：2026-11-12
- 関係する PRD、設計メモ、契約：docs/prd/product.md、docs/prd/001-arcade-core.md、docs/adr/features/001-arcade-core.md、contracts/openapi.yaml、contracts/dependencies.md
- 元に戻す手間：大（UI フレームワーク・バンドル構造・ホスティング設定・テスト実行構成の全面差し替えを伴うため）

## 背景
`LOGIC ARCADE`（仮称 `base-up`）の最初の機能 `001-arcade-core` を実装する前に、`craft-tech-lead/web.md` および `docs/org/gates.md:55` に従い、Web アプリ全体の土台（描画方式、対応ブラウザ、部品集・アイコン集、性能の予算と計測方法、認証・保存と環境変数の境界、ホスティング・デプロイ・ロールバック・費用、セキュリティヘッダー、テスト基盤、計測と外部送信規律、古いタブの扱い）を1つに確定する必要がある。
制約は次のとおりである：
- 2週間の開発枠で、バックエンド API・DB・ログイン・外部音声アセットを一切使わずブラウザ単体・運用費 `$0/月` で完結させること（`docs/prd/001-arcade-core.md` 5行・10章）。
- 初回表示 `1.0秒以内`、`LCP <= 2.5秒`、`INP <= 200ms`、`CLS <= 0.1`、初期ロード完了後の完全オフライン完走（`AC-14`）、幅 `320px` × 文字拡大 `200%` 対応（`AC-18`）、キーボード単体完走率 `100%`、WCAG 2.2 AA 違反 `0件` を満たすこと。
- 受け入れテスト（`web/tests/acceptance/`）は `verifier` が実装より先に書き、受け入れテストフォルダ内の設定だけで動作し、`.github/workflows/web.yml`（`ubuntu-latest`）で `commands.web_build` と `commands.web_test` が確実に動くこと。

## 決定
1. **フレームワークと描き方**：Node.js `24`（`.nvmrc`）上で **React `19.3.1` + TypeScript `5.9.3` + Vite `8.3.8` による単一バンドル SPA** とする。ログイン後専用画面は存在せず全4画面（`/`, `/combinator`, `/fermi`, `/diagnostic`）＋404表示を公開画面とし、動的 `import()` によるチャンク分割を禁止して全ステージ定義・日英辞書・合成音ロジックを初期バンドル1本に同梱する（ルーティングは外部ライブラリを入れずブラウザ標準 History API `pushState` / `replaceState` / `popstate` で実装し、配信側は全未知拡張子なしパスへ `index.html` を返す）。
2. **部品集・アイコン集・契約型生成**：外部 UI コンポーネント集・CSS フレームワーク・アイコン集・チャート集は一切導入せず、**HTML 標準要素＋`design/tokens.json` 同期の CSS カスタムプロパティ＋バンドル内蔵の6種インライン `<svg aria-hidden="true">`** で組む。データ型はすべて `contracts/openapi.yaml` から `openapi-typescript`（`7.13.0`）で `web/src/generated/contracts.d.ts` に自動生成する。
3. **性能予算・配信基盤・安全ヘッダー・テスト**：初期読込 JS 上限を **gzip 圧縮後 `120 KB 以下`**（初期 CSS は gzip `20 KB 以下`、`LCP <= 2.5s`、`INP <= 200ms`、`CLS <= 0.1`、Lighthouse Performance `>= 90`、予算設定は `web/lighthouse-budget.json`）とし、`npm run build` で予算超過時にビルドを落とす。ホスティングは **Cloudflare Pages（Free：`$0/月`）** とし、`public/_headers`（ローカル検証時は `serve-dist.mjs`）で CSP・HSTS 等の安全ヘッダーを付与する。単体テストは `Vitest`（`web/`）、受け入れテストは独立 `package.json` を持つ `@playwright/test` + `@axe-core/playwright`（`web/tests/acceptance/`、Chromium / Firefox / WebKit 3エンジン）とする。

## 検討した案

| 案 | 良い点 | 悪い点 | 選ばなかった理由 |
|---|---|---|---|
| **案1（採用）：React 19 + TypeScript + Vite 単一バンドル SPA（UI/ルーター外部依存 0個）** | ・宣言的 JSX により 60行（展開154個）の `data-testid`・`aria-pressed`・`disabled` 制御とキーボードフォーカス維持が安全に書け、標準 `ErrorBoundary` も使える<br>・単一バンドルのため初回読込後に `offline` にしてもチャンク取得失敗が絶対に起きない（`AC-14`）<br>・実機ビルドで初期 JS gzip `66.15 KB`（ベースライン）と高速 | ・`react` + `react-dom` のランタイム分（gzip 約 `66 KB`）が初期 JS に入る<br>・個別 URL ごとのサーバーサイド動的 OGP 画像生成はできない（固定 OGP＋テキスト共有で対応） | **採用** |
| **案2：フレームワークなしの Vanilla TypeScript + Vite（DOM 直接操作 SPA）** | ・本番ランタイム外部依存が `0個` になり、初期 JS バンドルが gzip `20〜35 KB` 程度まで小さくなる | ・スロット着脱・`STEPPING`/`RUNNING` 一括 `disabled`・`JA/EN` 即時切替のたびに DOM 再構築すると `document.activeElement`（キーボードフォーカス）が外れやすく、逆に手動差分パッチを書くと自作の劣化仮想 DOM になりバグが増える | 全19ステージ完走のキーボード操作性と154識別子の状態同期においてフォーカス喪失・属性更新漏れのリスクが高いため不採用 |
| **案3：Next.js（App Router / Static Export または SSR）** | ・ファイルベースルーティングとルート単位の静的 HTML 出力・メタデータ定義が組み込まれている | ・全機能がクライアント内の `localStorage`・Canvas 2D・Web Audio で完結するにもかかわらず RSC/App Router ランタイムが重く、ルート別チャンク分割が既定のため初期表示後に `offline` へ切り替えた際の別画面遷移（`AC-14`）でチャンク通信失敗を起こしやすい | サーバー描画すべき動的データが皆無であり、オフライン単体完結要件と単純さの原則に反するため不採用 |
| **案4：外部ヘッドレス UI 部品集（Radix UI 等）＋アイコン集（lucide-react）を併用する React SPA** | ・複雑なモーダルやドロップダウンメニューを作る場合は APG 準拠実装の手間が減る | ・本アプリは `<dialog>` やドロップダウンを一切使わず標準 `<button>`・`<a href>`・`<fieldset>` だけで完結するため不要な依存とバンドル肥大を招く | 標準 HTML 要素だけで `design/001-arcade-core.md` の全部品を100%表現できるため不要（単純さの原則） |

## いちばん強い反論と、それでも選んだ理由
- **いちばん強い反論**：「トップ（`/`）と診断カルテ（`/diagnostic`）を SPA の単一 `index.html` で配信すると、クローラや SNS カード展開ボットに対してルート別の専用 HTML 本文を初期レスポンスで返せず、検索流入（副の道）や URL 共有時の情報量が静的マルチページ生成（SSG）より弱いのではないか。また `react-dom` の約 `66 KB`（gzip）すら削れるはずではないか。」
- **それでも選んだ理由**：(1) 見つけてもらう主の道は「診断サマリー整形テキストのクリップボードコピー共有＋共通 OGP カード（`LOGIC ARCADE`）」（`docs/prd/product.md` 3章、`design/001-arcade-core.md` 1章）であり、スコア別のサーバーサイド動的 OGP 生成は最初から非目標である。`index.html` に日本語の適切な `<title>`・`<meta name="description">`・OGP タグを静的に埋め込み、ブラウザ上では遷移・言語切替ごとに `document.title` を即時更新すれば SNS カード表示と基本検索インデックスの双方を満たせる。(2) gzip `66.15 KB` のベース上にアプリ全コードを載せても `100 KB` 前後に収まり、LCP は実測 `0.4秒前後`（目標 `<= 2.5秒`）と十分速く、キーボードフォーカス維持と ARIA 状態整合の信頼性を優先する方が G3 品質に対して圧倒的に有利である。

## 結果
- **これで楽になること**：
  - 全4画面の状態遷移・ARIA 属性・日英辞書切替・`ErrorBoundary` を単一方向の React コンポーネントツリーで宣言的に保てる。
  - 初期ロード後はネットワーク完全遮断下でも全画面遷移・全19ステージ実行が通信 `0件` で動作する。
  - `web/` と `web/tests/acceptance/` の `package.json` を分離したことで、ステップ 9 で `verifier` が `web/tests/acceptance/` のみを作成して Red 検証を回し、ステップ 13 で `web-engineer` が `web/` を実装して Green にする分業が衝突なく動く。
- **これで難しくなること、守り続けること（詳細仕様）**：
  1. **対応ブラウザと Baseline 基準**：
     - 対象：Chrome / Edge / Firefox / Safari（macOS）の最新2メジャー版、および iOS Safari / Android Chrome の最新2メジャー版。
     - Web Platform Baseline **Widely available**（ES2022、Canvas 2D、Inline SVG、Web Audio API、Web Storage API、History API、CSS Grid / Flexbox / Custom Properties、`prefers-color-scheme`、`prefers-reduced-motion`、`forced-colors`）の範囲の標準機能を使う。
     - セキュアコンテキストや権限設定に依存する API（`navigator.clipboard.writeText`、`window.localStorage`、`AudioContext`）は必ず機能存在チェックと `try/catch` フォールバックをセットで実装する。
  2. **性能の予算と計測場所**：
     - 予算：`LCP <= 2.5秒`、`INP <= 200ms`、`CLS <= 0.1`、初期3導線操作可能 `<= 1.0秒`、Lighthouse Performance `>= 90`、**初期読込 JS（gzip 圧縮後合計）`<= 120 KB`（`122,880 bytes`）**、**初期読込 CSS（gzip 圧縮後合計）`<= 20 KB`（`20,480 bytes`）**。
     - 測り方：(a) `web/package.json` の `npm run build` 末尾（`scripts/check-bundle-budget.mjs`）で `dist/assets/*.js` と `*.css` の gzip 合計バイト数を検査し、上限超過時は終了コード `1` でビルドを落とす。(b) Lighthouse 予算定義を `web/lighthouse-budget.json` に置き、公式 `lighthouse@13.6.0` CLI で計測して G3 の検証レポートに出力を記録する（`@lhci/cli@0.16.0` は古い間接依存で `npm audit` High 脆弱性9件を引き起こすため不採用とし、`npm audit` 脆弱性 `0件` の `lighthouse@13.6.0` を直接採用した）。(c) 公開後は Cloudflare Web Analytics RUM の p75 で監視する。
  3. **ログイン・保存・環境変数の境界**：
     - 認証・ログイン・Cookie 発行は一切行わない（将来ログインを足す場合は新規 ADR を書き、`HttpOnly; Secure; SameSite=Lax` Cookie＋CSRF 防御を用い、トークンを `localStorage` に置かない）。
     - 将来バックエンド API を追加する場合は同一オリジン配下（`/api/*`）で配信して CORS 設定ミスとサードパーティ Cookie 問題を避ける。
     - Vite がクライアントバンドルに埋め込む環境変数は `VITE_` 接頭辞の公開非機密値（例：G5 で接続する匿名解析の公開収集 URL）のみとし、秘密鍵・API トークンを `VITE_*` やリポジトリ内に置くことを厳禁とする。
  4. **置き場所・デプロイ・戻し方・費用**：
     - 事業者：**Cloudflare Pages**（Free プラン：静的配信リクエスト無制限・帯域無料、**利用者 1,000 人あたり月額 `$0`**）。
     - 環境：PR ごとにプレビュー URL（`<hash>.<project>.pages.dev`、`X-Robots-Tag: noindex`）、ステージングブランチにステージング URL（本番同一設定＋`X-Robots-Tag: noindex`：G4 確認用）、`main` ブランチに本番 URL（G5 で Takuma 承認後に公開）。
     - 戻し方：Cloudflare Pages の Deployment History から直前の正常なイミュータブルデプロイに対し **Rollback to this deployment** を1回実行する（再ビルド不要・約30秒以内で切り戻し完了。手順書は `web/RUNBOOK.md` に整備し G5 前に試行する）。
     - SPA ルーティング設定：`web/public/_redirects`（`/* /index.html 200`）で `/combinator`・`/fermi`・`/diagnostic` および未知パス直アクセスをすべて SPA エントリで受ける。
  5. **安全のヘッダー**：
     - `web/public/_headers`（本番／ステージング Cloudflare Pages 用）および `web/tests/acceptance/scripts/serve-dist.mjs`（ローカル E2E 検証用）の双方で以下の HTTP レスポンスヘッダーを付与する：
       - `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`（※G5 で外部匿名解析オリジンを接続する際は、その収集オリジン1件のみを `connect-src` に明示追加する）
       - `Strict-Transport-Security: max-age=31536000; includeSubDomains`（HTTPS 配信時）
       - `X-Content-Type-Options: nosniff`
       - `Referrer-Policy: strict-origin-when-cross-origin`
       - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=()`
       - `X-Frame-Options: DENY`
  6. **テスト構成と分離規約**：
     - `web/vite.config.ts` の Vitest 設定では必ず `include: ['src/**/*.test.{ts,tsx}']`・`exclude: ['tests/acceptance/**', 'node_modules/**', 'dist/**']` を指定し、`web/tests/acceptance/` 内の Playwright `*.spec.ts` と衝突させない。
     - `web/tests/acceptance/` は独自の `package.json`・`package-lock.json`・`playwright.config.ts`・`scripts/serve-dist.mjs` を持ち、親の `web/node_modules` に依存せず受け入れテストフォルダ内の設定だけで Chromium / Firefox / WebKit の E2E と `@axe-core/playwright` 監査を実行する。失敗時の出力先は `../../test-results` と `../../playwright-report` に向け、`.github/workflows/web.yml` の失敗アーティファクト収集と一致させる。
  7. **計測・同意・外部送信規律**：
     - `001-arcade-core` 実装・G3 時点では外部送信 `0件`・Cookie `0件` のため同意バナー不要。G5 公開時に無料 Cookie レス匿名解析を有効化する際は、`docs/support/` に電気通信事業法の外部送信規律に基づく公表事項（送信先・送信項目・利用目的）を掲載し Takuma の承認を得る。
  8. **古いタブの扱い**：
     - 単一バンドル SPA のためデプロイ後に残った古いタブでもチャンク欠落エラーは起きない。別タブで新しい `schemaVersion` のデータが `localStorage` に書き込まれたことを検知した場合は、古いタブからの上書き保存を止めて再読み込み案内を表示する。
- **元に戻すときの手順と手間**：
  - 手間：大（約2〜3日）。フレームワークを変更する場合は `SimEngine`（純粋 TypeScript 層・無変更で再利用可）を残したまま `UIShell` の描画コンポーネントと `vite.config.ts` を差し替え、Playwright 全20 AC テストで回帰確認する。ホスティング事業者を変更する場合は静的 `dist/` 出力と `_headers` / SPA フォールバック設定を移行先（Vercel / GitHub Pages / Netlify 等）の設定ファイルへ写し替える。

## 見直す条件
1. 初期読込 JS バンドル（gzip 圧縮後）が `105 KB`（予算 `120 KB` の 87.5%）を超えたとき、または本番 RUM p75 で `LCP > 2.0秒` / `INP > 150ms` に悪化したとき（Preact 等への軽量化またはアセット削減を検討する）。
2. ステージ別・問題別の個別検索流入が月間流入の `30%` を超え、クローラ向けの個別事前レンダリング HTML が必要になったとき（ビルド時プリレンダリング SSG への拡張を検討する）。
3. オンラインランキングやアカウント同期などサーバー側状態を伴う機能の追加が承認されたとき（認証 Cookie・API オリジン・DB 構成の ADR を新設する）。
4. 採用した依存ライブラリ（`react`, `vite`, `openapi-typescript`, `@playwright/test` 等）に修正不能な重大脆弱性が発生したか、1年以上メンテナンスが停止したとき。

## 確かめたこと
- 公式ドキュメント（2026-11-12 確認）：
  - Rendering on the Web / Baseline / Core Web Vitals / Performance Budgets：`https://web.dev/articles/rendering-on-the-web`、`https://web.dev/baseline`、`https://web.dev/articles/vitals`、`https://web.dev/articles/performance-budgets-101`
  - MDN CSP / Permissions-Policy：`https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP`
  - Cloudflare Pages 料金・Headers・Redirects・Rollbacks：`https://developers.cloudflare.com/pages/functions/pricing/`
  - React 19 / Vite 8 / Vitest 5 / openapi-typescript 7 / Playwright / Lighthouse：`https://react.dev/`、`https://vite.dev`、`https://vitest.dev`、`https://openapi-ts.dev`、`https://playwright.dev`、`https://github.com/GoogleChrome/lighthouse`
- 実機 spike 検証（`/tmp/arcade-spike`、Node.js `v24.22.1` / npm `12.2.1`）：
  - `react@19.3.1` + `react-dom@19.3.1` + `typescript@5.9.3` + `vite@8.3.8` + `@vitejs/plugin-react@6.3.0` + `vitest@5.1.0` + `openapi-typescript@7.13.0` + `lighthouse@13.6.0` の解決・`npm audit`（脆弱性 `0件`）・型生成（`36.8ms`）・本番単一バンドルビルド（`69ms`、初期 JS gzip 実測 **`66.15 KB`** = `67,736 bytes <= 122,880 bytes`）・Vitest 実行（`87ms` PASS）・Lighthouse 実測（`Performance: 1.00`, `Accessibility: 1.00`, `LCP: 610ms`, `CLS: 0`）を確認。
  - 独立パッケージ `web/tests/acceptance`（`@playwright/test@1.65.0` + `@axe-core/playwright@4.14.0`、`npm audit` 脆弱性 `0件`）＋ Node 標準 `http` 配信サーバー `serve-dist.mjs`（`/__health` 準備完了エンドポイント付き）により、未ビルド時の即時 Red 失敗（`getByTestId('screen-lobby') not found`）とビルド後の Green 通過（`442ms` PASS・axe 違反 `0件`）の双方を確認。
  - なお `typescript@7.0.2` は `openapi-typescript@7.13.0` の `peerDependencies`（`"typescript": "^5.x"`）と衝突することを npm レジストリ検査で事前に特定し、`5.9.3` に固定した。

## 確かめ（B）
- [x] 案が2つ以上あり、どの案にも悪い点が書いてある
- [x] 反論、悪い結果、見直す条件が空でない
- [x] 確かめたことに、URL かコマンドの出力がある
