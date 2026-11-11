PASS

## 指摘
なし

## 前回の指摘の追跡（r2 だけ）
| 前回の指摘 | 直った / 直っていない | 証拠 |
|---|---|---|
| **`tech-lead-r1` 要修正** / **`design-reviewer-r1` 重大**（旧 `design/001-arcade-core.md:135-187, 209-296`、`wireframes.md:15, 67, 125`）：第6章「読み上げのラベル」と第7章「UI 文言辞書」の二重定義・食い違い、WCAG 2.2 SC 2.5.3 Label in Name（レベル A）の先頭不一致／可視文字脱落、WAI-ARIA APG Toggle Button の動詞反転、およびステージ選択ボタン可視ラベルキー欠落 | 直った | (1) `design/001-arcade-core.md:144, 148-207` で、十分な可視文字を持つ標準 `<a>`/`<button>`（`nav-mode-*`, `lobby-*`, `combinator-run/step/reset-button`, `combinator-slot-*`, `combinator-module-card-*`, `fermi-card-act*`, `fermi-fire/reset-button`, `diagnostic-copy-button` 等）は不要な `aria-label` を使わず第7章の可視テキスト自体をアクセシブル名に統一した。<br>(2) `design/001-arcade-core.md:154, 232-234` で `header-sound-toggle` を固定可視名 `SOUND（効果音）` / `SOUND (SFX)`（`header.sound.toggle`）＋`aria-pressed="true\|false"`＋`data-sound-state="on\|off"`＋隣接状態バッジ `header-sound-state`（`aria-describedby`：`SOUND ON` / `SOUND OFF`）に一本化し、APG のトグルラベル不変原則と SC 2.5.3 と `AC-15` を同時に満たした。<br>(3) `aria-label` を使う `header-home-link`（`149, 227` 行）、`header-lang-ja/en`（`155-156, 235-238` 行）、`combinator-stage-1`〜`10`（`168, 260-263` 行）、`fermi-stage-1`〜`9`（`185, 302-305` 行）のすべてで可視文字（`LOGIC ARCADE`, `JA`, `EN`, `S{n}`, `S{n} CLEAR`）が `aria-label` の先頭に完全一致し、クリア済装飾アイコンも文字ノードを持たない `<svg aria-hidden="true">` に固定された。 |
| **`tech-lead-r1` 提案**（旧 `design/001-arcade-core.md:115, 415`、`wireframes.md:133`）：(1) 不正 `?stage=` 指定時の画面2・3挙動統一と識別子・辞書キー追加、(2) `<nav aria-label>` の日英辞書キー追加、(3) `wireframes.md` の `READY` → `IDLE` 統一 | 直った | (1) `design/001-arcade-core.md:18-19, 29, 42, 129-130, 166, 258` で画面2・3とも `history.replaceState` による `?stage=1` 安全補正＋`stage-fallback-notice`（`common.stageFallbackNotice`）1件表示に統一された。<br>(2) `design/001-arcade-core.md:150, 228, 470` に `header-mode-nav` と `nav.modeSwitcherAria`（`モード切替` / `Mode navigation`）が追加された。<br>(3) `design/001-arcade-core/wireframes.md:144` が `IDLE` に統一された（`READY` 残存 `0件`）。 |
| **`design-reviewer-r1` 要修正1**（旧 `design/001-arcade-core.md:70, 88, 136-138, 151, 168`）：上部 `<nav>` 標準リンクナビゲーションと APG Tabs Pattern の混同、および `fermi-stage-1`〜`9` の選択中 ARIA 属性欠落 | 直った | `design/001-arcade-core.md:81, 99, 150-153` で上部ナビを `<nav aria-label>` ランドマーク内の標準リンク `<a href="/..." aria-current="page">`（`role="tab"` 非付与、WCAG 2.4.8 / APG Landmarks 準拠）に統一し、`185` 行の `fermi-stage-1`〜`9` に選択中を示す `aria-pressed="true\|false"` が明記された。 |
| **`design-reviewer-r1` 要修正2**（旧 `design/001-arcade-core.md:27-30, 115-116, 158, 163, 264, 277-281`）：`RUNNING` 再生中の非活性対象未定義（画面3の二重 `FIRE` 抑止漏れ）、画面2の3スロット満杯時・`STEPPING` 中の押下規則未定義、画面3未達時の再試行案内キー欠落 | 直った | (1) `design/001-arcade-core.md:39, 44, 129-130, 168, 175, 177-180, 185, 190, 192-193` で画面2・画面3ともに `RUNNING` 中に `disabled` とする全ボタン・スロット・カード・ステージ選択要素が網羅列挙され、連打による試行回数（$R_1, F_2, T_2$）二重加算が防止された。<br>(2) `30-38, 180, 280` 行で3スロット満杯時の未配置モジュールカード `disabled`（`combinator.module.fullAction`、配置済み3スロット・3カードは活性維持でデッドロックなし）と、`STEPPING` 一時停止中の `STEP` / `RESET` / スロット変更（即 `IDLE` 復帰更新） / `RUN`（初期値から公式実行） / ステージ切替規則が一意に定義された。<br>(3) `44, 130, 194, 324` 行に `fermi-retry-hint`（`fermi.explain.retryHint`）が追加された。 |
| **`design-reviewer-r1` 要修正3**（旧 `design/001-arcade-core.md:13-21, 114-117, 142, 219, 224, 286, 298`）：未知 URL（404）直アクセス時および不正 `?stage=` 直アクセス時の表示・文言キー未定義と、第5章・第6章と第7章文言キーの不一致 | 直った | `design/001-arcade-core.md:21, 27, 128, 159, 225, 242-244` に未定義 URL 404 フォールバック（`not-found-section`, `not-found-home-link`, `page.title.notFound`, `error.notFound.*`）が追加され、不正 `?stage=` 補正通知（`stage-fallback-notice`, `common.stageFallbackNotice`）とあわせて第5章（`124-131` 行）・第6章（`148-207` 行）の全項目が第7章の127キーを直接参照し1文字単位で一致することを確認した。 |
| **`design-reviewer-r1` 要修正4**（旧 `design/001-arcade-core.md:77, 244, 270, 328, 336-356, 402, 413`、`tokens.json`）：`tokens.json` と仕様8章トークン一覧の過不足、413行の `box-shadow` 矛盾記述、および画面2・画面3の日本語 `RESET` ボタン文言の未区別 | 直った | (1) `design/tokens.json:280, 284` に `sizing.targetAuxiliaryRecommended`（`36px`）・`sizing.chartPolygonStrokeWidth`（`2.5px`）が追加され、`design/001-arcade-core.md:381-407` の色トークン表に `color.border.disabled`・`color.chart.polygonFill` を含む全25トークンが1対1で揃い、`468` 行から `box-shadow` 記述が削除された。<br>(2) `design/001-arcade-core.md:275, 312` で画面2は `RESET（初期値に戻す）` / `RESET (Restore)`（スロット維持：`AC-5`）、画面3は `RESET（選択をクリア）` / `RESET (Clear)`（全選択解除：`AC-9`）に明確に区別された。 |

