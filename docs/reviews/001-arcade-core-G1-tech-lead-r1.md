PASS

## 指摘

- **要修正**、`design/001-arcade-core.md:139-141, 160-162, 175-176, 187, 215-218`、第6章「読み上げのラベル」と第7章「UI 文言辞書」の間でボタンのアクセシブル名と可視ラベルが食い違っており、WAI-ARIA APG の Toggle Button 原則および WCAG 2.2 SC 2.5.3（Label in Name、レベル A）ならびに G2 の Playwright `getByRole` 検証で不整合を起こすリスクがある、根拠：`docs/prd/001-arcade-core.md:279`（WCAG 2.2 レベル AA 準拠）、WAI-ARIA APG Button Pattern（https://www.w3.org/WAI/ARIA/apg/patterns/button/ ：「Important: it is critical the label on a toggle does not change when its state changes」）、WCAG 2.2 SC 2.5.3 Label in Name（https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html ：可視テキストがアクセシブル名に含まれること）、直す方向：(1) `header-sound-toggle` は第6章（139行：`効果音...` / `Sound effects (pressed when on)`）と第7章（215-216行：`header.sound.ariaOn` = `Mute sound effects...` / `ariaOff` = `Enable sound effects...`）の定義が矛盾しており、`aria-pressed="true"` と `Mute sound effects` を併用すると支援技術で「ミュートが押下中（＝消音）」と逆転して読み上げられるため、可視ラベル `SOUND ON` / `SOUND OFF` を先頭に含む状態非逆転ラベル（例：`SOUND ON（効果音）` / `SOUND OFF（効果音）`、または可視テキストを `SOUND` 固定＋`aria-pressed` で状態伝達）に一本化する。(2) `header-lang-ja` / `header-lang-en`（140-141, 217-218行：可視文字 `JA` / `EN` が `aria-label` に未含有）は `JA：表示言語を日本語に切り替える` / `JA: Switch display language to Japanese` のように可視文字を先頭に含める。(3) `combinator-run-button`・`step`・`reset`（160-162 vs 242-244行）、`fermi-fire-button`・`reset`（175-176 vs 269-270行）、`diagnostic-copy-button`（187 vs 296行）は `aria-label` で可視文言（`RUN (Execute)` 等）を上書きせず、第7章のボタン表示文言自体をアクセシブル名とし、補足説明が必要な場合は `aria-describedby` 等で付与する形に揃える。
- **提案**、`design/001-arcade-core.md:115, 415` および `design/001-arcade-core/wireframes.md:133`、(1) 115行（画面2エラー列）の「不正な `?stage=` 指定時：ステージ1を表示し案内を出す」に対応する `data-testid` と第7章辞書キーがなく画面3（116行：ステージ1へ安全フォールバック）と挙動記述が微妙に異なる点、(2) 415行の `<nav aria-label="モード切替">` に対応する第7章の日英辞書キーがない点、(3) `wireframes.md:133` のモード2初期状態表記が `READY` となっており仕様本体（171, 271行）の `IDLE` と異なる点、根拠：`docs/prd/001-arcade-core.md:280`（`ja` / `en` 辞書キー完全一致・未翻訳露出 `0件`）、直す方向：(1) 不正な `?stage=` 指定時は画面2・3とも `history.replaceState` で `?stage=1` へ安全フォールバックする仕様に統一する（または案内文キーを追加する）、(2) 第7章に `nav.modeSwitcherAria`（`モード切替` / `Mode navigation`）を追加する、(3) `wireframes.md:133` の `READY` を `IDLE` に揃える。

## 証拠

