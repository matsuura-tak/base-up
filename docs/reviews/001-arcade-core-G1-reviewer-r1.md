PASS

## 指摘
なし

## 証拠
- 対象：`bc802efba8f16052ce2833ff950a6a658eaa6cc8...8202ac986028e6ce94183f61d19f9c7ff4087f46`（`BASE...HEAD`、機能名：`001-arcade-core`）、観点：**設計**（G1、Web の画面）
  - `git diff --name-only bc802efba8f16052ce2833ff950a6a658eaa6cc8...HEAD` の一覧と読んだ印：
    - [x] `.editorconfig`（全12行読了）
    - [x] `.gitignore`（全39行読了・BASE 差分確認）
    - [x] `.nvmrc`（全1行読了：`24`）
    - [x] `CLAUDE.md`（全45行読了・BASE 差分確認、`100行以内` 適合）
    - [x] `contracts/.spectral.yaml`（全4行読了）
    - [x] `contracts/arcade-test-seam.md`（全271行読了）
    - [x] `contracts/dependencies.md`（全23行読了・BASE 差分確認、全14パッケージ×11列）
    - [x] `contracts/openapi.yaml`（全1,447行読了）
    - [x] `docs/adr/001-web-foundation.md`（全93行読了）
    - [x] `docs/adr/002-client-state-and-simulation-engine.md`（全62行読了）
    - [x] `docs/adr/features/001-arcade-core.md`（全264行読了）

- 観点の表：

### 1. AC 対応表（`AC-1`〜`AC-20` 全20件）
本機能は PRD 第10章（非目標）によりバックエンド API・DB・認証を持たないブラウザ単体完結構成であるため、`docs/templates/adr.md:19` の規則に従い `operationId` は全件 `なし（端末のみ）` である。すべての AC に対し、`contracts/openapi.yaml` のスキーマ型（`openapi-typescript` 自動生成）および `contracts/arcade-test-seam.md` の DOM 識別子・公開読み取り API が漏れなく対応していることを確認した（未対応 AC `0件`）。

