# LOGIC ARCADE 受け入れテストつなぎ口・全19ステージ確定仕様契約（`001-arcade-core`）

本契約は、`docs/reviews/001-arcade-core-G0-verifier-r2.md` で確定した「テストに要るつなぎ口の一覧（全8項目）」、`design/001-arcade-core.md` 第6章・第7章、および `contracts/openapi.yaml`（OpenAPI 3.1.0）を1つに結び、`verifier`（ステップ 9：受け入れテスト先行作成）と `web-engineer`（ステップ 13：Web 本体実装）が食い違い `0件` で作業できるようにする唯一の参照点である。

---

## 1. URL ルーティングと `data-testid`・ARIA・データ属性契約（つなぎ口 1）

### 1.1 URL パスと `?stage=` 正規化規則
- `/`：画面1『モード選択（トップ）』（`route = "lobby"`、`screen-lobby` 表示）
- `/combinator` または `/combinator?stage=1..10`：画面2『3-ACT COMBINATOR』（`route = "combinator"`、`screen-combinator` 表示、`?stage=` 省略時はステージ `1`・通知なし）
- `/fermi` または `/fermi?stage=1..9`：画面3『FERMI BLASTER』（`route = "fermi"`、`screen-fermi` 表示、`?stage=` 省略時はステージ `1`・通知なし）
- `/diagnostic`：画面4『思考力診断カルテ』（`route = "diagnostic"`、`screen-diagnostic` 表示）
- **範囲外・非整数 `?stage=` 指定時**（例：`/combinator?stage=99`, `/combinator?stage=abc`, `/fermi?stage=0`）：例外を出さず `window.history.replaceState` で `/combinator?stage=1` または `/fermi?stage=1` へ即時正規化し、`stage-fallback-notice`（`role="status"`、`common.stageFallbackNotice`）を1件表示する（別ステージ選択時に消去）。
- **未定義パス直アクセス時**（例：`/unknown-path`）：例外を出さず共通シェル内の `<main id="main-content">` に `not-found-section` と `not-found-home-link`（`<a href="/">`）を表示し、`document.title` を `page.title.notFound` に更新する。

### 1.2 全60項目（展開154識別子）DOM 契約一覧
`design/001-arcade-core.md` 第6章と1文字単位で一致させ、実装はすべての識別子・HTML 要素・ARIA 属性・補助 `data-*` 属性を厳守する。