## 証拠
- 対象：`9149ca1...a0dbc1c`（およびブランチ全体 `main...HEAD` = `371348a...a0dbc1c`）、観点：G1 ステップ 6（技術判定 r2：前回 r1 指摘の完全解消確認、新たに追加された 404 フォールバック・不正 `?stage=` 補正・`RUNNING`/`STEPPING`/3スロット満杯規則・127キー日英辞書・60行の `data-testid` を含む Web 実装実現性・アクセシビリティ・テストつなぎ口整合、およびステップ 7 契約・ADR への反映事項の確定）
  - `git diff --name-only 9149ca1...a0dbc1c` の一覧と読んだ印：
    - [x] `design/001-arcade-core.md`（全537行読了）
    - [x] `design/001-arcade-core/wireframes.md`（全188行読了）
    - [x] `design/tokens.json`（全308行読了）
    - [x] `docs/reviews/001-arcade-core-G1-design-reviewer-r1.md`（全144行読了）
    - [x] `docs/reviews/001-arcade-core-G1-tech-lead-r1.md`（全134行読了）
  - `git diff --name-only main...HEAD` の他ファイル確認：
    - [x] `design/001-arcade-core-research.md`（全165行読了・コミット `9259081` のまま仕様より先行を維持）
    - [x] `docs/prd/001-arcade-core.md`（全356行読了）
    - [x] `docs/approvals/001-arcade-core-G0.md`（全16行読了）
    - [x] `docs/reviews/001-arcade-core-G0-verifier-r2.md`（全54行読了）

