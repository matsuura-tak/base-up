# アプリの地図

このファイルはこのアプリの地図です。tech-lead（テックリード）が手入れし、100行以内に保ちます。
アプリ名と一言の説明は `.claude/org/app.json` の `app_name` と `idea` にあります。
組織の決まりは `.claude/rules/org.md`、関門は `docs/org/gates.md`、進み具合は `docs/progress.md` を読みます。

## 概要
- 何のアプリか：**LOGIC ARCADE**（仮称 `base-up`）。登録不要・ブラウザ単体で「3手システム設計パズル（全10ステージ）」と「3スロット対数フェルミ推定ゲーム（全9ステージ）」を遊び、5軸の思考特性スコア（0〜100）と総合認定ランク（`S+`〜`C`）を診断・共有できるレトロアーケード型 Web ゲーム。
- 使う人：業務の合間や技術面接・設計力トレーニング中に、スマホや PC で短時間（1ステージ約3分）で設計思考・概算センスを試したいソフトウェアエンジニア。
- いまの段階：機能 `001-arcade-core` の G1 設計（技術設計メモ・ADR・契約・テストつなぎ口・依存許可リスト）完了、次は G2 受け入れテスト先行作成と Web 実装。

## ビルド/テストのコマンド
`.claude/org/app.json` の `commands` と同じものを書きます。CI は `app.json` の方を使います。
コマンドを変えたら、`app.json` の更新を Takuma に頼みます（`.claude/` は Takuma だけが直せます）。
受け入れテストは、受け入れテストのフォルダ（`web/tests/acceptance/`）の中の設定だけで動く形にします。
- iOS のビルド：非該当（`stacks` に `ios` なし）
- iOS のテスト：非該当（`stacks` に `ios` なし）
- Web のビルド：`cd web && npm ci && npm run build`
- Web のテスト（単体と受け入れ）：`(cd web && npm test) && (cd web/tests/acceptance && npm ci && npx playwright install --with-deps chromium firefox webkit && npx playwright test)`
- 受け入れテスト単体実行（`verifier` 検証用）：`cd web/tests/acceptance && npm ci && npx playwright install --with-deps chromium firefox webkit && npx playwright test`
- バックエンドのテスト：未使用（`001-arcade-core` はブラウザ単体完結のため `backend/` 未作成）

## 構成
`app.json` の `paths` と合わせた構成です。

| 場所 | 中身 | 書く役 |
|---|---|---|
| `web/` | ブラウザで動く Web アプリ本体（React 19 + TypeScript + Vite 単一バンドル SPA）、単体テスト（Vitest）、性能予算（`lighthouse-budget.json`）、公開・戻し方手順書（`web/RUNBOOK.md`） | web-engineer |
| `web/tests/acceptance/` | Web の受け入れテスト（Playwright + `@axe-core/playwright`）、独立 `package.json`、`playwright.config.ts`、ローカル配信 `scripts/serve-dist.mjs` | verifier |
| `backend/` | 将来のバックエンド拡張用（`001-arcade-core` では使用・作成しない） | backend-engineer |
| `backend/tests/acceptance/` | 将来のバックエンド受け入れテスト用（`001-arcade-core` では使用しない） | verifier |
| `contracts/` | データ・テスト契約（`contracts/openapi.yaml`、`contracts/arcade-test-seam.md`）、依存許可リスト（`contracts/dependencies.md`） | tech-lead |
| `.gitignore`、`README.md`、`.nvmrc`、`.editorconfig` | ルートの設定ファイル（Node `24` 固定） | tech-lead |
| `design/` | 調査（`<機能名>-research.md`）、画面仕様（`design/001-arcade-core.md`）、ワイヤフレーム、デザイントークン（`design/tokens.json`） | designer |
| `docs/prd/`、`docs/support/`、`metadata/` | PRD（`product.md`、`001-arcade-core.md`）、利用規約・外部送信公表、公開メタデータ | pdm |
| `docs/adr/` | 土台・エンジン ADR（`001`、`002`）、機能技術設計メモ（`docs/adr/features/001-arcade-core.md`） | tech-lead |
| `docs/verification/` | テスト計画、検証レポート、証拠（`red.log`、スクリーンショット等） | verifier |
| `docs/progress.md`、`docs/reviews/`、`docs/approvals/` | 進捗、判定の記録、Takuma の承認 | 指揮役 |
| `.claude/`、`.github/` | 組織の定義と CI（キットが管理） | Takuma だけ |

## このアプリだけの決まり
- **Node・ビルド・型生成**：Node.js `24`（`.nvmrc`）、TypeScript `5.9.3`（`strict: true`）。`npm run build` で必ず `contracts/openapi.yaml` から `src/generated/contracts.d.ts` を生成し、`tsc --noEmit`・単一バンドル `vite build`・gzip 予算検査を通す（ADR-001）。
- **対応ブラウザと性能予算**：Chrome / Edge / Firefox / Safari（macOS・iOS）/ Android Chrome の最新2メジャー版（Baseline Widely available）。`LCP <= 2.5s`、`INP <= 200ms`、`CLS <= 0.1`、初期 JS `<= 120 KB`（gzip）、初期 CSS `<= 20 KB`（gzip）、初期ロード後の外部通信 `0件`・完全オフライン完走必須。
- **永続化・音声・テスト境界**：保存先は `localStorage['logic_arcade_state_v1']`（全 I/O を `try/catch` で保護し不可時はインメモリ退避＋バナー表示）。効果音は外部音源なしの Web Audio API 合成（操作前自動再生 `0回`、`SOUND OFF` 時マスターゲイン `0`）。`window.__ARCADE_TEST_API__` と全60行の `data-testid` は `contracts/arcade-test-seam.md` に厳密準拠する（ADR-002）。
- **見た目・言語・アクセシビリティ**：色・文字・余白・モーションは `design/tokens.json` のトークンのみを使用。既定言語は `ja` で `ja`/`en` 全130キー＋全19ステージ対訳の不一致 `0件`、`320px × 200%` 横はみ出し `0px`、動き軽減時シェイク `0px`、axe 違反 `0件` を守る。