| # | 画面 | `data-testid` | HTML 要素 / ロール / 必須属性 | 対応 AC・文言キー |
|---|---|---|---|---|
| 1 | 共通シェル | `skip-to-main-link` | `<a href="#main-content">`（`aria-label` 不使用） | `nav.skipToMain` |
| 2 | 共通シェル | `header-home-link` | `<a href="/">` + `aria-label`（先頭 `LOGIC ARCADE` 一致） | `app.name`, `nav.homeAria` |
| 3 | 共通シェル | `header-mode-nav` | `<nav aria-label>` | `nav.modeSwitcherAria` |
| 4 | 共通シェル | `nav-mode-combinator` | `<a href="/combinator">`（現在地は `aria-current="page"`） | `AC-1`, `nav.combinator` |
| 5 | 共通シェル | `nav-mode-fermi` | `<a href="/fermi">`（現在地は `aria-current="page"`） | `AC-1`, `nav.fermi` |
| 6 | 共通シェル | `nav-mode-diagnostic` | `<a href="/diagnostic">`（現在地は `aria-current="page"`） | `AC-1`, `nav.diagnostic` |
| 7 | 共通シェル | `header-sound-toggle`, `header-sound-state` | `<button type="button" aria-pressed="true\|false" data-sound-state="on\|off" aria-describedby="header-sound-state">` + `<span id="header-sound-state">` | `AC-15`, `header.sound.toggle`, `header.sound.on` / `off` |
| 8 | 共通シェル | `header-lang-ja` | `<button type="button" aria-pressed="true\|false" aria-label>`（先頭 `JA`） | `header.lang.ja`, `header.lang.switchJa` |
| 9 | 共通シェル | `header-lang-en` | `<button type="button" aria-pressed="true\|false" aria-label>`（先頭 `EN`） | `header.lang.en`, `header.lang.switchEn` |
| 10 | 共通シェル | `storage-fallback-banner` | `<div role="status">`（`localStorage` 利用不可退避時のみ表示） | `AC-16 (a)`, `banner.storageFallback` |
| 11 | 共通シェル | `error-reload-button` | `<button type="button">`（ErrorBoundary 捕捉時のみ表示） | `error.boundary.reload` |
| 12 | 共通シェル（404） | `not-found-section`, `not-found-home-link` | `<section>`（`<h1>` 含む）+ `<a href="/">` | `error.notFound.*` |
| 13 | 画面1 | `screen-lobby` | 画面1コンテナ（`<main id="main-content">` 内、`<h1>LOGIC ARCADE</h1>` 含む） | `AC-1` |
| 14 | 画面1 | `lobby-primary-start-button` | `<a href="...">`（$C_1=0 \to$ `/combinator?stage=1`、$C_1\ge 1 \land C_2=0 \to$ `/fermi?stage=1`、両方 $\ge 1 \to$ `/diagnostic`） | `lobby.cta.*` |
| 15 | 画面1 | `lobby-mode-combinator` | `<a href="/combinator">` | `AC-1`, `lobby.card.openCombinator` |
| 16 | 画面1 | `lobby-mode-fermi` | `<a href="/fermi">` | `AC-1`, `lobby.card.openFermi` |
| 17 | 画面1 | `lobby-mode-diagnostic` | `<a href="/diagnostic">` | `AC-1`, `lobby.card.openDiagnostic` |
| 18 | 画面1 | `lobby-progress-combinator`, `lobby-progress-fermi`, `lobby-rank-badge` | 進捗テキスト要素×2 + ランクバッジ | `common.progressCleared`, `diagnostic.rankLabel` |
| 19 | 画面2・3共通 | `stage-fallback-notice` | `<div role="status">`（不正 `?stage=` 安全補正時のみ表示） | `common.stageFallbackNotice` |
| 20 | 画面2 | `screen-combinator` | 画面2コンテナ（`<h1>3-ACT COMBINATOR</h1>` 含む） | `AC-2`〜`AC-6` |
| 21 | 画面2 | `combinator-stage-1` 〜 `combinator-stage-10` | `<button type="button" data-stage-id="1..10" data-cleared="true\|false" aria-pressed="true\|false" aria-label>`（`RUNNING` 中は `disabled`） | `AC-2`, `AC-3`, `combinator.stage.*` |
| 22 | 画面2 | `combinator-target-condition` | テキスト要素 | `AC-2`, `combinator.target.display` |
| 23 | 画面2 | `combinator-overheat-limit` | テキスト要素 | `AC-2`, `combinator.limit.display` |
| 24 | 画面2 | `combinator-telemetry-bar`, `combinator-param-energy`, `combinator-param-output`, `combinator-param-side-effect` | 現在パラメータ表示領域と3数値要素 | `AC-5`, `AC-6` |
| 25 | 画面2 | `combinator-simulation-canvas` | `<canvas role="img" aria-label>` | `AC-3`, `AC-5`, `AC-17`, `combinator.canvas.aria` |
| 26 | 画面2 | `combinator-result-status` | `<div role="status" data-status="IDLE\|STEPPING\|RUNNING\|STAGE CLEAR\|CRASHED\|FAILED">` | `AC-3`, `AC-5`, `AC-6`, `combinator.status.*` |
| 27 | 画面2 | `combinator-score-value` | スコア表示要素（`STAGE CLEAR` 時に獲得スコアを表示） | `AC-3`, `combinator.score.label` |
| 28 | 画面2 | `combinator-slot-1`, `combinator-slot-2`, `combinator-slot-3` | `<button type="button" data-assigned-module="<moduleId\|empty>">`（`RUNNING` 中は `disabled`） | `AC-3`, `AC-5`, `AC-13`, `combinator.slot.*` |
| 29 | 画面2 | `combinator-slot-guidance` | 案内テキスト要素（未配置スロット `>= 1` のときのみ表示、`{slots}` に `STEP 1, STEP 2` 等の識別子を含む） | `AC-13`, `combinator.guidance.unassigned` |
| 30 | 画面2 | `combinator-run-button` | `<button type="button">`（未配置あり または `RUNNING` 中は `disabled`） | `AC-3`, `AC-13`, `combinator.action.run` |
| 31 | 画面2 | `combinator-step-button` | `<button type="button">`（未配置あり、`RUNNING` 中、または3手検証完了・中断済時は `disabled`） | `AC-5`, `AC-13`, `combinator.action.step` |
| 32 | 画面2 | `combinator-reset-button` | `<button type="button">`（`RUNNING` 中のみ `disabled`） | `AC-5`, `combinator.action.reset` |
| 33 | 画面2 | `combinator-module-card-1` 〜 `combinator-module-card-7` | `<button type="button" data-module-id="...">`（ステージに応じ5〜7個。3枠満杯時の未配置カードおよび `RUNNING` 中の全カードは `disabled`） | `AC-2`, `combinator.module.*` |
| 34 | 画面2 | `combinator-module-effect-{k}`, `combinator-module-cost-{k}`, `combinator-module-side-effect-{k}`, `combinator-module-condition-{k}` | モジュールカード `k`（`1..7`）内の4属性要素 | `AC-2`, `combinator.attr.*` |
| 35 | 画面2 | `combinator-debug-log`, `combinator-debug-location`, `combinator-debug-reason`, `combinator-debug-values`, `combinator-debug-retry-hint` | `<section role="region">`（`CRASHED` または `FAILED` 時のみ表示） | `AC-6`, `combinator.debug.*` |
| 36 | 画面2 | `combinator-next-stage-button` | `<a>` または `<button type="button">`（`STAGE CLEAR` 時のみ表示） | `combinator.action.nextStage` / `lobby.card.openFermi` |
| 37 | 画面3 | `screen-fermi` | 画面3コンテナ（`<h1>FERMI BLASTER</h1>` 含む、自由数値 `<input>` は `0件`） | `AC-7`〜`AC-9`, `AC-19` |
| 38 | 画面3 | `fermi-stage-1` 〜 `fermi-stage-9` | `<button type="button" data-stage-id="1..9" data-tier="beginner\|intermediate\|advanced" data-cleared="true\|false" aria-pressed="true\|false" aria-label>`（`RUNNING` 中は `disabled`） | `AC-7`, `AC-8`, `fermi.stage.*` |
| 39 | 画面3 | `fermi-question-heading`, `fermi-formula-preview` | お題見出し要素 + `ACT 1 × ACT 2 × ACT 3` 選択式プレビュー | `AC-7`, `fermi.formula.emptySlot` |
| 40 | 画面3 | `fermi-simulation-canvas` | `<canvas role="img" aria-label>` | `AC-8`, `AC-17`, `fermi.canvas.aria` |
| 41 | 画面3 | `fermi-result-status` | `<div role="status" data-status="IDLE\|RUNNING\|PERFECT ORDER\|GOOD RANGE\|OVERKILL\|UNDERESTIMATE">` | `AC-8`, `fermi.status.*` |
| 42 | 画面3 | `fermi-slot-act-1`, `fermi-slot-act-2`, `fermi-slot-act-3` | `<fieldset>`（`<legend>` に `ACT 1`〜`ACT 3` と役割名を含む） | `AC-7` |
| 43 | 画面3 | `fermi-card-act{s}-{c}`（例：`fermi-card-act1-1` 〜 `fermi-card-act3-4`） | `<button type="button" data-card-id="..." aria-pressed="true\|false">`（`s=1..3`, `c=1..4`、`RUNNING` 中は `disabled`） | `AC-7`, `AC-19`, `fermi.card.*` |
| 44 | 画面3 | `fermi-slot-guidance` | 案内テキスト要素（未選択スロット `>= 1` のときのみ表示、`{slots}` に `ACT 1, ACT 2` 等を含む） | `AC-13`, `fermi.guidance.unassigned` |
| 45 | 画面3 | `fermi-fire-button` | `<button type="button">`（未選択あり または `RUNNING` 中は `disabled`） | `AC-8`, `AC-13`, `fermi.action.fire` |
| 46 | 画面3 | `fermi-reset-button` | `<button type="button">`（`RUNNING` 中のみ `disabled`） | `AC-9`, `fermi.action.reset` |
| 47 | 画面3 | `fermi-explanation-panel`, `fermi-comparison-values`, `fermi-baseline-breakdown`, `fermi-trap-notes`, `fermi-retry-hint` | 解説領域と3項目（`FIRE` 完了後表示、`fermi-retry-hint` は `OVERKILL` / `UNDERESTIMATE` 時表示） | `AC-9`, `fermi.explain.*` |
| 48 | 画面3 | `fermi-next-stage-button` | `<a>` または `<button type="button">`（`PERFECT ORDER` / `GOOD RANGE` クリア時のみ表示） | `combinator.action.nextStage` / `lobby.cta.openDiagnostic` |
| 49 | 画面4 | `screen-diagnostic` | 画面4コンテナ（`<h1>` 含む） | `AC-10`〜`AC-12`, `AC-20` |
| 50 | 画面4 | `diagnostic-overall-rank` | `<div data-rank="UNRANKED\|C\|B\|A\|S\|S+">` | `AC-10`, `AC-12`, `diagnostic.rankLabel` |
| 51 | 画面4 | `diagnostic-overall-score`, `diagnostic-progress-combinator`, `diagnostic-progress-fermi` | 総合スコア表示 + 両モード進捗表示 | `diagnostic.overallScore*`, `common.progressCleared` |
| 52 | 画面4 | `diagnostic-radar-chart`, `diagnostic-radar-polygon` | `<svg role="img" aria-labelledby="radar-title radar-desc">` + `<polygon data-vertex-count="5">` | `AC-10`, `diagnostic.radar.*` |
| 53 | 画面4 | `diagnostic-axis-spec` / `diagnostic-axis-spec-score`, `diagnostic-axis-sequence` / `diagnostic-axis-sequence-score`, `diagnostic-axis-resource` / `diagnostic-axis-resource-score`, `diagnostic-axis-fermi` / `diagnostic-axis-fermi-score`, `diagnostic-axis-hypothesis` / `diagnostic-axis-hypothesis-score` | 5軸の行要素と整数値（`0`〜`100`）要素 | `AC-10`, `AC-12`, `diagnostic.axis.*` |
| 54 | 画面4 | `diagnostic-unranked-notice` | 未解放案内要素（$C_1 = 0 \lor C_2 = 0$ のときのみ表示） | `AC-12`, `diagnostic.unranked.*` |
| 55 | 画面4 | `diagnostic-start-combinator-button` | `<a href="/combinator?stage=1">`（$C_1 = 0$ のとき表示） | `AC-12`, `lobby.cta.startCombinator` |
| 56 | 画面4 | `diagnostic-start-fermi-button` | `<a href="/fermi?stage=1">`（$C_2 = 0$ のとき表示） | `AC-12`, `lobby.cta.startFermi` |
| 57 | 画面4 | `diagnostic-copy-button` | `<button type="button">`（`UNRANKED` 時は `disabled`、ランク解放時は活性） | `AC-10`, `AC-11`, `AC-12`, `AC-20`, `diagnostic.action.copy` |
| 58 | 画面4 | `diagnostic-copy-toast` | `<div role="status">`（自動コピー成功時に `3000ms`［`>= 2000ms`］表示） | `AC-11`, `diagnostic.copy.toastSuccess` |
| 59 | 画面4 | `diagnostic-copy-error` | `<div role="alert">`（Clipboard 拒否・未定義時のみ表示） | `AC-20`, `diagnostic.copy.errorFallback` |
| 60 | 画面4 | `diagnostic-manual-copy-textarea`, `diagnostic-select-all-button` | `<textarea readonly>`（`<label>` 紐付け）+ `<button type="button">`（`AC-20` 発生時のみ表示） | `AC-20`, `diagnostic.copy.manualLabel`, `diagnostic.action.selectAll` |