| AC | 画面（`design/001-arcade-core.md`） | 使う `operationId` | データ（`contracts/openapi.yaml` `components.schemas`） | テストつなぎ口（`contracts/arcade-test-seam.md`） | 判定 |
|---|---|---|---|---|---|
| AC-1 | 画面1（`/`）＋共通シェル | なし（端末のみ） | `ResolvedRoute`, `PersistedArcadeStateV1`, `DiagnosticProfile` | `screen-lobby`, `lobby-mode-combinator`/`fermi`/`diagnostic`, `nav-mode-*` | OK |
| AC-2 | 画面2（`/combinator?stage=1..10`） | なし（端末のみ） | `CombinatorStageDefinition`, `CombinatorModule` | `combinator-stage-1`〜`10`, `combinator-module-card-1`〜`7`（4属性要素）, `combinator-target-condition`, `combinator-overheat-limit` | OK |
| AC-3 | 画面2（`/combinator`） | なし（端末のみ） | `CombinatorStageDefinition`, `SimulationSnapshot`, `CombinatorStageRecord` | `combinator-slot-1`〜`3`, `combinator-run-button`, `combinator-simulation-canvas`, `combinator-result-status`, `combinator-score-value`, `data-cleared="true"` | OK |
| AC-4 | 画面2（全10ステージ定義＆ソルバー） | なし（端末のみ） | `CombinatorStageDefinition`, `StageAuditReport`, `CombinatorStageAuditEntry` | `window.__ARCADE_TEST_API__.auditAllStages()`＋3.2節 代表クリア順列（全10ステージ独立検算一致） | OK |
| AC-5 | 画面2（`/combinator`） | なし（端末のみ） | `SimulationSnapshot`, `PersistedArcadeStateV1` | `combinator-step-button`, `combinator-reset-button`, `getSimulationSnapshot()`（`stepIndex`, `officialAttemptCount`） | OK |
| AC-6 | 画面2（`/combinator`） | なし（端末のみ） | `SimulationSnapshot`, `CombinatorDebugLog`, `CombinatorFailureLocation`, `CombinatorFailureReason` | `combinator-result-status`（`CRASHED`/`FAILED`）, `combinator-debug-log`（`location`/`reason`/`values`）＋3.2節 代表破綻・未達順列 | OK |
| AC-7 | 画面3（`/fermi?stage=1..9`） | なし（端末のみ） | `FermiStageDefinition`, `FermiHypothesisSlot`, `FermiHypothesisCard` | `fermi-stage-1`〜`9`（`data-tier`）, `fermi-slot-act-1`〜`3`, `fermi-card-act1-1`〜`act3-4`（自由入力 `<input>` `0件`） | OK |
| AC-8 | 画面3（`/fermi`） | なし（端末のみ） | `FermiStageDefinition`, `SimulationSnapshot`, `FermiStageRecord`, `FermiJudgment` | `fermi-fire-button`, `fermi-simulation-canvas`, `fermi-result-status`（4段階判定）, `data-cleared="true"` | OK |
| AC-9 | 画面3（`/fermi`） | なし（端末のみ） | `FermiExplanation`, `FermiTrapNote`, `SimulationSnapshot` | `fermi-explanation-panel`（`fermi-comparison-values`, `fermi-baseline-breakdown`, `fermi-trap-notes`）, `fermi-reset-button` | OK |
| AC-10 | 画面4（`/diagnostic`） | なし（端末のみ） | `PersistedArcadeStateV1`, `DiagnosticProfile`, `DiagnosticAxisScores`, `OverallRank` | `diagnostic-axis-*-score`（5軸）, `diagnostic-radar-chart`/`polygon`, `diagnostic-overall-rank`, `diagnostic-copy-button`, `getDiagnosticProfile()` | OK |
| AC-11 | 画面4（`/diagnostic`） | なし（端末のみ） | `DiagnosticProfile`, `ShareResultState` | `diagnostic-copy-button`, `diagnostic-copy-toast`（`3000ms >= 2000ms`）, 6節 クロスブラウザ検証規約 | OK |
| AC-12 | 画面4（`/diagnostic`） | なし（端末のみ） | `PersistedArcadeStateV1`, `DiagnosticProfile` | `diagnostic-overall-rank`（`UNRANKED`）, `diagnostic-unranked-notice`, `diagnostic-start-combinator-button`, `diagnostic-start-fermi-button`, `diagnostic-copy-button`（`disabled`） | OK |
| AC-13 | 画面2・画面3 | なし（端末のみ） | `SimulationSnapshot`（`unassignedSlotNames`） | `combinator-slot-guidance`, `fermi-slot-guidance`, `combinator-run-button`/`step-button`/`fermi-fire-button`（`disabled`） | OK |
| AC-14 | 全4画面 | なし（端末のみ） | `PersistedArcadeStateV1`, `DiagnosticProfile` | 単一バンドル SPA（チャンク分割禁止）＋5節 `logic_arcade_state_v1` 永続化・シード規約 | OK |
| AC-15 | 共通シェル＋画面2・画面3 | なし（端末のみ） | `PersistedArcadeStateV1`, `AudioStateSnapshot` | `header-sound-toggle`（`aria-pressed`, `data-sound-state`）, `header-sound-state`, `getAudioState()`（`autoPlayBeforeGestureCount: 0`, `masterGainValue`, `synthTriggerCount`） | OK |
| AC-16 | 全4画面＋通知バー | なし（端末のみ） | `PersistedArcadeStateV1`, `StorageStatus`, `ClientErrorNoticeType` | `storage-fallback-banner`, `getStorageStatus()`, 5.2節 `localStorage` getter 例外・破損 JSON 注入規約 | OK |
| AC-17 | 画面2・画面3 | なし（端末のみ） | `SimulationSnapshot`（`currentShakeOffsetPx`, `maxShakeOffsetPx`） | 7節 `prefers-reduced-motion: reduce` 時 `450ms <= 1000ms`・シェイク `0px`・`page.clock` 互換規約 | OK |
| AC-18 | 全4画面 | なし（端末のみ） | `ResolvedRoute`, `DiagnosticProfile` | 全60行 DOM 識別子＋`design/tokens.json`（`targetMin: 24px`, `mobileMin: 320px`, `desktop: 1280px`） | OK |
| AC-19 | 画面3（全9ステージ定義＆ソルバー） | なし（端末のみ） | `FermiStageDefinition`, `StageAuditReport`, `FermiStageAuditEntry` | `window.__ARCADE_TEST_API__.auditAllStages()`＋3.3節 代表4判定カード組（全9ステージ×4組＝36組独立検算一致） | OK |
| AC-20 | 画面4（`/diagnostic`） | なし（端末のみ） | `DiagnosticProfile`, `ShareResultState`, `ClientErrorNoticeType` | `diagnostic-copy-error`, `diagnostic-manual-copy-textarea`, `diagnostic-select-all-button`, 6節 `NotAllowedError` 注入規約 | OK |