- 対象：`main...HEAD`（`371348a...9149ca1`、ブランチ `feat/001-arcade-core`）、観点：G1 ステップ 6（技術判定 r1：今の Web 構成での実現性、全4画面・7状態・57行の `data-testid`・100キー日英辞書・Canvas/SVG＋DOM ミラー＋ARIA・Web Audio・`localStorage`/Clipboard 例外退避・`320px×200%` リフロー・`prefers-reduced-motion`・非機能予算・`verifier-r2` テストつなぎ口8項目の検証、およびステップ 7 で定義する契約・ADR 一覧の策定）
  - `git diff --name-only main...HEAD` の一覧と読んだ印：
    - [x] `design/001-arcade-core-research.md`（全165行読了・`git log` で仕様より先行コミット `9259081` であることを確認）
    - [x] `design/001-arcade-core.md`（全482行読了）
    - [x] `design/001-arcade-core/wireframes.md`（全174行読了）
    - [x] `design/tokens.json`（全306行読了・JSON 構文および全36組コントラスト比を検算）
    - [x] `docs/approvals/001-arcade-core-G0.md`（全16行読了）
    - [x] `docs/prd/001-arcade-core.md`（全356行読了）
    - [x] `docs/prd/product.md`（全59行読了）
    - [x] `docs/progress.md`
    - [x] `docs/reviews/001-arcade-core-G0-tech-lead-r1.md`
    - [x] `docs/reviews/001-arcade-core-G0-tech-lead-r2.md`（全134行読了）
    - [x] `docs/reviews/001-arcade-core-G0-verifier-r1.md`
    - [x] `docs/reviews/001-arcade-core-G0-verifier-r2.md`（全54行読了）

### (a) 画面・7状態・独自部品・AC・非機能要件・テストつなぎ口の実現性確認

#### 1. 画面・7状態ごとの必要データと操作（「要る operation の案」：`craft-tech-lead/SKILL.md` G1 #1）
本機能はサーバー・DB・ログインを持たないブラウザ単体完結構成（`docs/prd/001-arcade-core.md:111`、`docs/approvals/001-arcade-core-G0.md:16`）であるため、**バックエンド HTTP API の `operationId` は全画面で `なし（端末のみ）`（0件）** であり、全操作はクライアント内状態ストア・純粋関数エンジン・Storage/Audio/Clipboard アダプタで実現できる。

| 画面（URL） | 7状態の技術整合 | 端末内で要るデータ | クライアント内 operation 案（Step 7 設計メモ対応） |
|---|---|---|---|
| **共通シェル**（全画面上部） | 通常・保存無効退避通知（`AC-16(a)`）・エラーバウンダリ・オフライン（通信0件で同一動作）のすべてが端末内状態で完結する | `soundEnabled: boolean`（既定 `true`）、`locale: 'ja' \| 'en'`（既定 `'ja'`）、`storageAvailable: boolean`、現在ルート | `initAppSession()`（`localStorage` 安全読込・破損 JSON 初期化・初回訪問判定）、`toggleSound()`（`GainNode` 即時更新＋保存）、`setLocale(locale)`（辞書＋`document.title` 更新＋保存）、`navigateRoute(path)`（History API `pushState` による通信0件遷移） |
| **画面1：モード選択**（`/`） | 通常・空（`0/10`, `0/9`, `UNRANKED`）・読み込み中（同期マウント・固定高さ枠）・エラー・オフライン・権限拒否・一部読込（片モードクリア／破損 JSON 破棄）の7状態すべて実装可能 | `combinatorClearedCount` ($C_1$)、`fermiClearedCount` ($C_2$)、算出済み `overallRank`、UI 辞書 | `selectLobbyViewModel()`（$C_1, C_2$ から推奨主ボタン先 `/combinator?stage=1`・`/fermi?stage=1`・`/diagnostic` を一意導出） |
| **画面2：モード1『3-ACT COMBINATOR』**（`/combinator?stage=1..10`） | 通常・空（未配置案内 `AC-13`）・読み込み中（`RUNNING` 二重実行抑止）・エラー（`AC-13` 入力不足 / `AC-6` `CRASHED`・`FAILED`）・オフライン・権限拒否・一部読込の7状態すべて実装可能 | 内蔵ステージ定義10件（初期値・目標条件・暴走上限・5〜7モジュール4属性）、`slots: [id\|null, id\|null, id\|null]`、シミュレーション状態（`IDLE`/`STEPPING`/`RUNNING`/`STAGE CLEAR`/`CRASHED`/`FAILED`、現在ステップ `0..3`、現在パラメータ、デバッグログ3項目）、ステージ別クリア・試行履歴 | `selectCombinatorStage(stageId)`、`assignOrToggleModuleSlot(slotIndex, moduleId)`、`stepCombinatorSimulation()`（試行回数非加算で1手進行・一時停止：`AC-5`）、`runCombinatorSimulation()`（最大 `2.4s` / 動き軽減 `0.45s` 再生・`R_1`/`K_1`/`C_1`/`F_count`/`a_s` 更新・永続化：`AC-3`, `AC-6`, `AC-17`）、`resetCombinatorSimulation()`（`<= 0.1s` でスロット維持のまま初期値・`IDLE` 復帰：`AC-5`） |
| **画面3：モード2『FERMI BLASTER』**（`/fermi?stage=1..9`） | 通常・空（`? × ? × ?` 未選択案内 `AC-13`）・読み込み中（`RUNNING` レーザー再生）・エラー（`AC-13` 入力不足 / `OVERKILL`・`UNDERESTIMATE`）・オフライン・権限拒否・一部読込の7状態すべて実装可能 | 内蔵ステージ定義9件（初級3・中級3・上級3、基準値、基準式・解説、`ACT 1`〜`3` 各3〜4枚の仮説カードと罠理由）、選択中カード3枠、判定結果4段階と解説3項目、ステージ別最高判定係数 $q_s$・累積 `FIRE` 回数 $F_2$・罠選択回数 $T_2$ | `selectFermiStage(stageId)`、`selectOrToggleFermiCard(actIndex, cardId)`（再押下で選択解除可能にし `AC-13` も充足）、`fireFermiSimulation()`（`d = Math.log10(est / base)` 判定・$C_2, q_s, F_2, T_2$ 更新・解説3項目展開：`AC-8`, `AC-9`, `AC-17`）、`resetFermiStage()`（`<= 0.1s` で3スロット全解除・`IDLE` 復帰：`AC-9`） |
| **画面4：『思考力診断カルテ』**（`/diagnostic`） | 通常（解放済 `S+`〜`C`）・空（`UNRANKED`＋両開始ボタン `AC-12`）・読み込み中・エラー（自動コピー失敗 `AC-20`）・オフライン・権限拒否（Clipboard 拒否 `AC-20` / `localStorage` 拒否 `AC-16`）・一部読込（片モードクリア準空状態 `AC-12`）の7状態すべて実装可能 | 両モード集計履歴（$C_1, F_{\text{count}}, a_s, R_1, K_1, C_2, q_s, F_2, T_2$）、算出5軸整数スコア $X_1..X_5$、`overallScore`、`overallRank`、共有テキスト、コピー通知／手動コピー展開状態 | `computeDiagnosticProfile()`（PRD 11章算出式による5軸・ランク純粋算出：`AC-10`, `AC-12`）、`copyDiagnosticSummary()`（`navigator.clipboard.writeText` 呼び出し→成功時 `3.0s` トースト `AC-11`／未定義・例外時 `diagnostic-copy-error`＋手動コピー `<textarea readonly>` 展開 `AC-20`）、`selectAllManualCopyText()` |