---

## 2. 公開読み取りテストインターフェース `window.__ARCADE_TEST_API__`（つなぎ口 2・3・4）

実装はアプリ起動時（`createRoot` マウント前または直後）に `window.__ARCADE_TEST_API__` を常時登録する。すべての戻り値型は `contracts/openapi.yaml` の `components.schemas` から `openapi-typescript` で生成した型に厳密準拠する（状態を書き換えるミューテーションメソッドは一切置かない）。

```ts
import type { components } from '../generated/contracts';

export interface ArcadeTestApi {
  /** 現在のシミュレーション状態・ステップ位置(0..3)・初期/現在パラメータ・公式試行回数・シェイク振幅を返す */
  getSimulationSnapshot(): components['schemas']['SimulationSnapshot'];
  /** 全19ステージ（モード1全10・モード2全9）の全順列・全組み合わせ網羅ソルバーを実行して監査結果を返す */
  auditAllStages(): components['schemas']['StageAuditReport'];
  /** Web Audio API の soundEnabled・masterGainValue・synthTriggerCount・autoPlayBeforeGestureCount を返す */
  getAudioState(): components['schemas']['AudioStateSnapshot'];
  /** 現在の永続化スキーマ状態（インメモリ退避中を含む）のディープコピーを返す */
  getPersistedState(): components['schemas']['PersistedArcadeStateV1'];
  /** localStorage 利用可否・退避バナー表示有無・破損復旧フラグを返す */
  getStorageStatus(): components['schemas']['StorageStatus'];
  /** 現在の履歴から算出した5軸整数スコア・総合ランク・共有テキストを返す */
  getDiagnosticProfile(): components['schemas']['DiagnosticProfile'];
  /** セッション開始以降に発火された匿名 KPI イベント配列を返す */
  getEmittedEvents(): components['schemas']['TelemetryEvent'][];
}

declare global {
  interface Window {
    __ARCADE_TEST_API__?: ArcadeTestApi;
  }
}
```

---

## 3. 全19ステージの数理評価規則・確定パラメータ・代表フィクスチャ（つなぎ口 3：`AC-2`〜`AC-9`, `AC-19`）