### 2. エンドポイントごとの認可と信頼境界の表（空欄 `0件`）
`contracts/openapi.yaml:21` は `paths: {}` であり、サーバーサイド HTTP API エンドポイントは **`0件`** である（ユーザーデータ・認証情報をサーバーで一切保持しないため、OWASP API1 BOLA・API3 BOPLA・API5 BFLA による他人のデータ到達経路は構造上 **`0件`**）。静的配信ルートおよびクライアント側信頼境界の認可・入力検証・上限設計は以下のとおりすべて定義されている。

| エンドポイント / 境界 | 誰が呼べるか（認可） | どの持ち主を確かめるか | 返すフィールド / 扱うデータ | 回数の上限・資源制御（API4 等） | 判定 |
|---|---|---|---|---|---|
| `contracts/openapi.yaml` HTTP API（`paths: {}`） | 該当なし（エンドポイント `0件`） | 該当なし（サーバー側ユーザーデータ `0件`） | なし（HTTP JSON API 通信 `0件`） | 該当なし（バックエンド計算・有料外部 API 課金 `0件`） | OK |
| `GET /`, `/combinator`, `/fermi`, `/diagnostic`, `/*`（Cloudflare Pages / `serve-dist.mjs` 静的 SPA 配信） | 公開（未認証の全ブラウザ利用者） | 不要（全利用者に同一の公開静的 HTML/JS/CSS バンドルのみを返却し、個人データは `0件`） | `index.html`、単一 JS（gzip `<= 120 KB`）・CSS（gzip `<= 20 KB`）、CSP・HSTS・`X-Content-Type-Options: nosniff`・`Permissions-Policy`・`X-Frame-Options: DENY` ヘッダー | Cloudflare Pages Free 静的エッジ CDN 無制限配信（`$0/月`）。初期ロード後のアプリ通信は `0件` | OK |
| `GET /__health`（ローカル E2E 専用 `serve-dist.mjs` のみ） | ローカルループバック `127.0.0.1:4173` 上の Playwright `webServer` のみ（本番 Cloudflare Pages には非存在） | 不要（固定文字列のみ） | HTTP `200 OK`・固定文字列 `"ok"` のみ | ローカルテスト起動時のヘルスチェックのみ | OK |
| クライアント境界1：URL パス＆クエリ（`?stage=`）→ ルーター | 同一タブ内のナビゲーション・直リンク | ブラウザ同一オリジン内のみ（他人のデータは存在しない） | `ResolvedRoute`（`route`, `stageId: 1..10 \| null`, `stageFallbackNotice`, `canonicalPath`） | React 標準テキストエスケープ（`dangerouslySetInnerHTML` 禁止）＋整数パース・範囲外 `?stage=1` 正規化（`replaceState`）で DOM XSS と無限リダイレクトを防止 | OK |
| クライアント境界2：`window.localStorage['logic_arcade_state_v1']` ⇔ `SafeStorageAdapter` | 同一オリジン（`self`）のスクリプトのみ（CSP `script-src 'self'` で外部スクリプト遮断） | 同一ブラウザプロファイル自身のローカル領域のみ | `PersistedArcadeStateV1`（クリア履歴・ミュート・言語・匿名真偽値算出用時刻、約 `1.5 KB`、個人情報 `0件`） | getter 参照含む全 I/O を `try/catch` 保護（例外時はインメモリ Map 退避）＋`migratePersistedState` で破損 JSON・未知 enum・`NaN` を正規化。`RUNNING` 中は全操作ボタンを `disabled` 化し連打多重書込を抑止 | OK |
| クライアント境界3：`navigator.clipboard.writeText` | 利用者が `diagnostic-copy-button` を明示押下した同期ジェスチャーコンテキストのみ | 利用者自身の OS クリップボードへの書き込みのみ（`readText` による勝手な読み取りは本番コードで行わない） | `diagnostic.share.template` による整形テキストサマリー（1回分） | 押下時1回のみ実行。未定義・拒否例外時は `try/catch` で捕捉し `<textarea readonly>` 手動コピーへ退避（`AC-20`） | OK |
| クライアント境界4：`window.__ARCADE_TEST_API__` | 同一タブ内の Playwright 検証スクリプト（および利用者自身の DevTools） | 同一タブ内のメモリ状態のみ（外部公開ネットワーク口なし） | `SimulationSnapshot`, `StageAuditReport`, `AudioStateSnapshot`, `PersistedArcadeStateV1`（deep copy）, `StorageStatus`, `DiagnosticProfile`, `TelemetryEvent[]` | **読み取り専用メソッドのみ**（状態書換メソッド `0件`）。メモリ内イベント保持も直近最大 `200件` リングバッファに制限（技術設計メモ `140行`） | OK |