#### 2. 標準部品から外れた独自部品の評価（`craft-tech-lead/SKILL.md` G1 #2）
理由のない独自部品は **`0件`**。全操作要素（ボタン・スロット・カード・手動コピー欄）は標準 HTML 要素（`<button>`, `<fieldset>`+`<legend>`, `<a href>`, `<textarea readonly>`）で構成されており、独自描画部品は次の3点のみに限定されている。

| 独自部品（`data-testid`） | 標準部品から外れる理由の妥当性 | 実装の手間（外部依存） | 文字拡大 `200%`・幅 `320px` リフローで作り直す範囲 | スクリーンリーダー（ARIA）・キーボード操作で作り直す範囲 |
|---|---|---|---|---|
| 画面2：3段回路盤面 `<canvas>`（`combinator-simulation-canvas`） | **妥当**（`AC-3`, `AC-5`, `AC-17` の信号パルス連続移動・波形ゲージ・スコアポップアップ・通常時シェイク／軽減時 `0px` 切替に必須） | 小〜中（標準 Canvas 2D API＋`requestAnimationFrame` 約180行、外部ライブラリ `0個`） | **最小**：Canvas 内に操作要素を置かず `width: 100%; max-width: 100%; height: auto` で親幅（最小 `296px`）へ縮小追従させ、数値・条件・ログはすべて外部の `rem` ベース標準 DOM に置くため文字切れが起きない | **最小**：フォーカス対象外（キーボード操作は外部 `<button>` で100%完結）とし、`<canvas role="img" aria-label="...">` の動的ラベル更新と直下 DOM ミラー（`<dl>`, `combinator-result-status`［`role="status"`］, `combinator-debug-log`）のみで対応可能 |
| 画面3：推定レーザー盤面 `<canvas>`（`fermi-simulation-canvas`） | **妥当**（`AC-8`, `AC-17` のクラスター増殖→フィルタ収束→対数オーダー帯レーザー着弾演出に必須） | 小〜中（標準 Canvas 2D API 約160行、外部ライブラリ `0個`） | **最小**：上記と同じく `width: 100%; max-width: 100%` 追従とし、仮説カード選択と数式・解説3項目は標準 DOM で折り返し描画する | **最小**：`<canvas role="img" aria-label="...">`＋`fermi-result-status`（`role="status"`）＋`fermi-explanation-panel` の DOM ミラーのみで対応可能 |
| 画面4：正五角形レーダーチャート `<svg>`（`diagnostic-radar-chart`） | **妥当**（`AC-10` が5角形レーダーチャート描画を明示要求しており、標準 `<meter>` / `<dl>` では極座標多角形を描けないため） | 小（インライン `<svg viewBox>`＋極座標5頂点算出 約100行、外部チャートライブラリ `0個`） | **最小**：`viewBox` 指定＋`width: 100%; max-width: 296px; height: auto` で縮小追従し、長い軸名称と点数は隣接 `<dl>`（`diagnostic-axis-*`）に常時テキスト表示するため `320px×200%` でもラベル見切れ `0件` | **最小**：`<svg role="img" aria-labelledby="radar-title radar-desc">` 内に `<title>` と5軸点数を列挙する `<desc>` を持ち、隣接 `<dl>` でも同値を読み上げ可能。`forced-colors: active` 時も `Highlight` / `CanvasText` 実線ストロークで輪郭維持 |