### 3.1 モード1『3-ACT COMBINATOR』の1ステップ評価規則（`STEP`・`RUN`・ソルバー完全共通）
初期状態 `{ energy: initialEnergy, output: initialOutput, sideEffect: initialSideEffect, shieldActive: false }` から、`k = 1, 2, 3` の各スロットのモジュール `m` を以下の順序で純粋評価する：
1. **発動条件の事前判定**：ステップ実行前の状態 `(preEnergy, preOutput, preSideEffect)` に対して `m.condition` を判定する（`ALWAYS`: 常時 `true`、`IF_OUTPUT_GTE`: `preOutput >= threshold`、`IF_HEAT_GTE`: `preSideEffect >= threshold`、`IF_HEAT_LTE`: `preSideEffect <= threshold`、`IF_ENERGY_GTE`: `preEnergy >= threshold`、`IF_ENERGY_LTE`: `preEnergy <= threshold`）。
2. **エネルギー更新と枯渇検査**：`nextEnergy = preEnergy + m.energyDelta`。`nextEnergy < 0` の場合はその `STEP {k}` で即座に中断し、`status = "CRASHED"`, `location = "STEP {k}"`, `reason = "ENERGY_DEPLETED"`, `expectedValue = 0`, `actualValue = nextEnergy` とする。
3. **副作用（HEAT）更新と暴走上限検査**：`m.sideEffectDelta > 0 && preShieldActive` の場合は `effSideDelta = 0` として `shieldActive` を消費（`false` 化）し、それ以外は `effSideDelta = m.sideEffectDelta` とする。`nextSideEffect = Math.max(0, preSideEffect + effSideDelta)`。`nextSideEffect > stage.overloadLimit` の場合はその `STEP {k}` で即座に中断し、`status = "CRASHED"`, `location = "STEP {k}"`, `reason = "OVERLOAD_EXCEEDED"`, `expectedValue = stage.overloadLimit`, `actualValue = nextSideEffect` とする。
4. **基本性能の適用**：手順 1 で条件を満たしていた場合のみ `m.effect` を適用する（条件未達のときはコスト・副作用のみ反映され `output` は変化しない）：
   - `ADD`: `nextOutput = preOutput + value`
   - `MUL`: `nextOutput = preOutput * value`
   - `HEAT_TO_OUT`: `nextOutput = preOutput + preSideEffect * value`
   - `ENERGY_TO_OUT`: `nextOutput = preOutput + preEnergy * value`
   - `ADD_SHIELD`: `nextOutput = preOutput + value` かつ `nextShieldActive = true`
5. **3手完走後の最終判定**：3ステップすべて中断なく完了した時点で `output >= stage.targetOutput` なら `status = "STAGE CLEAR"`、獲得スコア `score = Math.max(500, 1000 + output * 10 + energy * 25 - sideEffect * 15)` とする。`output < stage.targetOutput` なら `status = "FAILED"`, `location = "FINAL CHECK"`, `reason = "TARGET_UNMET"`, `expectedValue = stage.targetOutput`, `actualValue = output` とする。

### 3.2 モード1 全10ステージ確定カタログと代表検証順列（`AC-2`, `AC-3`, `AC-4`, `AC-5`, `AC-6`）
各ステージのモジュール配列順（`k = 1..7` が `combinator-module-card-{k}` に対応）および網羅ソルバー検算値は以下のとおり固定する。高難度ステージ 8〜10 はいずれも副作用活用（`HEAT_TO_OUT` または負の冷却減算による上限回避）と `IF_*` 条件発火の両方が必須であり、それらを伴わないクリアは `0通り`（`AC-4` 準拠）である。