### 3. 元に戻しにくい判断に対する「いちばん強い反論」と ADR 妥当性検証

| 元に戻しにくい判断（ADR） | レビュアーが独立に立てたいちばん強い反論 | ADR の回答と移行・撤回手順の有無 | 判定 |
|---|---|---|---|
| **1. React 19 + TypeScript + Vite 単一バンドル SPA・CSP 方針**（`docs/adr/001-web-foundation.md`） | 単一 `index.html` の SPA では `/combinator`・`/fermi`・`/diagnostic` ごとにサーバー側で異なる初期 HTML 本文や個別 OGP を返せず検索・共有で SSG より不利になり、また `react-dom`（gzip 約 `66 KB`）が初期バンドルに乗り、`style-src 'unsafe-inline'` を残すことになるのではないか。 | **回答・撤回手順あり（妥当）**：`ADR-001:30-31, 57, 70-75` で、主流入経路が「診断テキストの Clipboard コピー＋共通 OGP」（PRD 3章）でありスコア別動的 OGP は非目標であること、初期 JS gzip 実測 `66.15 KB`（予算 `120 KB` 以内）で `AC-14` オフライン遷移時のチャンク欠落を根絶し154識別子のフォーカス維持を確実にできることを示している。また `script-src 'self'`（`unsafe-inline`/`unsafe-eval` なし）・`frame-ancestors 'none'`・`media-src 'none'` で XSS と外部メディア読込を封じており、JS gzip `> 105 KB` または個別検索流入 `> 30%` 時の見直し条件と、純粋 TS の `SimEngine` を無変更で残したまま UI/SSG 層のみ差し替える撤回手順（約2〜3日）が明記されている。 | OK |
| **2. `localStorage['logic_arcade_state_v1']` 単一版管理 JSON スキーマ**（`docs/adr/002-client-state-and-simulation-engine.md`） | 複数タブで同時に別ステージを遊んだ際に単一 JSON の上書き競合が起きうるほか、将来のスキーマ変更時に既存利用者のブラウザに残った v1 データで起動クラッシュする危険があるのではないか。 | **回答・撤回手順あり（妥当）**：`ADR-001:68-69`・`ADR-002:16, 38, 41-42, 45`・技術設計メモ `142-146` で、初回描画ちらつき防止（`CLS <= 0.1`）と `AC-16` 同期検証に約 `1.5 KB` の `localStorage` が最適であること、`schemaVersion: 1` の破壊的変更禁止、`migratePersistedState` による破損・未知値正規化、別タブで新 `schemaVersion` 検知時の上書き抑止＋再読込案内、および `500 KB`（`100ステージ` 超）到達時の IndexedDB 移行手順（旧キー互換アダプタ経由、約2日）が明記されている。 | OK |
| **3. 本番バンドルでの読み取り専用 `window.__ARCADE_TEST_API__` 常時公開**（`docs/adr/002-client-state-and-simulation-engine.md`） | 本番ビルドの `window` に `auditAllStages()` を残すと、利用者が DevTools コンソールから1行実行するだけで全19ステージの代表正解順列・正解カード組をカンニングできてしまうのではないか。 | **回答・撤回手順あり（妥当）**：`ADR-002:29-30, 47`・技術設計メモ `170-171` で、(1) 静的 JS バンドルである以上 DevTools での定数閲覧自体は防げず、課金・賞金・全国ランキングを持たない個人学習ゲームでは他者・運営への損害がゼロであること、(2) テスト専用別ビルド（`VITE_TEST_MODE` 分岐）を作ると本番バンドル実物を検証できなくなる害の方が大きいこと、(3) 内部状態を一切変更しない読み取り専用メソッドのみに限定していることが論理的に示され、将来オンライン認定試験等を足す際のバックエンド採点移行条件も明記されている。 | OK |
| **4. `web/` と `web/tests/acceptance/` の独立 `package.json` 分離構成**（`ADR-001`・`contracts/arcade-test-seam.md` 8章） | `typescript` と `@types/node` が2つの `package.json` に重複して `npm ci` が2回走るため、パッケージ管理が二重化するのではないか。 | **回答・撤回手順あり（妥当）**：`ADR-001:37, 64-65`・`arcade-test-seam.md:258-271` で、`gates.md:59` と役割境界（Step 9 で `verifier` が `web/` 本体未作成のまま `web/tests/acceptance/` のみを作成して `/__health` 200＋`/` 404 で Red 検証を回し、Step 13 で `web-engineer` が `web/` のみを実装する）および Vitest / Playwright 衝突防止のために必須であることが示され、バージョンは `contracts/dependencies.md` で厳密固定（`5.9.3`, `24.19.2`）されている。 | OK |
| **5. 外部依存14パッケージ（本番ランタイムは `react` / `react-dom` の2つのみ）の選定**（`contracts/dependencies.md`・`ADR-001`・`ADR-002`） | 音声合成（Web Audio）や正五角形レーダーチャート（SVG）・ルーティングをライブラリなしで自前実装すると、実装コストやブラウザ差異の不具合が増えるのではないか。 | **回答・撤回手順あり（妥当）**：`ADR-001:27`・`ADR-002:26, 46` で、Tone.js や Phaser・チャート集を入れると gzip `120 KB` 予算超過とアクセシビリティ逸脱を招く一方、4種効果音と正五角形1個の描画は標準 API 数十行で決定論的に書けること、および Web Audio コードが `300行` を超えた際の見直し条件が明記されている。 | OK |