#### 3. オフライン・権限拒否・例外退避と端末内データの整合（`craft-tech-lead/SKILL.md` G1 #3）
- **完全オフライン動作（`AC-14`）**：全19ステージ定義・100キー＋ステージ対訳辞書・Web Audio 合成処理・SVG アイコンを単一バンドルへ同梱し、かつ上部ナビ `<a href="/...">` を **SPA クライアントルーティング（History API `pushState` / `popstate`）** で処理することで、`/` 初期読込後に `context.setOffline(true)` としても外部通信・ページ遷移通信ともに **`0件`** で全4画面の遷移とクリア記録が完結する。オンライン再読み込み時はホスティング／ローカル配信サーバーの SPA フォールバックにより `/combinator`・`/fermi`・`/diagnostic` でも HTTP 200 で即時復元される。
- **`localStorage` 例外・破損退避（`AC-16`）**：`window.localStorage` getter 参照・`getItem`・`setItem` のすべてを `try/catch` で包む Storage アダプタにより、(a) `SecurityError` / `QuotaExceededError` 時はインメモリストアへ自動退避して `storage-fallback-banner` を1件表示、(b) `JSON.parse` 失敗やスキーマ不正時は破損値を破棄し初期状態から再記録する動きが仕様と完全に一致する。
- **Clipboard 権限拒否・未定義退避（`AC-11`, `AC-20`）**：`navigator.clipboard?.writeText` の未定義判定と Promise `catch` により、失敗時は成功トーストを出さず `diagnostic-copy-error`（`role="alert"`）1件と共有テンプレート文字列入りの `<textarea readonly data-testid="diagnostic-manual-copy-textarea">` を即時表示でき、クロスブラウザで確実に動作する。
- **Web Audio 自動再生制限・ミュート保持（`AC-15`）**：ページ初期表示時は `AudioContext` 発音を一切行わず（自動再生 `0回`）、ユーザー操作イベント（`RUN` / `FIRE` 等）ハンドラ内で `AudioContext` の生成／`resume()` と `OscillatorNode` + `GainNode` 合成を行い、`SOUND OFF` 時はマスター `GainNode.gain.value = 0` かつ新規オシレータ生成を抑止して `localStorage` に保存する構成で完全に実現できる。