| Stage | 初期値 `(E, OUT, HEAT)` / 上限 `LIMIT` / 目標 `TARGET` | モジュール一覧 `(id: ΔE, ΔHEAT, 条件, 効果)` | 正解数 / `P(n,3)`（比率） | 代表クリア順列（`STAGE CLEAR`） | 代表途中破綻順列（`CRASHED`） | 代表完走未達順列（`FAILED`） |
|---|---|---|---|---|---|---|
| **S1** | `(10, 0, 0)` / `LIMIT 12` / `OUT >= 24` | 1.`s1-seed`(`-3,+2,ALWAYS,ADD 6`), 2.`s1-amp2`(`-3,+3,ALWAYS,MUL 2`), 3.`s1-amp2b`(`-4,+4,ALWAYS,MUL 2`), 4.`s1-add5`(`-2,+1,ALWAYS,ADD 5`), 5.`s1-over`(`-5,+10,ALWAYS,ADD 10`) | `2 / 60` (`3.3%`) | `["s1-seed","s1-amp2","s1-amp2b"]` (`OUT=24, score=1105`) | `["s1-seed","s1-amp2","s1-over"]` (`STEP 3`: `ENERGY_DEPLETED`) | `["s1-seed","s1-amp2","s1-add5"]` (`FINAL CHECK`: `OUT=17 < 24`) |
| **S2** | `(6, 2, 0)` / `LIMIT 12` / `OUT >= 30` | 1.`s2-cell`(`+5,+2,ALWAYS,ADD 2`), 2.`s2-boost`(`-4,+3,ALWAYS,ADD 6`), 3.`s2-tri`(`-7,+5,ALWAYS,MUL 3`), 4.`s2-patch`(`-2,+1,ALWAYS,ADD 5`), 5.`s2-burn`(`-5,+9,ALWAYS,MUL 2`) | `2 / 60` (`3.3%`) | `["s2-cell","s2-boost","s2-tri"]` (`OUT=30, score=1150`) | `["s2-cell","s2-boost","s2-burn"]` (`STEP 3`: `OVERLOAD_EXCEEDED`) | `["s2-cell","s2-boost","s2-patch"]` (`FINAL CHECK`: `OUT=15 < 30`) |
| **S3** | `(10, 0, 4)` / `LIMIT 10` / `OUT >= 32` | 1.`s3-core`(`-3,+6,ALWAYS,ADD 12`), 2.`s3-cool`(`-2,-6,ALWAYS,ADD 4`), 3.`s3-dup`(`-4,+6,ALWAYS,MUL 2`), 4.`s3-safe`(`-2,+1,ALWAYS,ADD 6`), 5.`s3-heavy`(`-6,+7,ALWAYS,ADD 14`) | `1 / 60` (`1.7%`) | `["s3-core","s3-cool","s3-dup"]` (`OUT=32, score=1195`) | `["s3-core","s3-cool","s3-heavy"]` (`STEP 3`: `ENERGY_DEPLETED`) | `["s3-core","s3-cool","s3-safe"]` (`FINAL CHECK`: `OUT=22 < 32`) |
| **S4** | `(10, 0, 3)` / `LIMIT 9` / `OUT >= 40` | 1.`s4-init`(`-3,+3,ALWAYS,ADD 10`), 2.`s4-guard`(`-2,0,ALWAYS,ADD_SHIELD 4`), 3.`s4-nova`(`-5,+8,ALWAYS,MUL 3`), 4.`s4-vent`(`-2,-4,ALWAYS,ADD 3`), 5.`s4-amp`(`-4,+4,ALWAYS,MUL 2`), 6.`s4-leak`(`-6,+5,ALWAYS,ADD 12`) | `1 / 120` (`0.8%`) | `["s4-init","s4-guard","s4-nova"]` (`OUT=42, score=1330`) | `["s4-init","s4-guard","s4-leak"]` (`STEP 3`: `ENERGY_DEPLETED`) | `["s4-init","s4-guard","s4-vent"]` (`FINAL CHECK`: `OUT=17 < 40`) |
| **S5** | `(10, 4, 0)` / `LIMIT 10` / `OUT >= 48` | 1.`s5-add8`(`-3,+3,ALWAYS,ADD 8`), 2.`s5-gate`(`-4,+4,IF_OUTPUT_GTE 12,MUL 4`), 3.`s5-trim`(`-2,-2,ALWAYS,ADD 2`), 4.`s5-add5`(`-2,+2,ALWAYS,ADD 5`), 5.`s5-mul2`(`-4,+5,ALWAYS,MUL 2`), 6.`s5-surge`(`-7,+7,ALWAYS,ADD 15`) | `7 / 120` (`5.8%`) | `["s5-add8","s5-gate","s5-trim"]` (`OUT=50, score=1450`) | `["s5-add8","s5-gate","s5-mul2"]` (`STEP 3`: `ENERGY_DEPLETED`) | `["s5-add8","s5-trim","s5-add5"]` (`FINAL CHECK`: `OUT=19 < 48`) |
| **S6** | `(9, 0, 6)` / `LIMIT 10` / `OUT >= 45` | 1.`s6-chill`(`-2,-5,ALWAYS,ADD 6`), 2.`s6-laser`(`-3,+4,IF_HEAT_LTE 2,ADD 18`), 3.`s6-double`(`-4,+4,ALWAYS,MUL 2`), 4.`s6-warm`(`-3,+3,ALWAYS,ADD 10`), 5.`s6-cell`(`+3,+3,ALWAYS,ADD 4`), 6.`s6-blast`(`-6,+6,ALWAYS,MUL 2`) | `1 / 120` (`0.8%`) | `["s6-chill","s6-laser","s6-double"]` (`OUT=48, score=1345`) | `["s6-chill","s6-laser","s6-blast"]` (`STEP 3`: `ENERGY_DEPLETED`) | `["s6-chill","s6-laser","s6-warm"]` (`FINAL CHECK`: `OUT=34 < 45`) |
| **S7** | `(4, 0, 2)` / `LIMIT 10` / `OUT >= 48` | 1.`s7-charge`(`+6,+3,ALWAYS,ADD 4`), 2.`s7-dynamo`(`-3,+2,IF_ENERGY_GTE 10,ENERGY_TO_OUT 2`), 3.`s7-amp2`(`-5,+3,ALWAYS,MUL 2`), 4.`s7-cool`(`-1,-4,ALWAYS,ADD 5`), 5.`s7-flat`(`-2,+2,ALWAYS,ADD 10`), 6.`s7-over`(`-6,+6,ALWAYS,MUL 3`) | `1 / 120` (`0.8%`) | `["s7-charge","s7-dynamo","s7-amp2"]` (`OUT=48, score=1380`) | `["s7-charge","s7-dynamo","s7-over"]` (`STEP 3`: `OVERLOAD_EXCEEDED`) | `["s7-charge","s7-dynamo","s7-cool"]` (`FINAL CHECK`: `OUT=29 < 48`) |
| **S8** | `(10, 0, 2)` / `LIMIT 10` / `OUT >= 64` | 1.`s8-ignite`(`-3,+7,ALWAYS,ADD 6`), 2.`s8-thermo`(`-3,-4,IF_HEAT_GTE 8,HEAT_TO_OUT 3`), 3.`s8-amp2`(`-4,+4,IF_OUTPUT_GTE 30,MUL 2`), 4.`s8-safe`(`-2,+1,ALWAYS,ADD 8`), 5.`s8-cool`(`-2,-5,ALWAYS,ADD 5`), 6.`s8-mul2`(`-5,+5,ALWAYS,MUL 2`), 7.`s8-melt`(`-3,+9,ALWAYS,ADD 20`) | `1 / 210` (`0.5%`, 単純クリア `0`) | `["s8-ignite","s8-thermo","s8-amp2"]` (`OUT=66, score=1525`) | `["s8-ignite","s8-thermo","s8-mul2"]` (`STEP 3`: `ENERGY_DEPLETED`) | `["s8-ignite","s8-thermo","s8-safe"]` (`FINAL CHECK`: `OUT=41 < 64`) |
| **S9** | `(5, 0, 5)` / `LIMIT 9` / `OUT >= 66` | 1.`s9-reactor`(`+6,+4,ALWAYS,ADD 8`), 2.`s9-siphon`(`-4,-5,IF_HEAT_GTE 8,ADD 15`), 3.`s9-hyper`(`-7,+5,IF_ENERGY_GTE 7,MUL 3`), 4.`s9-shield`(`-2,0,ALWAYS,ADD_SHIELD 5`), 5.`s9-add10`(`-3,+2,ALWAYS,ADD 10`), 6.`s9-mul2`(`-3,+3,ALWAYS,MUL 2`), 7.`s9-spike`(`-4,+6,ALWAYS,ADD 18`) | `1 / 210` (`0.5%`, 単純クリア `0`) | `["s9-reactor","s9-siphon","s9-hyper"]` (`OUT=69, score=1555`) | `["s9-reactor","s9-siphon","s9-spike"]` (`STEP 3`: `OVERLOAD_EXCEEDED`) | `["s9-reactor","s9-siphon","s9-shield"]` (`FINAL CHECK`: `OUT=28 < 66`) |
| **S10** | `(8, 2, 4)` / `LIMIT 10` / `OUT >= 105` | 1.`s10-stoke`(`-2,+6,ALWAYS,ADD 4`), 2.`s10-reclaim`(`+3,-6,IF_HEAT_GTE 10,HEAT_TO_OUT 3`), 3.`s10-overdrive`(`-9,+6,IF_OUTPUT_GTE 35,MUL 3`), 4.`s10-vent`(`-1,-4,ALWAYS,ADD 6`), 5.`s10-boost`(`-3,+3,ALWAYS,ADD 12`), 6.`s10-amp2`(`-4,+4,ALWAYS,MUL 2`), 7.`s10-overload`(`-3,+7,ALWAYS,ADD 25`) | `1 / 210` (`0.5%`, 単純クリア `0`) | `["s10-stoke","s10-reclaim","s10-overdrive"]` (`OUT=108, score=1930`) | `["s10-stoke","s10-reclaim","s10-overload"]` (`STEP 3`: `OVERLOAD_EXCEEDED`) | `["s10-stoke","s10-reclaim","s10-vent"]` (`FINAL CHECK`: `OUT=42 < 105`) |