### 4. G1 設計監査の個別検証結果サマリー
1. **技術設計メモ `docs/adr/features/001-arcade-core.md` の「確かめ（A）」独立検証**：全項目適合。
2. **「Web の土台」ADR（`docs/adr/001-web-foundation.md`）および ADR-002 の「確かめ（B）」独立検証**：全項目適合。
3. **全19ステージ数理モデル・5軸算出式・テストつなぎ口8項目の独立検算**：モード1全10ステージ（`1,290` 順列）＆代表30順列、モード2全9ステージ（`279` 組）＆代表36カード組、5軸算出式・全6ランク到達、全60行（展開 `154` 識別子）および UI 辞書 `127` キー一致すべて誤差・差分 `0件`。
4. **`CLAUDE.md` と `.github/workflows/web.yml` の整合**：`CLAUDE.md` は `45行`（`<= 100行`）、`web_build` / `web_test` と失敗時アーティファクト出力先一致、保護ディレクトリ変更 `0件`、秘密情報 `0件`。
5. **日本の法令に関わる「要確認」事項**：`001-arcade-core` 実装・G3 時点では外部送信 `0件`。G5 本番公開で匿名解析を接続する場合は電気通信事業法第27条の12（外部送信規律）の公表要否・文面を計画どおり G5 関門で Takuma が最終承認する。