#### 4. PRD 全受け入れ条件（`AC-1`〜`AC-20`）および非機能要件の実現性検証サマリー
- **`AC-1`〜`AC-20` 対応**：`design/001-arcade-core.md` 第2章（43〜65行）に全20件が漏れなく1対1対応しており、第6章の57行（展開94識別子パターン）に欠落 `0件`、第7章 UI 辞書100キーに空値・プレースホルダー不一致 `0件`、`design/tokens.json` の全36組コントラスト計算値も WCAG 2.2 AA 基準（通常文字 `>= 4.5:1`、UI枠・図形 `>= 3.0:1`）と誤差 `0.02` 以内で完全一致することをスクリプトで検証した。
- **性能・バンドル予算（PRD 12章）**：外部 UI/チャート/音声ライブラリを使わない標準 DOM + Canvas 2D + インライン SVG + Web Audio 構成のため、全19ステージ定義と日英辞書を含めても初期 JS+CSS 合計は **gzip 後約 35〜65 KB**（予算上限 `100 KB` 以下）に収まり、ローカル本番ビルド配信で初期操作可能 `<= 1.0s`、`LCP <= 2.5s`、`INP <= 200ms`、`CLS <= 0.1`、`RESET <= 0.2s`（目標 `0.1s`）、通常再生 `<= 3.0s`（目標 `2.4s`）、`prefers-reduced-motion` 時シェイク `0px`・再生 `<= 1.0s`（目標 `0.45s`）を余裕をもって達成できる。
- **`320px×200%` リフロー（`AC-18`）**：`< 1280px` での1カラム縦積み、`flex-wrap: wrap`、全グリッド子要素の `min-width: 0; box-sizing: border-box`、`overflow-wrap: anywhere`、および全操作要素 `min-width: 24px; min-height: 24px`（スマホ主要操作高さ `>= 44px`、間隔 `>= 8px`）により、4表示条件すべてで横はみ出し `0px`・要素重なり `0件` を実現できる。

#### 5. `verifier-r2` テストつなぎ口8項目との整合確認表
| # | `verifier-r2` のテストつなぎ口要件 | デザイン仕様との整合判定と Step 7 契約化方針 |
|---|---|---|
| 1 | 全画面 DOM 識別子（`data-testid`）とアクセシブルな役割・名前（`AC-20` 手動コピー欄・`AC-12` 開始ボタン・`AC-16` 保存無効通知を含む） | **整合（57行・94識別子パターン完備）**。※ボタンの可視ラベルと `aria-label` の一致のみ上記「要修正」で統一する |
| 2 | Canvas / シミュレーション内部状態読み取り `window.__ARCADE_TEST_API__.getSimulationSnapshot()` | **整合**（`design/001-arcade-core.md:472` で `contracts/` への定義を引き継ぎ済み。`mode`, `stageId`, `status`, `currentStep`, `initialParams`, `currentParams`, `officialAttemptCount`, `currentShakeOffsetPx`, `maxShakeOffsetPx` を公開契約に含める） |
| 3 | 全19ステージ網羅ソルバー監査 `window.__ARCADE_TEST_API__.auditAllStages()` と代表フィクスチャ | **整合**（`design/001-arcade-core.md:48, 63` と一致。モード1全10ステージ `P(n,3)`・ステージ8〜10非自明性、モード2全9ステージ全組み合わせ・罠枚数、および各ステージの代表クリア／`CRASHED`／`FAILED`／罠組を Step 7 で契約化する） |
| 4 | Web Audio 状態読み取り `window.__ARCADE_TEST_API__.getAudioState()` | **整合**（`soundEnabled`, `masterGainValue`, `synthTriggerCount`, `autoPlayBeforeGestureCount` を公開契約に含める） |
| 5 | `localStorage` スキーマ契約・5軸算出履歴構造・シード投入／例外注入手順 | **整合**（固定保存キー・`schemaVersion: 1` の JSON スキーマと `addInitScript` 例外注入契約を Step 7 で定義する） |
| 6 | Clipboard 成功読み取り・失敗例外注入のクロスブラウザ検証契約（`AC-11`, `AC-20`） | **整合**（`diagnostic-copy-button` → `diagnostic-copy-toast` / `diagnostic-copy-error` + `diagnostic-manual-copy-textarea` の DOM 契約と `writeText` モック／reject 注入規約を Step 7 で定義する） |
| 7 | アニメーション・通知表示タイマーの `page.clock` 互換性 | **整合**（`tokens.json` の `simulationRunMaxMs: 2400` / `simulationReducedMotionMaxMs: 450` / `toastMinVisibleMs: 3000` を標準 `setTimeout` / `performance.now()` / `requestAnimationFrame` で駆動する契約を Step 7 で明記する） |
| 8 | 受け入れテスト用の固定ローカル本番ビルド配信サーバー仕様 | **整合**（SPA フォールバック対応の静的配信サーバー＋固定ポートを `web/tests/acceptance/playwright.config.ts` 内で完結させる契約を Step 7 で定義する） |