- 観点の表：

### 1. 修正後デザイン仕様の画面・状態・クライアント内 operation 案と実現性確認（`craft-tech-lead/SKILL.md` G1 #1）
本機能はバックエンド API・DB・認証を持たないブラウザ単体完結構成（`docs/prd/001-arcade-core.md:111`）であり、**バックエンド HTTP API の `operationId` は全画面で `なし（端末のみ）`（0件）** である。r2 で追加・明確化された URL フォールバック、状態遷移、ボタン抑止規則はいずれも標準ブラウザ API と純粋関数状態機械のみで矛盾・デッドロックなく実装できる。

| 画面・ルート | r2 で更新された状態・規則の技術検証 | 端末内データ | クライアント内 operation 案（Step 7 設計メモ対応） |
|---|---|---|---|
| **共通シェル＋未定義 URL（404）**（全画面上部＋未知パス `/unknown` 等） | ・`header-sound-toggle`（固定ラベル `SOUND（効果音）` / `SOUND (SFX)`、`aria-pressed="true\|false"`、`data-sound-state="on\|off"`、`aria-describedby="header-sound-state"`）と隣接 `<span id="header-sound-state">`（`SOUND ON` / `SOUND OFF`）の分離により、APG トグル原則・WCAG 2.5.3・Playwright 検証が完全両立する。<br>・未知パス直アクセス時は SPA ルーターが `not-found-section`＋`not-found-home-link` を描画し `document.title` を `page.title.notFound` に更新することで例外 `0件`・1クリック復帰が成立する。 | `soundEnabled: boolean`, `locale: 'ja' \| 'en'`, `storageAvailable: boolean`, `route: 'lobby' \| 'combinator' \| 'fermi' \| 'diagnostic' \| 'notFound'` | `initAppSession()`, `resolveRoute(pathname, search)`（不正 `?stage=` 時は `history.replaceState` 補正＋`stageFallbackNotice: true` 返却、未知パス時は `'notFound'` 返却）, `toggleSound()`, `setLocale(locale)`, `navigateRoute(href)` |
| **画面1：モード選択**（`/`） | 進捗（$C_1, C_2$）連動の唯一のプライマリ主操作 `lobby-primary-start-button`（`lobby.cta.*`）と3モード導線・空状態案内 `lobby.emptyHint` が127キー辞書と完全一致。 | `C_1`, `C_2`, `overallRank`, UI 辞書 | `selectLobbyViewModel()` |
| **画面2：モード1『3-ACT COMBINATOR』**（`/combinator?stage=1..10`） | ・**不正 `?stage=` 補正**：`?stage=` 省略時は正常にステージ1（通知なし）、範囲外・非整数指定時は `history.replaceState('/combinator?stage=1')`＋`stage-fallback-notice` 表示（別ステージ選択時に消去）。<br>・**3スロット満杯規則**：3枠充足時は未配置モジュールカードのみ `disabled`（`combinator.module.fullAction`）、配置済み3スロット・3カードは活性維持のため1クリック解除→再配置が常に可能（デッドロック `0件`）。<br>・**`STEPPING` 規則**：`STEP` は $R_1$ 非加算で `1/3`→`2/3`→`3/3`（または違反停止）まで進行し完了時のみ `STEP` が `disabled`、`RESET` は常時活性で `<= 0.1s` 復帰、スロット／カード押下時は即 `IDLE`（ステップ `0`・初期値）へ戻して構成更新、`RUN` 押下時は初期値から公式連続実行。<br>・**`RUNNING` 二重実行抑止**：再生中は `RUN`/`STEP`/`RESET`/3スロット/全モジュールカード/全ステージ選択のすべてを `disabled` 化し $R_1, K_1$ の二重加算を防止。 | 内蔵ステージ定義10件、`slots`, `stageFallbackNotice: boolean`, シミュレーション状態（`IDLE`/`STEPPING`/`RUNNING`/`STAGE CLEAR`/`CRASHED`/`FAILED`, `step: 0..3`, 現在パラメータ, デバッグログ3項目＋`retryHint`）、履歴（$C_1, F_{\text{count}}, a_s, R_1, K_1$） | `selectCombinatorStage(stageId)`（`stageFallbackNotice` 消去）, `toggleCombinatorSlotOrModule(target)`（`STEPPING`/結果表示中は即 `IDLE` 初期化のうえ更新）, `stepCombinatorSimulation()`, `runCombinatorSimulation()`, `resetCombinatorSimulation()` |
| **画面3：モード2『FERMI BLASTER』**（`/fermi?stage=1..9`） | ・**不正 `?stage=` 補正**：画面2と同一規則で `/fermi?stage=1` 補正＋`stage-fallback-notice` 表示。<br>・**選択状態 ARIA**：`fermi-stage-1`〜`9` と `fermi-card-act{s}-{c}` の双方に `aria-pressed="true\|false"` を付与。<br>・**`RUNNING` 二重発射抑止**：再生中は `FIRE`/`RESET`/全仮説カード/全ステージ選択を `disabled` 化し $F_2, T_2$ の二重加算を防止。<br>・**未達リカバリ**：`OVERKILL` / `UNDERESTIMATE` 時に解説3項目に加えて `fermi-retry-hint`（`fermi.explain.retryHint`）を表示。`RESET（選択をクリア）` で `<= 0.1s` 全スロット解除。 | 内蔵ステージ定義9件、`selectedCards`, `stageFallbackNotice: boolean`, 判定結果4段階, 解説3項目＋`retryHint`, 履歴（$C_2, q_s, F_2, T_2$） | `selectFermiStage(stageId)`（`stageFallbackNotice` 消去）, `toggleFermiHypothesisCard(actIndex, cardId)`, `fireFermiSimulation()`, `resetFermiStage()` |
| **画面4：『思考力診断カルテ』**（`/diagnostic`） | 解放済（`S+`〜`C`＋5軸 `<dl>`＋正五角形 `<svg>`＋活性 `diagnostic-copy-button`）、未解放 `UNRANKED`（両未クリア／片側クリア別の案内 `diagnostic.unranked.*`＋未クリア側 STAGE 1 開始ボタン `AC-12`）、Clipboard 成功トースト（`3.0s >= 2.0s`：`AC-11`）・拒否時 `diagnostic-copy-error`＋`<textarea readonly>`＋`diagnostic-select-all-button`（`AC-20`）のすべてが辞書キーと完全整合。 | 算出5軸スコア $X_1..X_5$, `overallScore`, `overallRank`, 共有テキスト, コピー通知／手動コピー展開状態 | `computeDiagnosticProfile()`, `copyDiagnosticSummary()`, `selectAllManualCopyText()` |

