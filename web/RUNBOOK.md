# LOGIC ARCADE Web 公開・戻し方手順書（RUNBOOK）

本書は `docs/adr/001-web-foundation.md`（ADR-001）に基づき、`LOGIC ARCADE`（`web/`）のビルド確認、ステージング／本番公開（Cloudflare Pages）、安全ヘッダー確認、および異常発生時の即時切り戻し（Rollback）手順を定めた運用手順書です。

> **権限境界**：本番公開および本番ロールバックの実行は **Takuma のみ** が行います（`docs/org/gates.md`）。

---

## 1. 配信アーキテクチャと前提条件

- **ホスティング基盤**：Cloudflare Pages（Free プラン：静的アセット配信のみ、バックエンドサーバー・DB なし）
- **Node.js バージョン**：Node.js `24`（リポジトリ直下 `.nvmrc`）
- **ビルドコマンド**：`cd web && npm ci && npm run build`
  - 内部で順に (1) `openapi-typescript` による `src/generated/contracts.d.ts` 自動生成、(2) `tsc --noEmit` 型検査、(3) 単一バンドル `vite build`、(4) `scripts/check-bundle-budget.mjs`（初期 JS gzip `<= 120 KB`、CSS gzip `<= 20 KB`）を実行し、1つでも失敗すれば終了コード `1` で停止します。
- **配信ディレクトリ**：`web/dist`
  - `web/public/_headers` および `web/public/_redirects`（`/* /index.html 200`）がそのまま `web/dist/` 直下にコピーされ、Cloudflare Pages のエッジで解釈されます。

---

## 2. 公開前のローカル／ステージング確認手順（G4・G5）

### 2.1 ローカルでのビルド・単体テスト・受け入れテスト・性能監査

```bash
# 1. 本番ビルドと gzip バンドル予算検査
cd web && npm ci && npm run build

# 2. Vitest 単体テストと脆弱性監査
cd web && npm test && npm audit

# 3. Lighthouse 性能・アクセシビリティ予算検査（Performance >= 90, Accessibility = 100, LCP <= 2.5s, CLS <= 0.1）
cd web && npm run audit:lighthouse

# 4. Playwright 本物ブラウザ受け入れテスト
cd web/tests/acceptance && npm ci && npx playwright test
```

### 2.2 ステージング URL のヘッダー・検索除外確認（G4）

ステージング環境（`<branch>.<project>.pages.dev`）では検索エンジンにインデックスされないこと（`X-Robots-Tag: noindex`）および ADR-001 第5項の安全ヘッダーが付与されていることを `curl -sI` で確認します。

```bash
curl -sI https://<staging-branch>.<project>.pages.dev/
```

確認する必須レスポンスヘッダー：
- `HTTP/2 200`
- `content-security-policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`
- `strict-transport-security: max-age=31536000; includeSubDomains`
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=()`
- `x-frame-options: DENY`
- Cookie 発行（`set-cookie`）が `0件` であること

---

## 3. 本番公開手順（G5 通過後・Takuma 実行）

1. G3（機能完了）・G4（ステージング実機＆ASVS L1 監査）・G5（公開前監査・法務承認）がすべて PASS していることを確認する。
2. Cloudflare Pages のプロジェクト設定を確認する：
   - Production branch: `main`
   - Root directory: `/`（またはビルド設定で `cd web && npm ci && npm run build`、Build output directory: `web/dist`、環境変数 `NODE_VERSION=24`）
3. Takuma が PR を `main` ブランチへマージする。
4. デプロイ完了後、本番 URL に対して以下を確認する：
   - `curl -sI https://<production-domain>/` で HTTP `200` と全セキュリティヘッダーを確認
   - `/`, `/combinator`, `/fermi`, `/diagnostic` の直接アクセス（SPA フォールバック `200`）とオフライン動作を確認

---

## 4. 即時切り戻し（Rollback）手順（異常検知・G6 停止基準抵触時）

以下のいずれかに該当した場合は、コード修正を待たずに **直前の正常デプロイへ即時ロールバック** します（目標所要時間：`30秒以内`）：
- クライアント実行エラー発生セッション率が `2.0% 以上`（PRD 14章 撤退基準4）
- Core Web Vitals「良い」達成率（`LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1`）が `75.0% 未満`
- 重大な表示崩れ、セキュリティヘッダー欠落、または進行不能バグの発覚

### 4.1 Cloudflare Pages ダッシュボードからの即時ロールバック（推奨・約30秒）

1. Cloudflare Dashboard にログインし、**Workers & Pages** > 対象 Pages プロジェクトを開く。
2. **Deployments** タブから、現在本番公開中（`Production`）の1つ前にある正常稼働確認済みの Production デプロイ行を探す。
3. 右端のメニュー（`...`）から **Rollback to this deployment** を選択し、確認ダイアログで確定する。
4. 再ビルドなしでイミュータブルなビルド成果物へのポインタが即座に切り替わる。
5. 切り戻し後の確認：
   - `curl -sI https://<production-domain>/` で HTTP `200` を確認
   - シークレットウィンドウで `/`, `/combinator`, `/fermi`, `/diagnostic` を開き、初期表示・ステージ実行・保存データ（`logic_arcade_state_v1`）の読み込みに未捕捉例外がないことを確認する。

### 4.2 クライアント永続化データ（`localStorage`）への影響と互換性

- 本アプリは単一バンドル SPA であり、`localStorage['logic_arcade_state_v1']` の読み込み時に `migratePersistedState` が未知フィールド・未知 enum 値を安全に正規化する設計（ADR-001 第8項・ADR-002）となっています。
- そのため `schemaVersion: 1` 内のロールバックでは、利用者端末の既存クリア記録を壊すことなく直前の版でそのまま動作します。