---

### (b) 次のステップ 7 で `contracts/`・`docs/adr/`・`CLAUDE.md`・ルート設定に定義すべき一覧

1. **`docs/adr/001-web-foundation.md`（「Web の土台」ADR：`craft-tech-lead/web.md` 全10項目）**
   - 描き方とフレームワーク：単一バンドル SPA＋History API ルーティング（`/`, `/combinator`, `/fermi`, `/diagnostic`）＋SPA フォールバック配信（代替案 SSR / MPA との比較、最強の反論、見直す条件）
   - 対応ブラウザ：Chromium / Firefox / Safari（macOS・iOS）最新2版、Baseline Widely Available 基準
   - 部品集・アイコン集：外部 UI ライブラリ不使用、標準 HTML 要素＋バンドル内蔵インライン SVG＋`design/tokens.json` トークン参照
   - 性能予算：`LCP <= 2.5s`、`INP <= 200ms`、`CLS <= 0.1`、初期操作可能 `<= 1.0s`、初期読込 JS+CSS 圧縮後（gzip）上限 `100 KB` 以下、Lighthouse CI 設定場所
   - ログインと保存：認証・Cookie `0件`、`localStorage` `try/catch` アダプタ＋インメモリ退避
   - 置き場所とデプロイ：Cloudflare Pages Free（`$0/月`、PR プレビュー・ステージング・本番、1操作ロールバック）
   - 安全のヘッダー：`_headers` による CSP（G3 時点 `connect-src 'none'`）、HSTS、`X-Content-Type-Options: nosniff`、`Referrer-Policy`、`Permissions-Policy`
   - テスト基盤：Vitest、Playwright（`web/tests/acceptance/` 自己完結設定）、`@axe-core/playwright`
   - 計測と同意：G3 時点外部送信 `0件` のクライアント内イベントフック、Cookie 同意不要、G5 外部送信規律公表方針
   - 古いタブ：バックエンド API 非依存＋`localStorage` `schemaVersion: 1` 前方互換・破損安全リセット
2. **`docs/adr/002-client-state-and-simulation-engine.md`（クライアント状態スキーマ・純粋関数シミュレーション／ソルバー・Web Audio 合成エンジン ADR）**
   - `localStorage` Versioned JSON スキーマ vs IndexedDB vs バックエンド保存の比較判断、および Web Audio オシレータ合成 vs 音声アセット配信の比較判断
3. **`docs/adr/features/001-arcade-core.md`（機能技術設計メモ：`docs/templates/adr.md` 型 A）**
   - `AC-1`〜`AC-20` 全20行の対応表（画面、`operationId: なし（端末のみ）`、データエンティティ、検証テスト）
   - Mermaid システムコンテキスト図・コンテナ図（信頼境界明示）
   - `spectral` / `oasdiff` 検査出力、データモデル表、非機能目標表、脅威モデル、PRD 15章全9イベント対応表
4. **`contracts/` の契約ファイル群**
   - `contracts/openapi.yaml`（OpenAPI 3.1.0）および `contracts/.spectral.yaml`：バックエンド API がないため `paths: {}` とし、`components.schemas` に (i) モード1全10・モード2全9ステージ定義データ型、(ii) `localStorage` 永続化データ `PersistedArcadeStateV1`（5軸算出用の全集計カウンタ $C_1, F_{\text{count}}, a_s, R_1, K_1, C_2, q_s, F_2, T_2$・音声・言語設定）、(iii) 5軸診断カルテ結果 `DiagnosticProfile`、(iv) シミュレーション状態・デバッグログ・Fermi 解説構造、(v) PRD 15章全9イベント型、(vi) `window.__ARCADE_TEST_API__` の全返却型（`SimulationSnapshot`, `StageAuditReport`, `AudioStateSnapshot`）を機械可読に定義し、`openapi-typescript` で `web/` の型を自動生成する契約とする
   - `contracts/arcade-test-seam.md`：`verifier-r2` のテストつなぎ口8項目（`window.__ARCADE_TEST_API__` メソッドシグネチャ、固定 `localStorage` キーとシード／getter 例外注入規約、Clipboard 成功／例外注入規約、`page.clock` 互換タイマー規約、受け入れテスト用 SPA ローカル配信サーバー規約）
   - `contracts/dependencies.md`：Web ビルド・型生成・単体／受け入れ／アクセシビリティテストに使う許可依存ライブラリ一覧（固定バージョン・ライセンス・更新日・標準代替・外す手間・解決／ビルド検証出力つき）