### 2. 標準部品から外れた独自部品の評価（`craft-tech-lead/SKILL.md` G1 #2）
理由のない独自部品は **`0件`**。全操作要素は HTML 標準要素（`<header>`, `<nav>`, `<main>`, `<fieldset>`+`<legend>`, `<button type="button">`, `<a href>`, `<dl>`, `<label>`+`<textarea readonly>`）で構成されており、標準から外れる描画要素は次の3点のみである。

| 独自部品（`data-testid`） | 妥当性と外部依存 | `320px × 200%` リフローで作り直す範囲 | スクリーンリーダー・強制配色・動き軽減で作り直す範囲 |
|---|---|---|---|
| 画面2 `<canvas>`（`combinator-simulation-canvas`） | 妥当（`AC-3`, `AC-5`, `AC-17` の3段回路パルス・波形演出用、外部依存 `0個`） | 最小（内部に押下要素 `0件`、`width: 100%; max-width: 100%; height: auto` で縮小追従し、条件・数値・ログはすべて外部標準 DOM で折り返し表示） | 最小（`<canvas role="img" aria-label>` 動的更新＋`combinator-telemetry-bar` / `combinator-result-status`［`role="status"`］/ `combinator-debug-log` の完全 DOM ミラー＋`prefers-reduced-motion` 時シェイク `0px`・`450ms` 再生） |
| 画面3 `<canvas>`（`fermi-simulation-canvas`） | 妥当（`AC-8`, `AC-17` の増殖・フィルタ・対数レーザー演出用、外部依存 `0個`） | 最小（同上。仮説カード・数式プレビュー・解説3項目は標準 DOM に分離） | 最小（`<canvas role="img" aria-label>`＋`fermi-result-status`［`role="status"`］＋`fermi-explanation-panel` の完全 DOM ミラー＋動き軽減時シェイク `0px`・`450ms` 再生） |
| 画面4 `<svg>`（`diagnostic-radar-chart`） | 妥当（`AC-10` の5角形レーダーチャート要件、外部依存 `0個`） | 最小（`viewBox`＋`width: 100%; max-width: 296px; height: auto` で追従し、5軸名称と整数スコアは隣接 `<dl>` に常時テキスト表示） | 最小（`<svg role="img" aria-labelledby="radar-title radar-desc">`＋隣接 `<dl>` 併記＋`2.5px` 実線ストローク `>= 6.18:1`＋`forced-colors` 時 `Highlight`/`CanvasText` 実線維持） |