- 読んだファイル：
  - `.claude/agents/reviewer.md`, `.claude/skills/craft-reviewer/SKILL.md`, `.claude/skills/craft-reviewer/web.md`, `.claude/org/app.json`, `.github/workflows/web.yml`, `docs/org/gates.md`, `docs/templates/review-report.md`, `docs/templates/adr.md`
  - `docs/prd/product.md`, `docs/prd/001-arcade-core.md`, `docs/approvals/001-arcade-core-G0.md`, `docs/reviews/001-arcade-core-G0-verifier-r2.md`, `docs/reviews/001-arcade-core-G1-design-reviewer-r2.md`, `design/001-arcade-core.md`, `design/tokens.json`
  - `.editorconfig`, `.gitignore`, `.nvmrc`, `CLAUDE.md`, `contracts/.spectral.yaml`, `contracts/arcade-test-seam.md`, `contracts/dependencies.md`, `contracts/openapi.yaml`, `docs/adr/001-web-foundation.md`, `docs/adr/002-client-state-and-simulation-engine.md`, `docs/adr/features/001-arcade-core.md`
- 実行したコマンドと結果：
  1. `git rev-parse HEAD && git diff --name-only bc802efba8f16052ce2833ff950a6a658eaa6cc8...HEAD`、保護ディレクトリ変更 `0件`、秘密情報スキャン `0件`、`wc -l CLAUDE.md` → `45行`
  2. `npx --yes @stoplight/spectral-cli lint contracts/openapi.yaml --ruleset contracts/.spectral.yaml --fail-severity warn` → 警告・エラー `0件`、`npx --yes openapi-typescript@7.13.0 contracts/openapi.yaml | wc -l` → `478行` 生成確認
  3. `python3` / `node` によるモード1全10ステージ（`1,290` 順列）＆モード2全9ステージ（`279` 組）＆代表66フィクスチャ＆5軸算出式＆154識別子＆127キー＆9イベントの独立検算 → 不一致 `0件`
  4. `npm view` による全14パッケージの実在・ライセンス・`postinstall`（`0件`）・`peerDependencies` 競合（`0件`）・`engines` 確認
- 開いた URL と確認した日付：2026-11-12（OWASP API Security Top 10 2023、OWASP CSP / HTTP Headers Cheat Sheet、MDN CSP `media-src` / Autoplay guide、GitHub Advisory Database & Runner Images、総務省 外部送信規律）
- 未検証：なし

## 記録
- 関門：G1
- 判定した役：reviewer（観点：設計）
- 回：r1
- 対象：`docs/adr/`, `contracts/`, `CLAUDE.md`, ルート設定ファイル、`feat/001-arcade-core`、`bc802efba8f16052ce2833ff950a6a658eaa6cc8...8202ac986028e6ce94183f61d19f9c7ff4087f46`
- 日付：2026-11-12