### 3.3 モード2『FERMI BLASTER』の判定規則と全9ステージ確定カタログ（`AC-7`, `AC-8`, `AC-9`, `AC-19`）
- 推定値：`estimateValue = card_act1.numericValue * card_act2.numericValue * card_act3.numericValue`
- 対数誤差：`logError = Math.log10(estimateValue / stage.baselineValue)`
- 選択罠カード枚数：`trapTriggeredCount = [card_act1, card_act2, card_act3].filter(c => c.isTrap).length`
- 4段階判定規則（PRD 11章 `AC-8`）：
  1. `Math.abs(logError) <= 0.5 && trapTriggeredCount === 0` $\to$ **`PERFECT ORDER`**（クリア記録、`q_s = 1.0`）
  2. 上記以外で `Math.abs(logError) <= 1.0` $\to$ **`GOOD RANGE`**（クリア記録、未達成時は `q_s = 0.6`）
  3. `logError > 1.0` $\to$ **`OVERKILL`**（未クリア、`fermi-retry-hint` 表示）
  4. `logError < -1.0` $\to$ **`UNDERESTIMATE`**（未クリア、`fermi-retry-hint` 表示）
- 各スロット `s`（`1..3`）のカード配列順 `c`（`1..4`）は DOM 識別子 `fermi-card-act{s}-{c}`（`data-card-id="f{stage}-a{s}-{c}"`）に1対1で対応する。

| Stage（区分） | お題要旨 / 基準値 `baselineValue` | `ACT 1` カード `(c: numericValue, trap)` | `ACT 2` カード `(c: numericValue, trap)` | `ACT 3` カード `(c: numericValue, trap)` | `PERFECT ORDER` 数（比率） | 代表4判定カード組 `(act1, act2, act3)` |
|---|---|---|---|---|---|---|
| **S1**（`beginner`） | 国内飲料自販機の1日売上高（円/日） / `6.0e9` | 1:`2.4e6`, 2:`1.2e8`[罠:総人口混同], 3:`5.0e4`, 4:`6.0e6` | 1:`20`, 2:`600`[罠:月間本数混同], 3:`1.5` | 1:`130`, 2:`1300`[罠:桁10倍誤り], 3:`80` | `4 / 36` (`11.1%`) | PF:`(1,1,1)` / GD:`(1,3,2)` / OV:`(1,1,2)` / UN:`(1,3,1)` |
| **S2**（`beginner`） | 東京都内コンビニの1日淹れたてコーヒー販売杯数（杯/日） / `1.8e6` | 1:`7500`, 2:`56000`[罠:全国店舗数混同], 3:`500` | 1:`800`, 2:`8000`[罠:大型駅ビル客数混同], 3:`80` | 1:`0.28`, 2:`2.5`[罠:1人毎回2.5杯過剰計上], 3:`0.03` | `1 / 27` (`3.7%`) | PF:`(1,1,1)` / GD:`(1,1,2)` / OV:`(1,2,2)` / UN:`(1,3,1)` |
| **S3**（`beginner`） | 日本全体のスマホ充電1日総消費電力量（Wh/日） / `8.6e8` | 1:`9.0e7`, 2:`9.0e9`[罠:世界契約数混同], 3:`5.0e6` | 1:`0.85`, 2:`300`[罠:年間充電回数混同], 3:`0.05` | 1:`12`, 2:`3200`[罠:mAhとWhの単位混同], 3:`2` | `1 / 27` (`3.7%`) | PF:`(1,1,1)` / GD:`(1,1,3)` / OV:`(1,1,2)` / UN:`(1,3,1)` |
| **S4**（`intermediate`） | 平日昼の東京都内Web会議同時通信帯域合計（Mbps） / `1.5e5` | 1:`8.0e6`, 2:`1.25e8`[罠:全国総人口混同], 3:`4.0e5`, 4:`5.0e6` | 1:`0.015`, 2:`0.45`[罠:1日通算会議率と瞬間同時率の混同], 3:`0.0005` | 1:`1.3`, 2:`540`[罠:1時間MB量とMbpsの単位混同], 3:`0.1` | `2 / 36` (`5.6%`) | PF:`(1,1,1)` / GD:`(1,2,3)` / OV:`(1,1,2)` / UN:`(1,1,3)` |
| **S5**（`intermediate`） | 世界中のソフトウェア開発者が1日にコミットする新規コード行数（行/日） / `9.0e8` | 1:`3.0e7`, 2:`1.0e9`[罠:PC利用者全体との混同], 3:`1.5e6` | 1:`0.65`, 2:`5.0`[罠:稼働率100%超の二重計上], 3:`0.02` | 1:`45`, 2:`2500`[罠:自動生成ロックファイル込み行数混同], 3:`4` | `1 / 27` (`3.7%`) | PF:`(1,1,1)` / GD:`(1,2,1)` / OV:`(1,1,2)` / UN:`(1,1,3)` |
| **S6**（`intermediate`） | DAU 100万人のECサイトにおけるピーク時API秒間リクエスト数（RPS） / `3.5e4` | 1:`1.0e6`, 2:`3.0e7`[罠:MAU延べ人数との二重計上], 3:`5.0e4` | 1:`0.007`, 2:`0.25`[罠:時間集中率と秒間同時率の桁混同], 3:`0.0002` | 1:`5`, 2:`200`[罠:1セッション総通信数と秒間RPSの混同], 3:`0.3` | `1 / 27` (`3.7%`) | PF:`(1,1,1)` / GD:`(1,2,3)` / OV:`(1,1,2)` / UN:`(1,1,3)` |
| **S7**（`advanced`） | 平日朝ラッシュピーク時の山手線車内同時乗車人数合計（人） / `2.2e5` | 1:`45`, 2:`600`[罠:1日延べ運行本数との混同], 3:`8`, 4:`35` | 1:`11`, 2:`30`[罠:駅数と編成両数の混同], 3:`2` | 1:`440`, 2:`5000`[罠:1編成全員と1両定員の二重計上], 3:`40` | `2 / 36` (`5.6%`) | PF:`(1,1,1)` / GD:`(1,2,1)` / OV:`(1,1,2)` / UN:`(1,1,3)` |
| **S8**（`advanced`） | 国内クラウドサーバー群が1日に出力する非圧縮JSONアクセスログ総量（GB/日） / `1.6e7` | 1:`2.0e6`, 2:`8.0e7`[罠:世界全体台数との混同], 3:`1.0e5` | 1:`8.0e5`, 2:`8.0e7`[罠:ピークRPSを24時間継続とみなす過大計上], 3:`2.0e4` | 1:`1.0e-5`, 2:`1.0e-2`[罠:KBとMBの1000倍単位誤り], 3:`5.0e-7` | `1 / 27` (`3.7%`) | PF:`(1,1,1)` / GD:`(1,2,3)` / OV:`(1,1,2)` / UN:`(1,1,3)` |
| **S9**（`advanced`） | 東海道新幹線の1日あたり総輸送乗客数（人/日） / `4.0e5` | 1:`360`, 2:`800`[罠:山陽九州直通含む延べ列車数二重計上], 3:`40`, 4:`280` | 1:`1320`, 2:`13200`[罠:16両編成定員の10倍桁誤り], 3:`150` | 1:`0.85`, 2:`85`[罠:85%を0.85でなく85倍するパーセント誤算], 3:`0.1` | `2 / 36` (`5.6%`) | PF:`(1,1,1)` / GD:`(1,1,3)` / OV:`(1,1,2)` / UN:`(1,3,3)` |