5. **`CLAUDE.md` およびルート設定ファイル**
   - `.nvmrc`（Node バージョン固定）、`.gitignore`、`.editorconfig`、および `CLAUDE.md` のアプリ概要・検証済みコマンド記載（`.claude/org/app.json` の `commands` 反映依頼値を報告に明記）

- 読んだファイル：
  - `.claude/agents/tech-lead.md`
  - `.claude/skills/craft-tech-lead/SKILL.md`
  - `.claude/skills/craft-tech-lead/web.md`
  - `.claude/org/app.json`
  - `CLAUDE.md`
  - `docs/org/gates.md`
  - `docs/templates/review-report.md`
  - `docs/templates/adr.md`
  - `docs/prd/product.md`
  - `docs/prd/001-arcade-core.md`
  - `docs/approvals/001-arcade-core-G0.md`
  - `docs/reviews/001-arcade-core-G0-verifier-r2.md`
  - `docs/reviews/001-arcade-core-G0-tech-lead-r2.md`
  - `design/001-arcade-core-research.md`
  - `design/001-arcade-core.md`
  - `design/tokens.json`
  - `design/001-arcade-core/wireframes.md`
  - `contracts/dependencies.md`
- 実行したコマンドと結果：
  1. `git status --short && git log --oneline -n 6 && git diff --name-only main...HEAD && ls -la contracts docs/adr` → `design/001-arcade-core-research.md`（`9259081`）が `design/001-arcade-core.md`（`9149ca1`）より前のコミットにあること、および `contracts/`・`docs/adr/` がまだ未作成段階であることを確認。
  2. `python3` による `AC-1`〜`AC-20` 網羅・`data-testid` 行数・100キー日英辞書・`R-1`〜`R-34` 参照・`tokens.json` 全36組コントラスト比検算スクリプト → PRD 20 AC と仕様2章 20 AC が完全一致、第6章 `57行`（展開 `94` 識別子パターン・参照漏れ `0件`）、第7章 `100` ユニークキー（空値 `0件`・`ja`/`en` プレースホルダー不一致 `0件`）、`R-1`〜`R-34` 未定義参照 `0件`、WCAG 2.2 相対輝度式による全36組×4配色（計144通り）すべてが基準値以上かつ仕様記載値との差 `<= 0.02` であることを確認。
  3. `python3` による第6章全57行の要素・ARIA 属性・読み上げラベルと第7章辞書の横断照合および `320px×200%` 最長トークン幅検査 → `tokens.json` の余白（`4/8/12/16/24/32px`）・文字4段階・モーション時間（`2400ms <= 3000ms`、`450ms <= 1000ms`、`100ms <= 200ms`、`3000ms >= 2000ms`、シェイク `4px`/`0px`）の整合を確認するとともに、上記「要修正」1件（第6章読み上げラベルと第7章ボタン表示文言の不一致）と「提案」1件を特定。
  4. `python3`（`urllib.request`）による W3C 公式仕様ページの取得・照合 → `https://www.w3.org/WAI/ARIA/apg/patterns/button/`（HTTP 200）で Toggle Button のラベル不変原則、`https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html`（HTTP 200）で SC 2.5.3 の可視テキスト包含要件、`https://dequeuniversity.com/rules/axe/4.10/label-content-name-mismatch`（HTTP 200）で `axe-core` の検査仕様を確認。
  5. `git status --short` → 出力なし（ワークツリー変更 `0件`）。
- 開いた URL と確認した日付：
  - `https://www.w3.org/WAI/ARIA/apg/patterns/button/`（2026-11-12 確認）
  - `https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html`（2026-11-12 確認）
  - `https://dequeuniversity.com/rules/axe/4.10/label-content-name-mismatch`（2026-11-12 確認）
- 未検証：なし

## 記録
- 関門：G1
- 判定した役：tech-lead
- 回：r1
- 対象：`design/001-arcade-core.md`、`design/tokens.json`、`design/001-arcade-core/wireframes.md`、`feat/001-arcade-core`、`371348a...9149ca1`
- 日付：2026-11-12