### 3. オフライン・権限拒否・辞書・トークン・`verifier-r2` テストつなぎ口の整合確認（`craft-tech-lead/SKILL.md` G1 #3）
- **完全オフライン・例外退避（`AC-14`, `AC-15`, `AC-16`, `AC-20`）**：初期バンドルへの全19ステージ定義・127キー UI 辞書＋ステージ日英対訳・インライン SVG アイコン・Web Audio 合成処理の同梱、History API による通信 `0件` ルーティング、`localStorage` getter/`getItem`/`setItem` を包む `try/catch` アダプタ（`storage-fallback-banner`＋インメモリ退避、破損 JSON 安全初期化）、Clipboard `writeText` 例外時の `diagnostic-copy-error`＋手動コピー `<textarea readonly>` 展開により、端末内状態と画面仕様に食い違いは `0件` である。
- **127キー日英辞書・60行 `data-testid`・全トークン・コントラスト検算**：
  - 第6章 `60行`（具体展開 `154` 識別子）すべてに一意な `data-testid` と ARIA ロール・ラベルが定義されており、`verifier-r2` 要求の全 DOM 識別子に加えて `header-sound-state`, `not-found-section`, `not-found-home-link`, `stage-fallback-notice`, `combinator-debug-retry-hint`, `fermi-retry-hint` まで漏れなく揃っている。
  - 第7章 `127` ユニークキーに重複・空欄・プレースホルダー不一致・本文からの未定義キー参照はすべて `0件` であり、`aria-label` を持つ全要素で可視文字列との先頭一致（WCAG 2.5.3）を機械検証で確認した。
  - `design/tokens.json` と第8章トークン定義（色25・文字4段階・余白6段階・サイズ10項目・ブレークポイント3段階・モーション11項目）の双方向差分 `0件`、および第9章全36組（4モード計144通り）の WCAG 相対輝度再計算で基準未達・記載誤差 `0件` を確認した。

### 4. 次のステップ 7 で `contracts/`・`docs/adr/`・`CLAUDE.md`・ルート設定に反映すべき事項
1. **`docs/adr/001-web-foundation.md`（「Web の土台」ADR：`craft-tech-lead/web.md` 全10項目）**
2. **`docs/adr/002-client-state-and-simulation-engine.md`（永続化状態スキーマ・純粋関数シミュレーション／網羅ソルバー・Web Audio 合成エンジン ADR）**
3. **`docs/adr/features/001-arcade-core.md`（機能技術設計メモ：`docs/templates/adr.md` 型 A）**
4. **`contracts/` の契約ファイル群**（`contracts/openapi.yaml`, `contracts/.spectral.yaml`, `contracts/arcade-test-seam.md`, `contracts/dependencies.md`）
5. **`CLAUDE.md` およびルート設定ファイル**（`.nvmrc`, `.gitignore`, `.editorconfig`）