---

## 4. Web Audio API 合成・ミュート制御契約（つなぎ口 4：`AC-15`）

1. **初回起動時の既定状態**：`localStorage` に保存がない初回起動時は `soundEnabled: true`（`header-sound-toggle` の `aria-pressed="true"`, `data-sound-state="on"`, `header-sound-state` テキスト `SOUND ON`）。
2. **操作前の自動再生禁止**：ページ読込・マウント時点では `OscillatorNode` の発音を一切行わず、`getAudioState().autoPlayBeforeGestureCount === 0` を厳守する。
3. **ユーザー操作時の合成発音**：`soundEnabled === true` の状態で `RUN`・`STEP`・`FIRE` ボタン等のユーザー操作ハンドラが実行されたとき、標準 `AudioContext` + `OscillatorNode` + マスター `GainNode`（標準ゲイン `0.25 > 0`）で合成音を鳴らし、`synthTriggerCount` を `+1` 以上加算する（外部 `.mp3`/`.wav`/`.ogg` へのリクエストは `0件`）。
4. **ミュート切替と永続化**：`header-sound-toggle` 押下で `soundEnabled` が `false` になると、マスター `GainNode.gain.value`（未初期化時も論理出力ゲイン）を即座に `0` に設定し（`getAudioState().masterGainValue === 0`）、`logic_arcade_state_v1` に `soundEnabled: false` を保存してリロード後も `SOUND OFF` を維持する。

---

## 5. `localStorage` 永続化・シード投入・例外／破損注入契約（つなぎ口 5：`AC-10`〜`AC-12`, `AC-14`, `AC-16`）

### 5.1 固定キーと5軸算出式の対応
- **固定キー**：`logic_arcade_state_v1`
- **PRD 11章変数との対応**：
  - $C_1$：`Object.values(state.combinatorStages).filter(r => r.cleared).length`
  - $F_{\text{count}}$：`Object.values(state.combinatorStages).filter(r => r.cleared && r.runAttemptsBeforeFirstClear === 1).length`
  - $a_s$：`r.runAttemptsBeforeFirstClear`（初回 `STAGE CLEAR` 達成時の `r.totalRunAttempts` を固定記録し、以後の再プレイでは上書きしない）
  - $R_1$：`state.combinatorTotalRuns`、$K_1$：`state.combinatorCrashedRuns`
  - $C_2$：`Object.values(state.fermiStages).filter(r => r.cleared).length`
  - $q_s$：`r.bestJudgment === 'PERFECT_ORDER' ? 1.0 : 0.6`
  - $F_2$：`state.fermiTotalFires`、$T_2$：`state.fermiTrapFires`

### 5.2 Playwright シード投入・例外注入スニペット
```ts
// (1) 任意履歴シード投入（例：両モードクリア済みランク解放状態）
await page.addInitScript((seed) => {
  window.localStorage.setItem('logic_arcade_state_v1', JSON.stringify(seed));
}, validSeedStateV1);

// (2) AC-16 (a)：window.localStorage getter 例外（SecurityError）の注入
await page.addInitScript(() => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() {
      throw new DOMException('Storage disabled by user preferences', 'SecurityError');
    },
  });
});

// (3) AC-16 (b)：破損 JSON 文字列の注入
await page.addInitScript(() => {
  window.localStorage.setItem('logic_arcade_state_v1', '{corrupted_json: [unclosed');
});
```