- 読んだファイル：
  - `.claude/agents/tech-lead.md`
  - `.claude/skills/craft-tech-lead/SKILL.md`
  - `.claude/skills/craft-tech-lead/web.md`
  - `.claude/org/app.json`
  - `CLAUDE.md`
  - `docs/org/gates.md`
  - `docs/templates/review-report.md`
  - `docs/templates/adr.md`
  - `contracts/dependencies.md`
  - `docs/prd/001-arcade-core.md`
  - `docs/approvals/001-arcade-core-G0.md`
  - `docs/reviews/001-arcade-core-G0-verifier-r2.md`
  - `docs/reviews/001-arcade-core-G1-tech-lead-r1.md`
  - `docs/reviews/001-arcade-core-G1-design-reviewer-r1.md`
  - `design/001-arcade-core-research.md`
  - `design/001-arcade-core.md`
  - `design/tokens.json`
  - `design/001-arcade-core/wireframes.md`
- 実行したコマンドと結果：
  1. `git status --short && git log --oneline -n 8 && git diff --name-only 9149ca1...a0dbc1c && git diff --name-only main...HEAD && ls -la contracts docs/adr` → 差分対象ファイル一覧、`design/001-arcade-core-research.md`（`9259081`）が仕様より先行コミットのまま維持されていること、および `contracts/`・`docs/adr/` が未作成段階であることを確認。
  2. `git diff 9149ca1...a0dbc1c -- design/` → `design/001-arcade-core.md`、`design/tokens.json`、`design/001-arcade-core/wireframes.md` の全変更行を精査。
  3. `python3` による `AC-1`〜`AC-20` 網羅・第4章全21行根拠・第6章60行・第7章127キー辞書整合検査 → PRD 全20 AC 完全一致、未定義 `R-n` 参照 `0件`、第4章全21行に `R-n` と WCAG/APG URL または `B-1`〜`B-6` 完備、第7章 `127` ユニークキー（重複 `0件`・空欄 `0件`・`ja`/`en` プレースホルダー不一致 `0件`・仕様本文からの未定義キー参照 `0件`）を確認。
  4. `python3` による WCAG 2.2 SC 2.5.3 先頭一致・第6章対第7章リテラル完全一致・`tokens.json` 双方向一致・禁止表現検査 → `aria-label` 全ペアの先頭一致違反 `0件`、第6章と第7章の文言不一致 `0件`、色トークン `25 vs 25`（差分 `0件`・HEX/forcedColors 値不一致 `0件`）、非色トークン欠落 `0件`、8章外の生 HEX・`box-shadow`・グラデーション・絵文字・`wireframes.md` の `READY` 残存すべて `0件` を確認。
  5. `python3` による第9章全36組コントラスト再計算および第6章展開識別子カウント → 全36組×4配色（計144通り）で基準未達・記載誤差（`> 0.02`）`0件`、第6章 `60行`（具体展開 `154` 識別子）に新規7識別子を含む全つなぎ口が揃っていることを確認。
  6. `python3`（`urllib.request`）による第4章・第8章参照 W3C 公式 URL 9件の HTTP 疎通確認および `git status --short` → 全9 URL すべて HTTP `200`、ワークツリー変更 `0件` を確認。
- 開いた URL と確認した日付：
  - `https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/ARIA/apg/patterns/button/`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/ARIA/apg/patterns/alert/`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/WCAG22/Understanding/location.html`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html`（2026-11-12、HTTP 200）
- 未検証：なし

## 記録
- 関門：G1
- 判定した役：tech-lead
- 回：r2
- 対象：`design/001-arcade-core.md`、`design/tokens.json`、`design/001-arcade-core/wireframes.md`、`feat/001-arcade-core`、`9149ca1...a0dbc1c`
- 日付：2026-11-12