---

## 6. クリップボード成功読み取り・例外注入契約（つなぎ口 6：`AC-11`, `AC-20`）

1. **コピー文字列の仕様**：`diagnostic-copy-button` 押下時、現在の `locale` に応じた `design/001-arcade-core.md` 第7章 `diagnostic.share.template`（総合認定ランク、`overallScore`、全5軸の名称と整数スコアを含む文字列）を `navigator.clipboard.writeText(text)` に渡す。
2. **クロスブラウザ検証規約（Chromium / Firefox / WebKit 共通）**：
   - ヘッドレス Firefox / WebKit では OS レベルのクリップボード読み取り権限が環境依存になる場合があるため、`AC-11` では本物のボタン押下後に `navigator.clipboard.readText()`（Chromium `clipboard-read` 許可時）または `addInitScript` で `navigator.clipboard.writeText` にスパイラッパーを被せた実引数捕捉＋`diagnostic-copy-toast` の `>= 2000ms` 可視継続の双方で検証可能とする。
3. **`AC-20` 書き込み拒否・未定義注入スニペット**：
```ts
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async () => {
        throw new DOMException('Clipboard write permission denied', 'NotAllowedError');
      },
    },
  });
});
```
上記注入下で `diagnostic-copy-button` を押したとき、未捕捉例外は `0件`、`diagnostic-copy-toast` は非表示、`diagnostic-copy-error` が1件可視化され、`diagnostic-manual-copy-textarea` の `.inputValue()` に総合ランクと全5軸名・整数スコアが含まれる。

---

## 7. アニメーション・通知タイマーと `page.clock` 互換規約（つなぎ口 7：`AC-3`, `AC-5`, `AC-8`, `AC-9`, `AC-11`, `AC-17`）

1. **固定時間定数（`design/tokens.json` 準拠）**：
   - 通常時の連続実行（`RUN` / `FIRE`）完了時間：`2400ms`（上限 `3000ms` 以内：`AC-3`, `AC-8`）
   - モード1 `STEP` 1手完了時間：`450ms`（または同期更新後 `<= 450ms` で `STEPPING` 到達：`AC-5`）
   - `prefers-reduced-motion: reduce` 有効時の `RUN` / `FIRE` 完了時間：`450ms`（上限 `1000ms` 以内：`AC-17`）、かつ `maxShakeOffsetPx === 0`・`currentShakeOffsetPx === 0`
   - `RESET` 復帰時間：同期状態更新（`< 50ms`、上限 `200ms` 以内：`AC-5`, `AC-9`）
   - `diagnostic-copy-toast` 表示継続時間：`3000ms`（`>= 2000ms`：`AC-11`）
2. **`page.clock` 互換の実装義務**：
   - 実装はモジュールトップレベルで `const setTimeoutRef = window.setTimeout` のような事前束縛を行ってはならない。必ず実行時点で `window.setTimeout` / `window.clearTimeout` / `performance.now()` を参照し、Playwright の `await page.clock.install()` + `await page.clock.fastForward(...)` と実時間経過の双方で同一に完了させること。受け入れテストでの固定 `waitForTimeout`（`sleep`）は禁止する。

---

## 8. 受け入れテスト独立パッケージとローカル配信サーバー仕様（つなぎ口 8）

ステップ 9 で `verifier` は `web/tests/acceptance/` 配下のみを作成し（この時点では `web/` 本体は未作成）、ステップ 13 で `web-engineer` が `web/` 本体を実装する。受け入れテストが「受け入れテストのフォルダの中の設定だけ」で Red / Green の双方を確実に判定できるよう、以下の構成に固定する。

1. **配置ファイル（`web/tests/acceptance/`）**：
   - `web/tests/acceptance/package.json`（`contracts/dependencies.md` の `@playwright/test@1.65.0`, `@axe-core/playwright@4.14.0`, `typescript@5.9.3`, `@types/node@24.19.2` のみを使用）
   - `web/tests/acceptance/package-lock.json`
   - `web/tests/acceptance/tsconfig.json`
   - `web/tests/acceptance/playwright.config.ts`
   - `web/tests/acceptance/scripts/serve-dist.mjs`（Node 標準 `node:http` / `node:fs` のみで `web/dist` を配信）
   - `web/tests/acceptance/specs/*.spec.ts`
2. **ローカル配信サーバー `serve-dist.mjs` と `playwright.config.ts` の必須規約**：
   - ポート：`Number(process.env.PORT || 4173)`、バインド先：`127.0.0.1`、基準 URL：`process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173'`。
   - **ヘルスチェックエンドポイント `GET /__health`**：`web/dist` の有無にかかわらず常時 HTTP `200 OK`（本文 `"ok"`）を返す。`playwright.config.ts` の `webServer.url` には必ず `'http://127.0.0.1:4173/__health'` を指定する。これにより、ステップ 9（`web/dist` 未生成）で `webServer` 起動タイムアウトを起こさず `100ms` 未満でサーバーが立ち上がり、`page.goto('/')` が HTTP `404`（`Not Built Yet`）を返して各 AC テストが「画面・識別子がまだ存在しない」という正しい理由で Red 失敗（`evidence/red.log`）する。
   - **ビルド済み配信時（`web/dist/index.html` 存在時）**：実ファイルが存在すれば該当 MIME タイプで返し、拡張子なしの全 SPA ルート（`/`, `/combinator`, `/fermi`, `/diagnostic`, `/unknown` 等）には `web/dist/index.html` を HTTP `200` で返す。全レスポンスに ADR-001 第5項のセキュリティヘッダー（`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`）を付与する。
   - **Playwright プロジェクト構成**：`chromium`（Desktop Chrome）、`firefox`（Desktop Firefox）、`webkit`（Desktop Safari）の3エンジンを定義し、`retries: 0`、出力先 `outputDir: '../../test-results'`、HTML レポート `../../playwright-report`（`open: 'never'`）として `.github/workflows/web.yml` の失敗時アーティファクト回収パス（`web/playwright-report/`, `web/test-results/`）と一致させる。
