# デザイン仕様 001-arcade-core：レトロアーケード型エンジニア思考ゲーム＆思考力診断カルテ

- 対象の PRD：docs/prd/001-arcade-core.md
- 調査：design/001-arcade-core-research.md（この仕様より先に書く）
- 書いた役：designer　日付：2026-11-12
- 図：design/001-arcade-core/wireframes.md　デザイントークン：design/tokens.json
- 原則の番号 B-1〜B-6 は .claude/skills/craft-designer/SKILL.md（Web の読み替えは .claude/skills/craft-designer/web.md）にある。

## 1. 画面の流れ

本機能はログイン・会員登録を一切設けず（`AC-1`）、共通アーケードシェル（上部 `<header>` ナビゲーション＋常設ミュート切替＋`JA / EN` 言語切替＋環境通知バー）の内側で次の **4画面** を URL と連動して切り替える構成とする。ブラウザの「戻る／進む」、再読み込み、URL 直接共有のいずれでも同じ画面・ステージが復元される。

### 画面一覧と URL・ページタイトル・ログイン・OGP 要否

| 画面 | URL の形 | ページの `<title>`（日本語 `ja` / 英語 `en`） | ログイン | 共有時の OGP（G5 公開時） |
|---|---|---|---|---|
| **画面1：モード選択（トップ）** | `/` | `ja`：`モード選択 \| LOGIC ARCADE`<br>`en`：`Mode Select \| LOGIC ARCADE` | 不要 | **要る**（主着地 URL。固定 OGP 画像 `1200x630px`・タイトル・説明文を設定） |
| **画面2：モード1『3-ACT COMBINATOR』** | `/combinator`（ステージ指定：`/combinator?stage=1`〜`10`、省略時は `?stage=1` 相当） | `ja`：`3-ACT COMBINATOR \| LOGIC ARCADE`<br>`en`：`3-ACT COMBINATOR \| LOGIC ARCADE` | 不要 | 共通 OGP を継承（個別動的画像生成は行わない） |
| **画面3：モード2『FERMI BLASTER』** | `/fermi`（ステージ指定：`/fermi?stage=1`〜`9`、省略時は `?stage=1` 相当） | `ja`：`FERMI BLASTER \| LOGIC ARCADE`<br>`en`：`FERMI BLASTER \| LOGIC ARCADE` | 不要 | 共通 OGP を継承（個別動的画像生成は行わない） |
| **画面4：『思考力診断カルテ』** | `/diagnostic` | `ja`：`思考力診断カルテ \| LOGIC ARCADE`<br>`en`：`Diagnostic Chart \| LOGIC ARCADE` | 不要 | **要る**（診断結果テキスト共有時の着地 URL。静的配信のためスコア別の動的画像生成は行わず、共通 OGP メタタグ＋クリップボードの整形テキストサマリーで共有する） |

### 画面遷移と分岐の流れ

1. **初回アクセス（`/`）**：ブラウザで開いてから `1.0秒以内` にアカウント登録画面や自動音声再生なしで「画面1：モード選択」と上部ナビゲーションの3導線（『3-ACT COMBINATOR』『FERMI BLASTER』『思考力診断カルテ』）が操作可能になる（`AC-1`, `AC-15`）。
   - **推奨主操作の分岐**：未プレイ時（$C_1 = 0$）は主ボタンが `/combinator?stage=1` を指す → モード1を1ステージ以上クリア済みかつモード2未クリア時（$C_1 \ge 1 \land C_2 = 0$）は `/fermi?stage=1` を指す → 両モード各1ステージ以上クリア済み時（$C_1 \ge 1 \land C_2 \ge 1$）は `/diagnostic` を指す。利用者はいつでも3枚のモードカードまたは上部ナビゲーションから任意の画面へ直接移動できる。
2. **画面1（`/`）または上部ナビ → 画面2（`/combinator?stage=1..10`）**：
   - ステージ1〜10を選択（`AC-2`）→ モジュールデッキ（5〜7個）から3つを選んで `STEP 1`〜`STEP 3` スロットに配置（1つ以上未配置の間は `RUN`・`STEP` が `disabled` で不足スロット名を案内：`AC-13`）。
   - **分岐2a（`STEP` 押下）**：試行回数を加算せず1手分のみ再生して一時停止 → `RESET` 押下で `0.2秒以内` にスロット配置を維持したまま初期状態 `IDLE` へ戻る（`AC-5`）。
   - **分岐2b（`RUN` 押下 → クリア）**：`3.0秒以内`（`prefers-reduced-motion: reduce` 時は `1.0秒以内`）に3手を再生し `STAGE CLEAR` と獲得スコアを表示してクリア記録を保存（`AC-3`, `AC-14`, `AC-17`）→ 次のステージ選択、またはモード2／思考力診断カルテへ進む。
   - **分岐2c（`RUN` 押下 → 失敗）**：途中エネルギー枯渇または暴走上限超過ならそのステップで中断して `CRASHED`、3手完走後の目標未達なら `FAILED`（`FINAL CHECK`）となり、デバッグログ3項目を表示（`AC-6`）→ `RESET` またはスロット差し替えでその場で再試行する。
3. **画面1（`/`）・画面2・上部ナビ → 画面3（`/fermi?stage=1..9`）**：
   - 初級（1〜3）・中級（4〜6）・上級（7〜9）のステージを選択し、`ACT 1`・`ACT 2`・`ACT 3` の各スロットで3〜4枚の仮説カードから1枚ずつ選択（`AC-7`。未選択スロットがある間は `FIRE` が `disabled`：`AC-13`）。
   - **分岐3a（`FIRE` 押下）**：`3.0秒以内`（動き軽減時 `1.0秒以内`）に増殖・フィルタ・レーザー演出を再生し、4段階オーダー判定（`PERFECT ORDER` / `GOOD RANGE` はクリア記録、`OVERKILL` / `UNDERESTIMATE` は未クリア）と解説3項目（数値比較・基準因数分解式と解説・罠カード名と理由）を同時表示（`AC-8`, `AC-9`, `AC-17`）→ `RESET` 押下で `0.2秒以内` に3スロットすべて未選択・初期状態に戻る（`AC-9`）。
4. **任意の画面 → 画面4（`/diagnostic`）**：
   - **分岐4a（認定ランク未解放：$C_1 = 0$ または $C_2 = 0`）**：総合認定ランク `UNRANKED`、未クリア側軸スコア `0`（クリア済み片側があれば算出値）、共有コピーボタン `disabled` を表示し、クリア数 `0` の各モード第1ステージ（`/combinator?stage=1` / `/fermi?stage=1`）への開始ボタンを提示する（`AC-12`）。
   - **分岐4b（認定ランク解放済み：$C_1 \ge 1 \land C_2 \ge 1$）**：5軸整数スコア（`0`〜`100`）と正五角形レーダーチャート、総合認定ランク（`S+`〜`C`）を表示し、共有コピーボタンを活性化する（`AC-10`）。
   - **分岐4c（共有コピー押下 → 成功 / 権限拒否）**：Clipboard 書き込み成功時はサマリーテキストを書き込み完了通知を `2.0秒以上`（標準 `3.0秒`）表示（`AC-11`）。`navigator.clipboard` 未定義または `writeText` 例外時は失敗通知1件と手動コピー用 `<textarea readonly>` を画面内に展開する（`AC-20`）。

---

## 2. 受け入れ条件と画面の対応

| AC | 画面 | 操作 |
|---|---|---|
| AC-1 | 画面1：モード選択（`/`）および全画面共通ヘッダー | トップ URL `/` を開く → アカウント登録画面を挟まず `1.0秒以内` に画面1の3モード導線（`lobby-mode-combinator`, `lobby-mode-fermi`, `lobby-mode-diagnostic`）および上部ナビゲーション（`nav-mode-combinator`, `nav-mode-fermi`, `nav-mode-diagnostic`）が操作可能になり、迷路ドットイート盤面や `Coming Soon`・未実装ボタンが `0件` であることを確認する |
| AC-2 | 画面2：モード1『3-ACT COMBINATOR』（`/combinator`） | ステージ選択ボタン（`combinator-stage-1`〜`combinator-stage-10`）を順に押す → 全10ステージすべてに切り替えられ、各ステージで5〜7個のユニークなモジュールカード（4属性：基本性能・エネルギーコスト・副作用・発動条件）とステージのターゲット達成条件（`combinator-target-condition`）・暴走上限値（`combinator-overheat-limit`）が表示される |
| AC-3 | 画面2：モード1『3-ACT COMBINATOR』（`/combinator`） | モジュールカードを3つ押して `STEP 1`〜`STEP 3` スロット（`combinator-slot-1`〜`3`）へ正解順列を配置し、`RUN（実行する）` ボタン（`combinator-run-button`）を押す → シミュレーション盤面（`combinator-simulation-canvas`）で `STEP 1`→`2`→`3` の動作とパラメータ推移が `3.0秒以内` に再生され、結果状態（`combinator-result-status`）が `STAGE CLEAR`、獲得スコア（`combinator-score-value`）が表示され、該当ステージボタンが `data-cleared="true"` になる |
| AC-4 | 画面2：モード1『3-ACT COMBINATOR』（`/combinator?stage=1..10`） | 全10ステージで提示モジュールから3つを並べる順列を実行する（自動テストでは `window.__ARCADE_TEST_API__.auditAllStages()` で全順列 `P(n,3)` を網羅検証し、画面上ではステージ1〜10の正解順列配置＋`RUN` 操作、とくにステージ8〜10で副作用変動または `if` 閾値条件を発火させる順列でのみ `STAGE CLEAR` に到達することを確認する） |
| AC-5 | 画面2：モード1『3-ACT COMBINATOR』（`/combinator`） | 3スロットすべてにモジュールを配置した未実行（`IDLE`）状態で `STEP（1手進める）` ボタン（`combinator-step-button`）を1回押し、続けて `RESET（戻す）` ボタン（`combinator-reset-button`）を押す → `STEP` で公式 `RUN` 試行回数を加算せずに `STEP 1` のみ更新されて一時停止し、`RESET` から `0.2秒以内` に3スロットの配置モジュールを維持したまま現在ステップ `0`・初期パラメータ・`IDLE` に戻る |
| AC-6 | 画面2：モード1『3-ACT COMBINATOR』（`/combinator`） | (a) 途中でエネルギー `< 0` または暴走上限超過になる3モジュール配置、および (b) 3手完走後にターゲット未達となる3モジュール配置のそれぞれで `RUN`（`combinator-run-button`）を押す → (a) は違反発生ステップで中断し `CRASHED`＋該当 `STEP 1`〜`3`、(b) は完走後に `FAILED`＋`FINAL CHECK` となり、デバッグログ領域（`combinator-debug-log`）に失敗発生箇所・原因種別・期待条件値と実測値の3項目すべてが表示される |
| AC-7 | 画面3：モード2『FERMI BLASTER』（`/fermi`） | 初級（1〜3）・中級（4〜6）・上級（7〜9）の全9ステージ選択ボタン（`fermi-stage-1`〜`fermi-stage-9`）を切り替え、`ACT 1`・`ACT 2`・`ACT 3` の各スロット（`fermi-slot-act-1`〜`3`）に提示された3〜4枚の仮説カードボタンから1枚ずつ計3枚を押して選択する（自由記述の数値入力欄は `0件`） |
| AC-8 | 画面3：モード2『FERMI BLASTER』（`/fermi`） | `ACT 1`〜`ACT 3` の3スロットすべてで仮説カードを選択し、`FIRE（発射する）` ボタン（`fermi-fire-button`）を押す → シミュレーション盤面（`fermi-simulation-canvas`）で増殖・フィルタ・レーザー発射が `3.0秒以内` に再生され、対数誤差 `d` と罠枚数に応じて `PERFECT ORDER` / `GOOD RANGE` / `OVERKILL` / `UNDERESTIMATE` のいずれか1つ（`fermi-result-status`）が表示され、上位2判定時に `data-cleared="true"` として記録される |
| AC-9 | 画面3：モード2『FERMI BLASTER』（`/fermi`） | `FIRE` 実行後に結果解説パネル（`fermi-explanation-panel`）の3項目（推定値と基準値の比較・基準因数分解式 `ACT 1 × ACT 2 × ACT 3` と解説文・罠カード名と理由）を確認し、続けて `RESET（戻す）` ボタン（`fermi-reset-button`）を押す → `0.2秒以内` に `ACT 1`〜`ACT 3` の全カード選択が解除され未実行 `IDLE` の初期状態に戻る |
| AC-10 | 画面4：『思考力診断カルテ』（`/diagnostic`） | 画面2と画面3で各1ステージ以上クリアした後に上部ナビ `nav-mode-diagnostic`（または画面1カード）から画面4を開く → 5軸整数スコア（`0`〜`100`）と正五角形レーダーチャート（`diagnostic-radar-chart`）、平均四捨五入値に対応する総合認定ランク（`S+` / `S` / `A` / `B` / `C`：`diagnostic-overall-rank`）が表示され、コピー共有ボタン（`diagnostic-copy-button`）が活性状態になる |
| AC-11 | 画面4：『思考力診断カルテ』（`/diagnostic`） | 認定ランク（`S+`〜`C`）表示状態かつ Clipboard 書き込み許可状態で、`診断結果をコピーする` ボタン（`diagnostic-copy-button`）を押す → 認定ランクと5軸すべての名称・整数スコアを含むサマリーテキストがクリップボードへ書き込まれ、完了通知（`diagnostic-copy-toast`）が `2.0秒以上`（標準 `3.0秒`）画面上に表示される |
| AC-12 | 画面4：『思考力診断カルテ』（`/diagnostic`） | プレイ履歴 `0件`、失敗履歴のみ、または片方のモードのみクリアした各状態で画面4を開く → 未捕捉例外 `0件` で総合認定ランク `UNRANKED`、コピー共有ボタン `disabled`、未クリア側モード軸スコア `0`（クリア済み片側があれば算出整数値）が表示され、クリア数 `0` の各モード第1ステージへ遷移する開始ボタン（`diagnostic-start-combinator-button` / `diagnostic-start-fermi-button`）が表示される |
| AC-13 | 画面2（`/combinator`）および画面3（`/fermi`） | 3つのスロットのうち1つ以上を未配置（初期状態、または配置済みスロットボタンを押して解除した状態）にする → 画面2では `RUN` と `STEP` の両方、画面3では `FIRE` が `disabled` 属性で非活性となり、未配置スロット識別子（`STEP 1`〜`3` または `ACT 1`〜`3`）を含む案内文（`combinator-slot-guidance` / `fermi-slot-guidance`）が1件表示され、再生・試行回数加算が `0回` に保たれる |
| AC-14 | 全4画面（`/`、`/combinator`、`/fermi`、`/diagnostic`） | 初期読み込み完了後にネットワークを `offline` に切り替えて画面2・画面3で各1ステージをクリアし画面4を確認後、再読み込みする → オフライン中も通信エラーや例外 `0件` でクリアとカルテ更新が完了し、再読み込み後もクリア済みステージ数と5軸スコア・ランクが一致して復元される |
| AC-15 | 全画面共通ヘッダーおよび画面2（`/combinator`）・画面3（`/fermi`） | 初回起動時（既定 `SOUND ON`、操作前自動発音 `0回`）に `RUN` または `FIRE` を押して Web Audio 合成発音を確認後、ヘッダーの常設ミュート切替ボタン（`header-sound-toggle`）を押して `SOUND OFF` に切り替え再度実行し、ページを再読み込みする → 外部音声通信 `0件`、`SOUND OFF` 時はマスター出力ゲイン `0` で無音となり、再読み込み後も `SOUND OFF` が維持される |
| AC-16 | 全4画面および共通ヘッダー直下通知バー | (a) `window.localStorage` 参照／読み書き例外状態、および (b) 破損 JSON 保存状態でアプリを起動し、画面2・画面3で各1ステージをクリアして画面4を開く → いずれも未捕捉例外 `0件` で両モード実行と認定ランク算出が完了し、(a) ではインメモリ保持へ退避して保存無効通知（`storage-fallback-banner`）が1件表示され、(b) では破損データを破棄して初期状態から再記録される |
| AC-17 | 画面2（`/combinator`）および画面3（`/fermi`） | OS・ブラウザの `prefers-reduced-motion: reduce` を有効にして画面2の `RUN` または画面3の `FIRE` を押す → 画面シェイク変位が `0px` に抑止され、押下から判定結果表示までの再生が `1.0秒以内` に完了する |
| AC-18 | 全4画面（`/`、`/combinator`、`/fermi`、`/diagnostic`） | 幅 `320px×100%`、`1280px×100%`、`1280px×200%`、`320px×200%` の4条件で全4画面を表示し操作する → 全条件で横はみ出し `0px`、すべてのボタン・スロット・カードが `24x24px` 以上、要素重なりによる押下不能 `0件` で操作できる |
| AC-19 | 画面3：モード2『FERMI BLASTER』（`/fermi?stage=1..9`） | 全9ステージで `ACT 1`〜`ACT 3` の仮説カード組み合わせを選択・実行する（自動テストでは `window.__ARCADE_TEST_API__.auditAllStages()` で全組み合わせを網羅検証し、画面上では全9ステージすべてで罠カード0枚の正解組による `PERFECT ORDER` 到達と罠カード選択時の解説表示を確認する） |
| AC-20 | 画面4：『思考力診断カルテ』（`/diagnostic`） | 認定ランク（`S+`〜`C`）表示状態かつ `navigator.clipboard` 未定義または `writeText` 例外状態で `診断結果をコピーする` ボタン（`diagnostic-copy-button`）を押す → 未捕捉例外 `0件` で自動コピー失敗通知（`diagnostic-copy-error`）1件と、認定ランクおよび5軸名称・整数スコアを含む手動コピー用 `<textarea readonly>`（`diagnostic-manual-copy-textarea`）が表示される |

---

## 3. 画面の仕事と主操作、標準部品

主操作は1画面に1つとし、`color.action.primary` の塗りつぶし強調はその主操作1つにのみ与える（B-2, B-5）。共通シェル（`<header>`, `<nav>`）は全4画面で共有し、ロゴリンク `<a>`、ナビゲーションリンク `<a>`（`aria-current="page"`）、ミュート切替 `<button type="button" aria-pressed>`、言語切替 `<button type="button" aria-pressed>` のすべてを HTML 標準要素で構成する。

| 画面 | 仕事（1文） | 主操作 | 使う標準部品 | 標準から外れる所（本来の部品、理由、対応） |
|---|---|---|---|---|
| **画面1：モード選択**（`/`） | 2つの思考ゲームモードと診断カルテの役割・クリア進捗を一目で把握し、登録0秒で次の推奨ステージへ入る。 | 進捗に応じた推奨ステップ開始ボタン1つ（`lobby-primary-start-button`：未プレイ時はモード1 STAGE 1 開始、片方クリア時は未クリア側 STAGE 1 開始、両方クリア時は診断カルテ表示） | HTML 標準要素：`<header>`, `<nav>`, `<main>`, `<section>`, `<h1>`, `<h2>`, `<a>`, `<button>`, `<dl>`, `<footer>` | なし（すべて標準 HTML 要素で構成する。カード内の装飾ベクターアイコンは `aria-hidden="true"` とし意味情報を持たせない） |
| **画面2：モード1『3-ACT COMBINATOR』**（`/combinator`） | ステージの目標条件と暴走上限を読み取り、5〜7個のモジュールから3手（`STEP 1`〜`STEP 3`）の順序を組んでシミュレーションを実行し、成否と破綻箇所を確かめる。 | `RUN（実行する）` ボタン1つ（`combinator-run-button`。※`STEP` と `RESET` は枠線セカンダリボタンとし視覚階層を下げる） | HTML 標準要素：`<main>`, `<section>`, `<h1>`〜`<h3>`, `<button>`（ステージ選択・3スロット・モジュールカード・実行／検証／リセットすべてドラッグ不要のボタン操作）, `<dl>`, `<output>` / `role="status"`（結果状態・デバッグログ）。ステージ選択群は WAI-ARIA APG Button / Toolbar 相当のキーボード操作に対応 | **シミュレーション描画盤面（`<canvas>`：`combinator-simulation-canvas`）**<br>・**本来の標準部品**：`<meter>` / `<progress>` および `<dl>` による静的な数値表<br>・**外れる理由**：`AC-3`・`AC-5` および「差をつける点1」である3段回路上の信号パルス移動・リアルタイム波形ゲージ・`+SCORE` ポップアップ・画面シェイク（通常時）のレトロベクター演出を `3.0秒以内` に連続描画するには静的要素だけでは満たせないため<br>・**アクセシビリティの対応**：(1) Canvas 内に押下要素を一切置かず全操作を外部の標準 `<button>` に分離、(2) `<canvas role="img" aria-label="...">` に現在状態の動的説明を付与、(3) 実行状態・現在ステップ・全パラメータ値・獲得スコア・デバッグログ3項目を直下の標準 DOM（`<dl>` / `role="status"`）に完全ミラー出力、(4) `prefers-reduced-motion: reduce` 時はシェイク `0px`・`1.0秒以内` 短縮描画に切替（`AC-17`） |
| **画面3：モード2『FERMI BLASTER』**（`/fermi`） | 未知の規模を問うお題に対し、3段階の分解スロット（`ACT 1 × ACT 2 × ACT 3`）へ仮説カードを1枚ずつ選んで推定レーザーを発射し、桁の一致度と罠カードの理由を確かめる。 | `FIRE（発射する）` ボタン1つ（`fermi-fire-button`。※`RESET` は枠線セカンダリボタンとする） | HTML 標準要素：`<main>`, `<section>`, `<h1>`〜`<h3>`, `<fieldset>` + `<legend>`（`ACT 1`〜`ACT 3` の3スロットグループ）, `<button type="button" aria-pressed>`（各スロット3〜4枚の仮説カードおよびステージ選択・実行・リセット）, `<dl>`, `role="status"`（判定結果・解説3項目） | **推定シミュレーション描画盤面（`<canvas>`：`fermi-simulation-canvas`）**<br>・**本来の標準部品**：`<meter>`、`<output>`、`<dl>` による数値比較表示<br>・**外れる理由**：`AC-8` および「差をつける点1」である母集団クラスター増殖 → フィルタ収束 → 対数オーダー帯へのレーザー着弾演出を `3.0秒以内` に視覚化するため<br>・**アクセシビリティの対応**：(1) Canvas 内に操作要素を置かず全カード選択・発射を外部 `<button>` で完結、(2) `<canvas role="img" aria-label="...">` を付与、(3) 4段階オーダー判定・推定値と基準値の比較・基準因数分解式と解説・罠カード名と理由を直下の標準 DOM に完全ミラー表示、(4) `prefers-reduced-motion: reduce` 時はシェイク `0px`・`1.0秒以内` 短縮描画に切替（`AC-17`） |
| **画面4：『思考力診断カルテ』**（`/diagnostic`） | 両モードの履歴から算出された5軸の思考特性スコアと総合認定ランク（`S+`〜`C`）をレーダーチャートで確認し、診断サマリーテキストをコピーして共有する。 | **ランク解放時**：`診断結果をコピーする` ボタン1つ（`diagnostic-copy-button`）<br>**未解放（`UNRANKED`）時**：コピーボタンは `disabled` となり、未クリア側モードの第1ステージ開始ボタン（両方未クリア時は `diagnostic-start-combinator-button` を唯一のプライマリ塗り、`diagnostic-start-fermi-button` を枠線セカンダリ）を主操作とする | HTML 標準要素：`<main>`, `<section>`, `<h1>`, `<h2>`, `<dl>`（5軸整数スコア一覧・クリア進捗）, `<button>`, `<label>` + `<textarea readonly>`（`AC-20` 手動コピー領域）, `role="status"` / `role="alert"`（コピー成功トースト・失敗通知：WAI-ARIA APG Alert Pattern 準拠） | **正五角形レーダーチャート（インライン `<svg>`：`diagnostic-radar-chart`）**<br>・**本来の標準部品**：`<dl>` または `<table>` / `<meter>` による5軸数値リスト<br>・**外れる理由**：`AC-10` および「差をつける点2」である5軸バランスの正五角形レーダーチャート描画は標準 HTML 要素だけでは極座標多角形を表現できないため<br>・**アクセシビリティの対応**：(1) `<svg role="img" aria-labelledby="radar-title radar-desc">` 内に `<title>` と5軸点数を読み上げる `<desc>` を同梱、(2) 隣接する標準 DOM の `<dl>` に5軸すべての名称と整数スコア（`0`〜`100`）を常時テキスト併記、(3) グリッド線・多角形ストローク（`2.5px` 実線＋頂点ドット）に背景比 `4.55:1` 以上のトークン色を適用し `forced-colors: active` でもシステム色で輪郭を保持 |

---

## 4. 決定と根拠

すべての決定は `design/001-arcade-core-research.md` の発見番号（`R-1`〜`R-34`）と、WCAG 2.2 / WAI-ARIA APG の URL またはバウハウス原則（`B-1`〜`B-6`）を根拠に持つ。

| 決定 | 根拠（R-n） | 原則（HIG、WCAG、APG の URL か B-n） |
|---|---|---|
| アカウント登録・ログイン画面・課金壁を設けず、トップ `/` 表示から `1.0秒以内` に3導線を操作可能にし、全19ステージと全解説を無料で即時公開する | R-2, R-5, R-12, R-15 | B-1, B-2 |
| 左上にホームリンク `LOGIC ARCADE`、上部に3主要ビュー切替、右上に常設ミュート切替と `JA / EN` 切替を置く一貫したヘッダーナビゲーションを採用する | R-1, R-29, R-30, R-31 | https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ |
| 各画面に固有の URL（`/`, `/combinator`, `/fermi`, `/diagnostic`）と「画面名 \| LOGIC ARCADE」形式の日英ページ `<title>` を付与する | R-30, R-34 | https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html |
| パックマン等の十字キー迷路ドットイート盤面を一切作らず、モード1は「3段モジュール回路パルス＆波形計器」、モード2は「クラスター増殖→フィルタ→対数レーザー計器」として視覚シミュレーション化する | R-3, R-5, R-8, R-9 | B-1, B-6 |
| コード記述や自由数値入力欄を排し、モード1は「5〜7モジュールから3スロット順列選択」、モード2は「各スロット3〜4枚の仮説カードから1枚ずつ選択」に絞る | R-4, R-7, R-9, R-10, R-13 | B-1, B-2 |
| ドラッグ＆ドロップ専用操作を禁止し、モジュール配置・解除・仮説カード選択のすべてを1クリック／Enter キーで完結する標準 `<button>` で実装する | R-10, R-23, R-29 | https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html 、 https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html |
| 1画面のプライマリ塗りボタン（`color.action.primary`）を厳密に1つに絞り、補助操作（`STEP`, `RESET`, 他モードカード）は枠線セカンダリにして階層を分離する | R-15, R-17 | B-2, B-5 |
| スロットが1つでも未配置の間は `RUN` / `STEP` / `FIRE` を `disabled` にし、ボタン直上に未配置スロット名（`STEP 1`〜`3` / `ACT 1`〜`3`）を明示する案内文を常時1件表示する | R-10, R-13 | B-1, https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html |
| 通常時のシミュレーション再生を `3.0秒以内`、`RESET` を `0.2秒以内` とし、過剰な RPG 風装飾やスキップ不能な長尺演出を排除する | R-6, R-15 | B-1, B-2 |
| モード1失敗時は叱る表現を使わず、`CRASHED`（途中制約違反ステップ）と `FAILED`（完走後 `FINAL CHECK`）を明確に分け、発生箇所・原因種別・期待値と実測値のデバッグログ3項目を即時表示する | R-3, R-11, R-34 | B-1, https://www.w3.org/WAI/ARIA/apg/patterns/alert/ |
| モード2実行後は対数誤差オーダー4段階判定（`PERFECT ORDER` / `GOOD RANGE` / `OVERKILL` / `UNDERESTIMATE`）とともに、数値比較・基準因数分解式と解説・罠カード名と理由を毎回無料で開示する | R-12, R-13, R-14 | B-1 |
| 『思考力診断カルテ』で両モードの履歴を5軸整数スコア＋正五角形レーダーチャート＋総合認定ランク（`S+`〜`C`）に統合し、未解放（`UNRANKED`）時は未クリア側モードの第1ステージ開始ボタンを提示する | R-14, R-33 | B-1 |
| 診断結果の共有は外部画像生成サーバーを使わず、Wordle 型の整形テキストサマリーの1タップ Clipboard コピーとし、権限拒否・例外時は失敗通知と手動コピー用 `<textarea readonly>` をその場に展開する | R-16 | B-2, https://www.w3.org/WAI/ARIA/apg/patterns/alert/ |
| 配色は多色過多や全面純黒 CRT 固定を避け、OS の `prefers-color-scheme` に追従するライト／ダークと高コントラスト・`forced-colors` のセマンティック色トークンで構成する | R-1, R-17, R-24, R-25 | B-5, https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html 、 https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html |
| 赤緑の色相だけで成否・罠・ランクを伝えず、すべての状態に文字ラベル・アイコン記号（`✓` / `◆` / `▲` / `✕`）・枠線種別を併記する | R-16, R-20, R-29 | B-5, https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html |
| 書体は可読性の高いシステムサンセリフ1書体に統一（極小ドット書体・細字 Light 以下は不使用）し、数値・ステップ番号には同一書体の `tabular-nums`（等幅数字）を適用、文字階層は4段階（`rem` 基準）に絞る | R-10, R-22, R-29 | B-4, https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html |
| 余白は `4, 8, 12, 16, 24, 32px` トークンのみを使い、幅 `320px` および文字拡大 `200%` では2ペイン・横3スロット・ステージ選択列をすべて折り返し／1カラム縦積みへリフローさせ横はみ出し `0px`・最小押下領域 `24x24px` 以上を保証する | R-10, R-21, R-22, R-23 | B-3, https://www.w3.org/WAI/WCAG22/Understanding/reflow.html 、 https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html |
| キーボードのみで全操作を完走可能にし、すべてのフォーカス可能要素に厚さ `2px`・オフセット `2px`・背景コントラスト比 `7.24:1` 以上のフォーカスリングを表示する | R-31, R-32 | https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html |
| `prefers-reduced-motion: reduce` 有効時は画面シェイク変位を `0px` に完全抑止し再生を `1.0秒以内` に短縮、また全モードで秒間3回を超える点滅を作らない | R-6, R-26, R-27 | https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html |
| 初期表示時の自動音声再生を `0回` とし、外部音声ファイルを使わずユーザー操作時のみ Web Audio API で合成発音し、常設 `SOUND ON / OFF` 状態を `localStorage`（例外時はメモリ＋画面内通知1件）に保持する | R-15, R-28, R-29 | B-6, https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html |

---

## 5. 画面ごとの状態

| 画面 | 通常 | 空 | 読み込み中 | エラー | オフライン | 権限を断られたとき | 一部だけ読めたとき |
|---|---|---|---|---|---|---|---|
| **画面1：モード選択**（`/`） | ヒーロー推奨主操作ボタン1つと、3つのモード導線カード（クリア数 `C_1/10`, `C_2/9`, 現在ランクバッジ）を表示する（`AC-1`）。 | **初期未プレイ状態（履歴0件）**：進捗を `0 / 10 CLEAR`・`0 / 9 CLEAR`・`UNRANKED` と表示し、「まだクリア記録がありません。まずは STAGE 1 から試せます」の案内と次の一手ボタン `STAGE 1 から試す（3-ACT COMBINATOR）` を提示する。モードカード自体は常時3件内蔵のため空にならない。 | 全データが初期バンドル内蔵のため外部 API 待ちはない。初期 JS マウント前の `< 1.0秒` 間はレイアウト枠（高さ固定シェル）を先に出して `CLS <= 0.1` を保ち、履歴読込完了前に誤った数値ちらつきを出さない。 | 予期せぬ描画例外時はエラーバウンダリ区画を表示し、何が起きたか（「画面の表示中に問題が発生しました」）と次の一手のボタン（`ページを再読み込みする`）を出す。 | **通常と同一動作**（`AC-14`）：全アセット・文言・ロジックを初期バンドルに内蔵しているため、`offline` でも例外 `0件` で全導線への遷移と進捗表示がそのまま動く。 | ・ログイン未済：**なし**（認証不要のため）<br>・`localStorage` 拒否・例外時（`AC-16 (a)`）：インメモリ状態へ退避し、ヘッダー直下に保存無効通知バナー1件（`storage-fallback-banner`）を表示したうえで通常どおり遷移・記録できる。 | ・破損 JSON 検出時（`AC-16 (b)`）：例外を出さず破損データを破棄して初期状態（`0/10`, `0/9`）へ安全リセットする。<br>・片モードのみクリア時：クリア済み側の進捗を反映し、推奨主ボタンを未クリア側モードの STAGE 1 開始へ切り替える。 |
| **画面2：モード1『3-ACT COMBINATOR』**（`/combinator`） | ステージ1〜10選択、目標条件・暴走上限・現在パラメータ、回路 Canvas、3スロット、5〜7モジュール（4属性）、操作ボタンを表示。3スロット充足時は `RUN`・`STEP` が活性になり、実行後に `STAGE CLEAR` とスコアを表示する（`AC-2`, `AC-3`, `AC-5`）。 | **スロット未配置の初期状態**：ステージ定義自体は全10件内蔵のため0件にならない。3スロットが空の間は `STEP 1`〜`3` に「未配置（下のモジュールを押して配置）」と表示し、次の一手としてモジュールカード選択を案内する（`AC-13`）。 | ・初期表示：内蔵データから同期描画（`< 1.0秒`）。<br>・**シミュレーション実行中（`RUNNING`）**：`3.0秒以内`（動き軽減時 `1.0秒以内`）で `STEP 1`→`3` のパルスとゲージ推移を再生し、状態バッジを `RUNNING` にして二重実行を防ぐ。 | ・**入力不足（`AC-13`）**：`RUN`・`STEP` を `disabled` にし、「未配置のスロットがあります：STEP 1, ...」を出しデッキからの選択を促す。<br>・**実行失敗（`AC-6`）**：`CRASHED` または `FAILED` とデバッグログ3項目で原因を明示し、次の一手のボタン `RESET（戻す）`（またはスロット押下での差し替え）で即再試行できる。<br>・不正な `?stage=` 指定時：ステージ1を表示し案内を出す。 | **通常と同一動作**（`AC-14`）：外部サーバー・外部音声通信 `0件` のため、`offline` でもステージ切替・`RUN` / `STEP` / `RESET`・Web Audio 合成音・クリア保存が完全に動作する。 | ・ログイン未済：**なし**（認証不要）<br>・`localStorage` 拒否時（`AC-16 (a)`）：ヘッダー直下に保存無効通知1件を表示し、インメモリ保持で全10ステージのプレイとクリア判定を継続する。<br>・Web Audio 制限時：例外 `0件` で無音のまま視覚シミュレーションを完走する。 | 破損 JSON 検出時（`AC-16 (b)`）は破損データを破棄して未クリア初期状態から安全に起動し、その後のクリア履歴を正常に再記録する。 |
| **画面3：モード2『FERMI BLASTER』**（`/fermi`） | 全9ステージ（初級3・中級3・上級3）選択、お題文、推定レーザー Canvas、`ACT 1`〜`ACT 3` の仮説カード群（各3〜4枚）、`FIRE` / `RESET` を表示。実行後に4段階判定と解説3項目を表示する（`AC-7`, `AC-8`, `AC-9`）。 | **スロット未選択の初期状態**：全9ステージ内蔵のためステージ0件にはならない。`ACT 1`〜`3` 未選択時は式プレビューを `? × ? × ?` とし、各スロットで仮説カードを1枚ずつ選ぶ案内を出す（`AC-13`）。 | ・初期表示：内蔵データから同期描画（`< 1.0秒`）。<br>・**レーザー発射再生中（`RUNNING`）**：`3.0秒以内`（動き軽減時 `1.0秒以内`）でクラスター増殖→フィルタ→レーザー着弾アニメーションを再生する。 | ・**入力不足（`AC-13`）**：`FIRE` を `disabled` にし、「未選択のスロットがあります：ACT 1, ...」を表示する。<br>・**オーダー外れ（`AC-8`, `AC-9`）**：`OVERKILL` または `UNDERESTIMATE` と解説3項目（基準式・罠理由）で何がズレたかを示し、次の一手のボタン `RESET（戻す）`（または別カードの直接押下）で再試行できる。<br>・不正な `?stage=` 指定時：ステージ1へ安全フォールバック。 | **通常と同一動作**（`AC-14`）：`offline` でも全9ステージの選択・`FIRE` 判定・因数分解／罠解説表示・クリア保存が例外 `0件` で完結する。 | ・ログイン未済：**なし**（認証不要）<br>・`localStorage` 拒否時（`AC-16 (a)`）：保存無効通知1件を表示し、インメモリ保持で全9ステージの実行・クリア記録を継続する。<br>・Web Audio 制限時：例外 `0件` で視覚再生のみで完走する。 | 破損 JSON 検出時（`AC-16 (b)`）は破損データを破棄して初期状態へ安全フォールバックし、以降のクリア記録を再保存可能にする。 |
| **画面4：『思考力診断カルテ』**（`/diagnostic`） | 両モード各1ステージ以上クリア済み（$C_1 \ge 1 \land C_2 \ge 1$）のとき、5軸整数スコア（`0`〜`100`）、正五角形レーダーチャート、総合認定ランク（`S+`〜`C`）、活性な `診断結果をコピーする` ボタンを表示する（`AC-10`, `AC-11`）。 | **認定ランク未解放（履歴0件・失敗のみ：`AC-12`）**：ランクを `UNRANKED`、5軸すべて `0`、コピーボタンを `disabled` にし、何が起きたか（「認定ランクを算出するには、2つのモードをそれぞれ1ステージ以上クリアする必要があります」）と、次の一手のボタン2つ（`3-ACT COMBINATOR STAGE 1 を始める`［主操作］、`FERMI BLASTER STAGE 1 を始める`）を表示する。 | `localStorage`（またはメモリ）から同期算出するため通信待ちはない。初期マウント前の `< 1.0秒` 間はチャート枠とスコア枠のスケルトン形を保持し、算出完了前に誤ったランクを出さない。 | ・**自動コピー失敗時（`AC-20`）**：何が起きたか・どう直すか（「クリップボードへの自動コピーが制限されています。下のテキスト欄を選択してコピーしてください」）の通知1件と、次の一手のボタン `テキストを全選択する` および手動コピー用 `<textarea readonly>` を出す。<br>・予期せぬ描画例外時：原因案内と `ページを再読み込みする` ボタンを出す。 | **通常と同一動作**（`AC-14`）：サーバー通信なしで5軸算出・SVG チャート描画・Clipboard コピー（または手動コピー欄展開）がすべて `offline` で動作する。 | ・ログイン未済：**なし**（認証不要）<br>・**Clipboard 書き込み拒否・未定義時（`AC-20`）**：未捕捉例外 `0件` で失敗通知1件（`diagnostic-copy-error`）と手動コピー用 `<textarea readonly>`（`diagnostic-manual-copy-textarea`）を画面内に表示する。<br>・`localStorage` 拒否時（`AC-16 (a)`）：インメモリ履歴から5軸と認定ランクを正常算出し、保存無効通知1件を表示する。 | ・**片モードのみクリアの準空状態（`AC-12`）**：ランクは `UNRANKED`・コピーボタンは `disabled` としつつ、クリア済み側の軸スコアのみ算出整数値を表示し、未クリア側軸スコアを `0`、未クリア側モードの第1ステージ開始ボタン1つだけを主操作として表示する。<br>・破損 JSON 時（`AC-16 (b)`）：破損データを破棄し履歴0件の `UNRANKED` 状態で安全に描画する。 |

### 境界表示・取り消せない操作の扱い

- **長い文字（英語表示・疑似言語 Double-Length・文字拡大 `200%` 時）**：条件値・副作用・罠カードの解説文で `text-overflow: ellipsis`（省略切り捨て）を使うとゲームが解けなくなるため、全テキスト要素で1行切り捨てを禁止し、`overflow-wrap: anywhere` と複数行折り返しによって全文を読めるようにする。
- **0件のときの表示**：ステージ一覧・モジュール・仮説カードは静的バンドル内蔵のため0件にならない。プレイ履歴0件時は画面1で `0 / 10 CLEAR`・`0 / 9 CLEAR`、画面4で `UNRANKED`＋全5軸 `0`＋各モード STAGE 1 開始ボタンを表示する（`AC-12`）。初期同期読込のため、読み込み途中に誤って「0件」と一瞬出す挙動は発生させない。
- **件数がとても多いときの表示**：ステージ数はモード1が全10件、モード2が全9件の固定上限である。累積試行回数（`RUN` / `FIRE`）が `999`〜`99,999` 回以上に増えた場合も `tabular-nums` と折り返し許容コンテナで枠外はみ出しを防ぎ、モード2の巨大な推定値・基準値（`10^12`〜`10^16` 等）は指数表記と単位表記（例：`4.8 × 10^8（約4.8億）` / `4.8 × 10^8 (480M)`）を併記して `320px` 幅でも1行内に折り返し収容する。
- **取り消せない操作の確認**：本機能にはアカウント削除・課金・全クリア履歴の完全消去といった取り消せない破壊的操作は存在しない。画面2の `RESET`（スロット配置を維持してステップ位置 `0` へ戻す：`AC-5`）および画面3の `RESET`（現在ステージの3スロット選択のみ未選択に戻し、保存済みクリア記録は消さない：`AC-9`）はいずれも可逆な盤面初期化であり、かつ `0.2秒以内` に即時復帰する受け入れ条件があるため、確認ダイアログ（`<dialog>`）は挟まず即時実行する。

---

## 6. 要素と識別子

受け入れテスト（Playwright）および支援技術が要素を一意に特定できるよう、`data-testid` と HTML 役割・属性・日英の読み上げラベルを下表に固定する。

| 画面 | 要素 | accessibilityIdentifier（Web は data-testid） | 読み上げのラベル |
|---|---|---|---|
| **共通シェル** | メインコンテンツへのスキップリンク（`<a href="#main-content">`） | `skip-to-main-link` | `ja`：`メインコンテンツへ移動する`<br>`en`：`Skip to main content` |
| **共通シェル** | アプリロゴ・ホーム遷移リンク（`<a href="/">`） | `header-home-link` | `ja`：`LOGIC ARCADE モード選択へ戻る`<br>`en`：`Return to LOGIC ARCADE Mode Select` |
| **共通シェル** | 上部ナビ：モード1切替リンク（`<a href="/combinator">`、現在地は `aria-current="page"`） | `nav-mode-combinator` | `ja`：`3-ACT COMBINATOR を開く`<br>`en`：`Open 3-ACT COMBINATOR` |
| **共通シェル** | 上部ナビ：モード2切替リンク（`<a href="/fermi">`、現在地は `aria-current="page"`） | `nav-mode-fermi` | `ja`：`FERMI BLASTER を開く`<br>`en`：`Open FERMI BLASTER` |
| **共通シェル** | 上部ナビ：思考力診断カルテ切替リンク（`<a href="/diagnostic">`、現在地は `aria-current="page"`） | `nav-mode-diagnostic` | `ja`：`思考力診断カルテを開く`<br>`en`：`Open Diagnostic Chart` |
| **共通シェル** | 常設ミュート切替トグルボタン（`<button type="button">`、ON 時 `aria-pressed="true"` かつ `data-sound-state="on"`、OFF 時 `aria-pressed="false"` かつ `data-sound-state="off"`：`AC-15`） | `header-sound-toggle` | `ja`：`効果音（ON のとき押してミュート、OFF のとき押してオンにする）`<br>`en`：`Sound effects (pressed when on)` |
| **共通シェル** | 日本語切替ボタン（`<button type="button" aria-pressed="true\|false">`） | `header-lang-ja` | `ja`：`表示言語を日本語に切り替える`<br>`en`：`Switch display language to Japanese` |
| **共通シェル** | 英語切替ボタン（`<button type="button" aria-pressed="true\|false">`） | `header-lang-en` | `ja`：`表示言語を英語に切り替える`<br>`en`：`Switch display language to English` |
| **共通シェル** | ブラウザ保存無効時の退避通知バナー（`role="status"`、`AC-16 (a)` 発生時のみ表示） | `storage-fallback-banner` | `ja`：`ブラウザの保存機能が無効なため、このタブを閉じるまで記録を保持します`<br>`en`：`Browser storage is unavailable; progress is kept in memory until this tab closes` |
| **共通シェル** | 予期せぬ例外バウンダリの再読み込みボタン（エラー時のみ表示） | `error-reload-button` | `ja`：`ページを再読み込みする`<br>`en`：`Reload page` |
| **画面1：モード選択** | 画面1ルート区画（`<main id="main-content">` 内） | `screen-lobby` | 見出し `h1` により `LOGIC ARCADE` |
| **画面1：モード選択** | 進捗連動の推奨ステップ開始ボタン（画面1唯一の主操作） | `lobby-primary-start-button` | 進捗に応じ `ja`：`3-ACT COMBINATOR の STAGE 1 を始める` / `FERMI BLASTER の STAGE 1 を始める` / `思考力診断カルテで認定ランクを見る`（`en` 対応ラベル） |
| **画面1：モード選択** | モード1『3-ACT COMBINATOR』遷移ボタン／リンク（`AC-1`） | `lobby-mode-combinator` | `ja`：`3-ACT COMBINATOR を開く`<br>`en`：`Open 3-ACT COMBINATOR` |
| **画面1：モード選択** | モード2『FERMI BLASTER』遷移ボタン／リンク（`AC-1`） | `lobby-mode-fermi` | `ja`：`FERMI BLASTER を開く`<br>`en`：`Open FERMI BLASTER` |
| **画面1：モード選択** | 『思考力診断カルテ』遷移ボタン／リンク（`AC-1`） | `lobby-mode-diagnostic` | `ja`：`思考力診断カルテを開く`<br>`en`：`Open Diagnostic Chart` |
| **画面1：モード選択** | クリア進捗・現在ランク表示（3要素） | `lobby-progress-combinator`, `lobby-progress-fermi`, `lobby-rank-badge` | 各モードのクリア済みステージ数と現在の総合認定ランク |
| **画面2：モード1** | 画面2ルート区画 | `screen-combinator` | 見出し `h1` により `3-ACT COMBINATOR` |
| **画面2：モード1** | ステージ1〜10選択ボタン（`<button type="button">`、`data-stage-id="1..10"`、`data-cleared="true\|false"`、選択中は `aria-pressed="true"`：`AC-2`, `AC-3`） | `combinator-stage-1` 〜 `combinator-stage-10` | 未クリア時 `ja`：`ステージ {n} を選択する` / クリア済時 `ステージ {n}（クリア済み）を選択する`（`en`：`Select Stage {n}` / `Select Stage {n} (Cleared)`） |
| **画面2：モード1** | ステージのターゲット達成条件表示（`AC-2`） | `combinator-target-condition` | `ja`：`ターゲット達成条件：{condition}`<br>`en`：`Target condition: {condition}` |
| **画面2：モード1** | ステージの暴走上限値表示（`AC-2`） | `combinator-overheat-limit` | `ja`：`暴走上限値：{limit}`<br>`en`：`Overload limit: {limit}` |
| **画面2：モード1** | 現在パラメータテレメトリ領域（エネルギー・出力・副作用現在値） | `combinator-telemetry-bar`（子要素：`combinator-param-energy`, `combinator-param-output`, `combinator-param-side-effect`） | 各パラメータの現在値と初期値／上限値 |
| **画面2：モード1** | 3段回路シミュレーション描画 Canvas（`<canvas role="img">`：`AC-3`, `AC-5`） | `combinator-simulation-canvas` | `ja`：`3ステップ回路シミュレーション盤面（現在の状態：{status}、ステップ：{step}/3）`<br>`en`：`3-step circuit simulation board (status: {status}, step: {step}/3)` |
| **画面2：モード1** | 実行結果状態バッジ（`IDLE` / `RUNNING` / `STEPPING` / `STAGE CLEAR` / `CRASHED` / `FAILED`、`role="status"`、`data-status` 併記：`AC-3`, `AC-5`, `AC-6`） | `combinator-result-status` | 状態文字列と意味ラベル（例：`STAGE CLEAR：ステージクリア` / `CRASHED：途中制約違反で停止` / `FAILED：最終条件未達`） |
| **画面2：モード1** | 獲得スコア表示（`AC-3`） | `combinator-score-value` | `ja`：`獲得スコア：{score} 点`<br>`en`：`Earned score: {score} pts` |
| **画面2：モード1** | 3ステップ配置スロットボタン（`STEP 1`〜`STEP 3`、`data-assigned-module="<id\|empty>"`：`AC-3`, `AC-5`, `AC-13`） | `combinator-slot-1`, `combinator-slot-2`, `combinator-slot-3` | 空時 `ja`：`STEP {k} スロット（未配置、押して配置先に選ぶ）` / 配置済時 `STEP {k} スロット：{moduleName}（押して解除する）`（`en` 対応ラベル） |
| **画面2：モード1** | 未配置スロット識別子入り案内文（`AC-13`：未配置1つ以上のとき表示） | `combinator-slot-guidance` | `ja`：`未配置のスロットがあります：{slots} にモジュールを配置してください`<br>`en`：`Unassigned slots remaining: assign modules to {slots}` |
| **画面2：モード1** | `RUN` 連続実行ボタン（画面2唯一の主操作、未充足時は `disabled`：`AC-3`, `AC-13`） | `combinator-run-button` | `ja`：`RUN：3ステップのシミュレーションを実行する`<br>`en`：`RUN: Run 3-step simulation` |
| **画面2：モード1** | `STEP` 1手検証ボタン（未充足時は `disabled`：`AC-5`, `AC-13`） | `combinator-step-button` | `ja`：`STEP：試行回数を増やさずに1手だけ進める`<br>`en`：`STEP: Advance 1 step without counting an official attempt` |
| **画面2：モード1** | `RESET` スロット維持初期化ボタン（`AC-5`） | `combinator-reset-button` | `ja`：`RESET：スロット配置を残して初期状態に戻す`<br>`en`：`RESET: Restore initial parameters while keeping slot modules` |
| **画面2：モード1** | 提示モジュールカード（各ステージ5〜7個、`k = 1..7`、`data-module-id` 付与：`AC-2`） | `combinator-module-card-1` 〜 `combinator-module-card-7` | `ja`：`モジュール {name} をスロットに配置する（配置済みの場合は解除する）`＋4属性テキスト（`en` 対応ラベル） |
| **画面2：モード1** | 各モジュールカード内の4属性要素（基本性能・コスト・副作用・発動条件：`AC-2`） | `combinator-module-effect-{k}`, `combinator-module-cost-{k}`, `combinator-module-side-effect-{k}`, `combinator-module-condition-{k}` | 各属性の名称と値 |
| **画面2：モード1** | 失敗時デバッグログ領域と必須3項目（`role="region"`、`AC-6`） | コンテナ：`combinator-debug-log`<br>1. 失敗発生箇所：`combinator-debug-location`<br>2. 原因種別：`combinator-debug-reason`<br>3. 期待条件値と実測値：`combinator-debug-values` | `STEP 1`〜`3` または `FINAL CHECK`、原因種別名、および期待条件値と実測値の比較文 |
| **画面2：モード1** | クリア後の次ステージ移動セカンダリボタン（クリア時のみ表示） | `combinator-next-stage-button` | `ja`：`次のステージを開く`（ステージ10クリア時は `FERMI BLASTER を開く`）<br>`en`：`Open next stage` / `Open FERMI BLASTER` |
| **画面3：モード2** | 画面3ルート区画 | `screen-fermi` | 見出し `h1` により `FERMI BLASTER` |
| **画面3：モード2** | 全9ステージ選択ボタン（初級 `1..3`・中級 `4..6`・上級 `7..9`、`data-tier="beginner\|intermediate\|advanced"`、`data-cleared="true\|false"`：`AC-7`, `AC-8`） | `fermi-stage-1` 〜 `fermi-stage-9` | `ja`：`{tier} ステージ {n} を選択する`（クリア済時は `（クリア済み）` 付与、`en` 対応ラベル） |
| **画面3：モード2** | フェルミ推定お題見出しと推定式プレビュー | `fermi-question-heading`, `fermi-formula-preview` | お題文および現在の `ACT 1 × ACT 2 × ACT 3` 選択式 |
| **画面3：モード2** | 推定レーザーシミュレーション描画 Canvas（`<canvas role="img">`：`AC-8`） | `fermi-simulation-canvas` | `ja`：`フェルミ推定シミュレーション盤面（現在の判定：{status}）`<br>`en`：`Fermi estimation simulation board (judgment: {status})` |
| **画面3：モード2** | 4段階オーダー判定バッジ（`IDLE` / `RUNNING` / `PERFECT ORDER` / `GOOD RANGE` / `OVERKILL` / `UNDERESTIMATE`、`role="status"`：`AC-8`） | `fermi-result-status` | 判定コードと日本語／英語の意味説明 |
| **画面3：モード2** | 3ステップ分解スロットグループ（`<fieldset>`：`ACT 1`, `ACT 2`, `ACT 3`：`AC-7`） | `fermi-slot-act-1`, `fermi-slot-act-2`, `fermi-slot-act-3` | `<legend>` により各スロット名と分解役割を読み上げ |
| **画面3：モード2** | 各スロットの仮説カード選択肢ボタン（各スロット3〜4枚、`s = 1..3`, `c = 1..4`、`aria-pressed="true\|false"`：`AC-7`, `AC-19`） | `fermi-card-act{s}-{c}`（例：`fermi-card-act1-1` 〜 `fermi-card-act3-4`） | `ja`：`ACT {s} に仮説カード「{label}（{value}）」を選択する`<br>`en`：`Select hypothesis card "{label} ({value})" for ACT {s}` |
| **画面3：モード2** | 未選択スロット識別子入り案内文（`AC-13`：未選択1つ以上のとき表示） | `fermi-slot-guidance` | `ja`：`未選択のスロットがあります：{slots} の仮説カードを選択してください`<br>`en`：`Unselected slots remaining: choose a hypothesis card for {slots}` |
| **画面3：モード2** | `FIRE` 発射・実行ボタン（画面3唯一の主操作、未充足時は `disabled`：`AC-8`, `AC-13`） | `fermi-fire-button` | `ja`：`FIRE：推定レーザーを発射して桁オーダーを判定する`<br>`en`：`FIRE: Fire estimation beam and evaluate order of magnitude` |
| **画面3：モード2** | `RESET` 全スロット初期化ボタン（`AC-9`） | `fermi-reset-button` | `ja`：`RESET：3スロットの選択をすべて解除して初期状態に戻す`<br>`en`：`RESET: Clear all 3 slots and return to initial state` |
| **画面3：モード2** | 結果解説領域と必須3項目（`AC-9`：`FIRE` 完了後に表示） | コンテナ：`fermi-explanation-panel`<br>1. 推定値と基準値の比較：`fermi-comparison-values`<br>2. 基準因数分解式と解説文：`fermi-baseline-breakdown`<br>3. 罠カード名と理由：`fermi-trap-notes` | 最終推定値・基準値・対数誤差、`ACT 1 × ACT 2 × ACT 3` 基準式と解説文、ステージ内の罠カード名と理由 |
| **画面3：モード2** | クリア後の次ステージ／カルテ移動セカンダリボタン | `fermi-next-stage-button` | `ja`：`次のステージを開く`（または両モードクリア達成時は `思考力診断カルテを見る`）<br>`en`：`Open next stage` / `Open Diagnostic Chart` |
| **画面4：診断カルテ** | 画面4ルート区画 | `screen-diagnostic` | 見出し `h1` により `思考力診断カルテ` / `Diagnostic Chart` |
| **画面4：診断カルテ** | 総合認定ランク表示（`UNRANKED` / `S+` / `S` / `A` / `B` / `C`：`AC-10`, `AC-12`） | `diagnostic-overall-rank` | `ja`：`総合認定ランク：{rank}`<br>`en`：`Overall Rank: {rank}` |
| **画面4：診断カルテ** | 総合スコアおよび両モードクリア進捗表示 | `diagnostic-overall-score`, `diagnostic-progress-combinator`, `diagnostic-progress-fermi` | 5軸平均四捨五入スコアと各モードのクリア数 |
| **画面4：診断カルテ** | 正五角形レーダーチャート（`<svg role="img" aria-labelledby="radar-title radar-desc">`：`AC-10`） | SVG 本体：`diagnostic-radar-chart`<br>スコア多角形：`diagnostic-radar-polygon` | `<title>` と `<desc>` により5軸すべての名称と整数スコアを読み上げ |
| **画面4：診断カルテ** | 5軸それぞれの行と算出整数スコア要素（`0`〜`100`：`AC-10`, `AC-12`） | 1. 仕様読解力：`diagnostic-axis-spec` / 値 `diagnostic-axis-spec-score`<br>2. 順序構築力：`diagnostic-axis-sequence` / 値 `diagnostic-axis-sequence-score`<br>3. リソース制御力：`diagnostic-axis-resource` / 値 `diagnostic-axis-resource-score`<br>4. フェルミ概算センス：`diagnostic-axis-fermi` / 値 `diagnostic-axis-fermi-score`<br>5. 仮説精度：`diagnostic-axis-hypothesis` / 値 `diagnostic-axis-hypothesis-score` | 各軸の名称と整数スコア（`0`〜`100` 点） |
| **画面4：診断カルテ** | 認定ランク未解放時の理由案内領域（`AC-12`：$C_1 = 0 \lor C_2 = 0$ のとき表示） | `diagnostic-unranked-notice` | 両モード各1ステージ以上クリアでランク解放される旨の案内文 |
| **画面4：診断カルテ** | 未クリア時のモード1第1ステージ開始ボタン（`AC-12`：$C_1 = 0$ のとき表示） | `diagnostic-start-combinator-button` | `ja`：`3-ACT COMBINATOR の STAGE 1 を始める`<br>`en`：`Start 3-ACT COMBINATOR Stage 1` |
| **画面4：診断カルテ** | 未クリア時のモード2第1ステージ開始ボタン（`AC-12`：$C_2 = 0$ のとき表示） | `diagnostic-start-fermi-button` | `ja`：`FERMI BLASTER の STAGE 1 を始める`<br>`en`：`Start FERMI BLASTER Stage 1` |
| **画面4：診断カルテ** | 診断結果コピー共有ボタン（未解放時は `disabled`、解放時は活性：`AC-10`, `AC-11`, `AC-12`, `AC-20`） | `diagnostic-copy-button` | `ja`：`診断結果をクリップボードにコピーする`<br>`en`：`Copy diagnostic summary to clipboard` |
| **画面4：診断カルテ** | コピー完了状態通知トースト（`role="status"`、`2.0秒以上`［標準 `3.0秒`］表示：`AC-11`） | `diagnostic-copy-toast` | `ja`：`診断結果をクリップボードにコピーしました`<br>`en`：`Copied diagnostic summary to clipboard` |
| **画面4：診断カルテ** | 自動コピー失敗通知要素（`role="alert"`、`AC-20` 発生時のみ表示） | `diagnostic-copy-error` | 自動コピーがブロックされた原因と手動コピー欄の案内文 |
| **画面4：診断カルテ** | 手動コピー用テキスト領域（`<textarea readonly>`）と全選択補助ボタン（`AC-20` 発生時のみ表示） | テキスト領域：`diagnostic-manual-copy-textarea`<br>全選択補助ボタン：`diagnostic-select-all-button` | `ja`：`手動コピー用の診断結果テキスト` / ボタン：`テキストを全選択する`<br>`en`：`Diagnostic summary text for manual copy` / ボタン：`Select all text` |

---

## 7. 文言

すべてのボタンラベルは**動詞**で表現し、確かめられない誇張表現（「世界一の」「最高の」「誰でもかんたん」等）は一切使わない。文字列を `+` で断片連結せず、名前付きプレースホルダー（`{slots}`, `{cleared}`, `{total}` 等）と英語複数形規則（`1 stage` / `{count} stages`）を用いる。エラー文は利用者を責めず「何が起きたか」と「どう直すか」を簡潔に書く。

### 共通シェル・画面1〜4 UI 文言辞書（`ja` / `en` 完全対訳）

| キー | 日本語 | 英語 | 使う場所 |
|---|---|---|---|
| `app.name` | `LOGIC ARCADE` | `LOGIC ARCADE` | 全画面ヘッダー・タイトル接尾辞 |
| `app.subtitle` | `設計思考とフェルミ推定を鍛えるレトロ思考ゲーム` | `Retro Arcade Puzzles for System Design & Fermi Estimation` | 画面1ヒーロー副題・OGP 説明 |
| `page.title.lobby` | `モード選択 \| LOGIC ARCADE` | `Mode Select \| LOGIC ARCADE` | 画面1 `<title>` |
| `page.title.combinator` | `3-ACT COMBINATOR \| LOGIC ARCADE` | `3-ACT COMBINATOR \| LOGIC ARCADE` | 画面2 `<title>` |
| `page.title.fermi` | `FERMI BLASTER \| LOGIC ARCADE` | `FERMI BLASTER \| LOGIC ARCADE` | 画面3 `<title>` |
| `page.title.diagnostic` | `思考力診断カルテ \| LOGIC ARCADE` | `Diagnostic Chart \| LOGIC ARCADE` | 画面4 `<title>` |
| `nav.skipToMain` | `メインコンテンツへ移動する` | `Skip to main content` | 全画面先頭スキップリンク |
| `nav.homeAria` | `LOGIC ARCADE モード選択へ戻る` | `Return to LOGIC ARCADE Mode Select` | ヘッダーロゴリンク読み上げ |
| `nav.combinator` | `3-ACT COMBINATOR` | `3-ACT COMBINATOR` | 上部ナビ・モード名 |
| `nav.fermi` | `FERMI BLASTER` | `FERMI BLASTER` | 上部ナビ・モード名 |
| `nav.diagnostic` | `思考力診断カルテ` | `Diagnostic Chart` | 上部ナビ・モード名 |
| `header.sound.on` | `SOUND ON` | `SOUND ON` | ヘッダーミュート切替ボタン表示（ON 時） |
| `header.sound.off` | `SOUND OFF` | `SOUND OFF` | ヘッダーミュート切替ボタン表示（OFF 時） |
| `header.sound.ariaOn` | `効果音をミュートする（現在 SOUND ON）` | `Mute sound effects (currently SOUND ON)` | `header-sound-toggle` ON 時の読み上げ |
| `header.sound.ariaOff` | `効果音をオンにする（現在 SOUND OFF）` | `Enable sound effects (currently SOUND OFF)` | `header-sound-toggle` OFF 時の読み上げ |
| `header.lang.switchJa` | `表示言語を日本語に切り替える` | `Switch display language to Japanese` | `header-lang-ja` 読み上げ（表示は `JA`） |
| `header.lang.switchEn` | `表示言語を英語に切り替える` | `Switch display language to English` | `header-lang-en` 読み上げ（表示は `EN`） |
| `banner.storageFallback` | `ブラウザの保存機能が無効なため、このタブを閉じるまでプレイ記録を一時保持します。永続保存するにはプライベートブラウズや Cookie・サイトデータの制限設定をご確認ください。` | `Browser storage is unavailable, so progress is kept in memory until this tab closes. Check private browsing or site data settings to save across reloads.` | 共通シェル `storage-fallback-banner`（`AC-16`） |
| `error.boundary.message` | `画面の表示中に問題が発生しました。ページを再読み込みして再開してください。` | `Something went wrong while rendering this screen. Reload the page to continue.` | 共通エラーバウンダリ説明 |
| `error.boundary.reload` | `ページを再読み込みする` | `Reload page` | `error-reload-button` |
| `lobby.lead` | `登録不要・全19ステージ無料。1ステージ約3分で「3手の設計トレードオフ」と「3スロットのフェルミ因数分解」を試し、5軸の思考特性を可視化します。` | `Zero sign-up, all 19 stages free. Test 3-step system trade-offs and 3-slot Fermi breakdowns in ~3 minutes per stage, then inspect your 5-axis profile.` | 画面1導入説明 |
| `lobby.emptyHint` | `まだクリア記録がありません。まずは STAGE 1 から試せます。` | `No cleared stages yet. Start with Stage 1 to record your first run.` | 画面1初期未プレイ案内 |
| `lobby.cta.startCombinator` | `3-ACT COMBINATOR の STAGE 1 を始める` | `Start 3-ACT COMBINATOR Stage 1` | `lobby-primary-start-button`（$C_1 = 0$ 時） |
| `lobby.cta.startFermi` | `FERMI BLASTER の STAGE 1 を始める` | `Start FERMI BLASTER Stage 1` | `lobby-primary-start-button`（$C_1 \ge 1 \land C_2 = 0$ 時） |
| `lobby.cta.openDiagnostic` | `思考力診断カルテで認定ランクを見る` | `View Rank in Diagnostic Chart` | `lobby-primary-start-button`（両モードクリア済時） |
| `lobby.card.combinator.desc` | `5〜7個のモジュールから3手の順序を組み、副作用と暴走上限を制御して目標出力を達成する設計パズル（全10ステージ）。` | `Arrange 3 modules out of 5–7 to hit target output while controlling side effects and overload limits (10 stages).` | 画面1モード1カード説明 |
| `lobby.card.fermi.desc` | `母集団・絞り込み・単価の3スロットに仮説カードを選び、対数オーダーで未知の規模を射抜く概算ゲーム（全9ステージ）。` | `Pick hypothesis cards across 3 breakdown slots to hit the right order of magnitude without rote memorization (9 stages).` | 画面1モード2カード説明 |
| `lobby.card.diagnostic.desc` | `両モードの履歴から5軸スコア（0〜100）と総合認定ランク（S+〜C）を算出し、テキストで結果を共有します。` | `Computes 5 thinking-axis scores (0–100) and an overall rank (S+ to C) from both modes, ready to copy and share.` | 画面1診断カルテカード説明 |
| `lobby.card.openCombinator` | `3-ACT COMBINATOR を開く` | `Open 3-ACT COMBINATOR` | `lobby-mode-combinator` ボタン |
| `lobby.card.openFermi` | `FERMI BLASTER を開く` | `Open FERMI BLASTER` | `lobby-mode-fermi` ボタン |
| `lobby.card.openDiagnostic` | `思考力診断カルテを開く` | `Open Diagnostic Chart` | `lobby-mode-diagnostic` ボタン |
| `common.progressCleared` | `クリア進捗：{cleared} / {total}` | `Cleared: {cleared} / {total}` | 画面1・画面4進捗表示 |
| `common.clearedBadge` | `CLEAR` | `CLEAR` | クリア済ステージボタン記号（`✓ CLEAR`） |
| `combinator.section.stages` | `ステージを選択する（全10ステージ）` | `Select Stage (10 Stages)` | 画面2ステージ選択見出し |
| `combinator.label.target` | `ターゲット達成条件` | `Target Condition` | `combinator-target-condition` ラベル |
| `combinator.label.limit` | `暴走上限値` | `Overload Limit` | `combinator-overheat-limit` ラベル |
| `combinator.section.slots` | `3ステップ実行スロット` | `3-Step Execution Slots` | 画面2スロット区画見出し |
| `combinator.slot.empty` | `未配置（モジュールを押して配置）` | `Empty (select a module below)` | 未配置スロット内表示 |
| `combinator.slot.removeHint` | `押して解除する` | `Activate to remove` | 配置済スロット内補助文 |
| `combinator.guidance.unassigned` | `未配置のスロットがあります：{slots} にモジュールを配置してください。` | `Unassigned slots remaining: place modules in {slots}.` | `combinator-slot-guidance`（`AC-13`） |
| `combinator.action.run` | `RUN（実行する）` | `RUN (Execute)` | `combinator-run-button` |
| `combinator.action.step` | `STEP（1手進める）` | `STEP (1 Act)` | `combinator-step-button` |
| `combinator.action.reset` | `RESET（戻す）` | `RESET (Restore)` | `combinator-reset-button` |
| `combinator.action.nextStage` | `次のステージを開く` | `Open Next Stage` | `combinator-next-stage-button` |
| `combinator.section.modules` | `モジュールデッキ（押してスロットへ配置）` | `Module Deck (Select to Assign)` | 画面2モジュール一覧見出し |
| `combinator.attr.effect` | `基本性能` | `Effect` | モジュール属性1ラベル（`AC-2`） |
| `combinator.attr.cost` | `エネルギーコスト` | `Energy Cost` | モジュール属性2ラベル（`AC-2`） |
| `combinator.attr.sideEffect` | `副作用` | `Side Effect` | モジュール属性3ラベル（`AC-2`） |
| `combinator.attr.condition` | `発動条件` | `Condition` | モジュール属性4ラベル（`AC-2`） |
| `combinator.status.idle` | `IDLE（待機中）` | `IDLE (Ready)` | `combinator-result-status` 初期状態 |
| `combinator.status.stepping` | `STEPPING（{step}/3 一時停止中）` | `STEPPING (Paused at {step}/3)` | `STEP` 検証一時停止状態（`AC-5`） |
| `combinator.status.running` | `RUNNING（再生中）` | `RUNNING (Simulating)` | `RUN` 再生中状態 |
| `combinator.status.clear` | `STAGE CLEAR` | `STAGE CLEAR` | クリア達成状態（`AC-3`） |
| `combinator.status.crashed` | `CRASHED` | `CRASHED` | 途中制約違反停止状態（`AC-6`） |
| `combinator.status.failed` | `FAILED` | `FAILED` | 3手完走後ターゲット未達状態（`AC-6`） |
| `combinator.score.label` | `獲得スコア：{score} pt` | `Score: {score} pt` | `combinator-score-value` |
| `combinator.debug.heading` | `デバッグログ（破綻箇所と数値の検証）` | `Debug Log (Failure Step & Telemetry)` | `combinator-debug-log` 見出し |
| `combinator.debug.location` | `失敗発生箇所：{location}` | `Failure Location: {location}` | `combinator-debug-location`（`STEP 1`〜`3` / `FINAL CHECK`） |
| `combinator.debug.reason.energy` | `原因種別：エネルギー枯渇（残量が 0 未満に低下）` | `Cause: Energy Depletion (dropped below 0)` | `combinator-debug-reason`（枯渇時） |
| `combinator.debug.reason.overheat` | `原因種別：暴走上限超過（副作用値が上限を超過）` | `Cause: Overload Exceeded (side effect crossed limit)` | `combinator-debug-reason`（上限超過時） |
| `combinator.debug.reason.unmet` | `原因種別：ターゲット未達（3手完走時点で目標条件に不足）` | `Cause: Target Unmet (final output missed condition)` | `combinator-debug-reason`（完走未達時） |
| `combinator.debug.values` | `期待条件値：{expected} ／ 実測値：{actual}` | `Expected: {expected} / Actual: {actual}` | `combinator-debug-values`（`AC-6`） |
| `combinator.debug.retryHint` | `RESET を押すかスロットのモジュールを差し替えて、別の順序を試せます。` | `Press RESET or swap a module in any slot to test another sequence.` | デバッグログ内リカバリ案内 |
| `fermi.tier.beginner` | `初級` | `Beginner` | モード2ステージ1〜3区分（`AC-7`） |
| `fermi.tier.intermediate` | `中級` | `Intermediate` | モード2ステージ4〜6区分（`AC-7`） |
| `fermi.tier.advanced` | `上級` | `Advanced` | モード2ステージ7〜9区分（`AC-7`） |
| `fermi.guidance.unassigned` | `未選択のスロットがあります：{slots} の仮説カードを1枚ずつ選択してください。` | `Unselected slots remaining: select one hypothesis card for {slots}.` | `fermi-slot-guidance`（`AC-13`） |
| `fermi.action.fire` | `FIRE（発射する）` | `FIRE (Launch)` | `fermi-fire-button` |
| `fermi.action.reset` | `RESET（戻す）` | `RESET (Clear)` | `fermi-reset-button` |
| `fermi.status.idle` | `IDLE（仮説選択待ち）` | `IDLE (Select Cards)` | `fermi-result-status` 初期状態 |
| `fermi.status.running` | `RUNNING（推定レーザー計測中）` | `RUNNING (Measuring Beam)` | `FIRE` 再生中状態 |
| `fermi.status.perfect` | `PERFECT ORDER` | `PERFECT ORDER` | `\|d\| <= 0.5` かつ罠0枚（`AC-8`） |
| `fermi.status.good` | `GOOD RANGE` | `GOOD RANGE` | `\|d\| <= 1.0`（`AC-8`） |
| `fermi.status.overkill` | `OVERKILL` | `OVERKILL` | `d > 1.0` 過大推定（`AC-8`） |
| `fermi.status.underestimate` | `UNDERESTIMATE` | `UNDERESTIMATE` | `d < -1.0` 過小推定（`AC-8`） |
| `fermi.explain.heading` | `因数分解ロジックと罠カードの解説` | `Factorization Breakdown & Trap Card Analysis` | `fermi-explanation-panel` 見出し |
| `fermi.explain.comparison` | `あなたの推定値：{estimate} ／ ステージ基準値：{baseline}（対数誤差 d = {logError}）` | `Your Estimate: {estimate} / Stage Baseline: {baseline} (log10 error d = {logError})` | `fermi-comparison-values`（`AC-9`） |
| `fermi.explain.formulaHeading` | `基準因数分解式（ACT 1 × ACT 2 × ACT 3）` | `Baseline Factorization (ACT 1 × ACT 2 × ACT 3)` | `fermi-baseline-breakdown` 小見出し |
| `fermi.explain.trapHeading` | `このステージの罠カードと注意点` | `Trap Cards in This Stage` | `fermi-trap-notes` 小見出し |
| `fermi.explain.trapTriggeredBadge` | `今回選択した罠カード` | `Selected in Your Run` | プレイヤーが踏んだ罠カードの強調タグ |
| `diagnostic.heading.rank` | `総合認定ランク` | `Overall Certified Rank` | 画面4ランク区画見出し |
| `diagnostic.rank.unranked` | `UNRANKED` | `UNRANKED` | 未解放時のランク表記（`AC-12`） |
| `diagnostic.overallScore` | `総合スコア：{score} / 100` | `Overall Score: {score} / 100` | `diagnostic-overall-score`（解放時） |
| `diagnostic.overallScore.unranked` | `総合スコア：未算出（両モード各1ステージクリアで解放）` | `Overall Score: Pending (clear 1+ stage in each mode)` | `diagnostic-overall-score`（未解放時） |
| `diagnostic.unranked.noticeBoth` | `認定ランクはまだ解放されていません。3-ACT COMBINATOR と FERMI BLASTER をそれぞれ1ステージ以上クリアすると、総合認定ランク（S+〜C）と結果コピーが解放されます。` | `Your overall rank is not unlocked yet. Clear at least 1 stage in both 3-ACT COMBINATOR and FERMI BLASTER to unlock your S+ to C rank and summary sharing.` | `diagnostic-unranked-notice`（両方0クリア時） |
| `diagnostic.unranked.noticeCombinatorOnly` | `あと1モードで認定ランク解放です。3-ACT COMBINATOR を1ステージ以上クリアすると総合認定ランクが確定します。` | `One mode left to unlock your rank. Clear at least 1 stage in 3-ACT COMBINATOR to finalize your overall rank.` | `diagnostic-unranked-notice`（$C_1 = 0, C_2 \ge 1$ 時） |
| `diagnostic.unranked.noticeFermiOnly` | `あと1モードで認定ランク解放です。FERMI BLASTER を1ステージ以上クリアすると総合認定ランクが確定します。` | `One mode left to unlock your rank. Clear at least 1 stage in FERMI BLASTER to finalize your overall rank.` | `diagnostic-unranked-notice`（$C_1 \ge 1, C_2 = 0$ 時） |
| `diagnostic.axis.spec` | `仕様読解力` | `Spec Comprehension` | 第1軸名称（`AC-10`） |
| `diagnostic.axis.sequence` | `順序構築力` | `Sequence Design` | 第2軸名称（`AC-10`） |
| `diagnostic.axis.resource` | `リソース制御力` | `Resource Control` | 第3軸名称（`AC-10`） |
| `diagnostic.axis.fermi` | `フェルミ概算センス` | `Fermi Sense` | 第4軸名称（`AC-10`） |
| `diagnostic.axis.hypothesis` | `仮説精度` | `Hypothesis Precision` | 第5軸名称（`AC-10`） |
| `diagnostic.radar.title` | `5軸エンジニア思考特性レーダーチャート` | `5-Axis Engineering Thinking Radar Chart` | SVG `<title>` |
| `diagnostic.radar.desc` | `仕様読解力 {s1}、順序構築力 {s2}、リソース制御力 {s3}、フェルミ概算センス {s4}、仮説精度 {s5}（各100点満点）` | `Spec Comprehension {s1}, Sequence Design {s2}, Resource Control {s3}, Fermi Sense {s4}, Hypothesis Precision {s5} out of 100` | SVG `<desc>` |
| `diagnostic.action.copy` | `診断結果をコピーする` | `Copy Diagnostic Summary` | `diagnostic-copy-button`（`AC-10`, `AC-11`） |
| `diagnostic.copy.toastSuccess` | `診断結果をクリップボードにコピーしました。SNS やチャットにそのまま貼り付けられます。` | `Copied diagnostic summary to clipboard. Ready to paste and share.` | `diagnostic-copy-toast`（`AC-11`） |
| `diagnostic.copy.errorFallback` | `クリップボードへの自動コピーがブラウザに制限されました。下のテキスト欄を選択してコピーしてください。` | `Automatic clipboard copy was blocked by the browser. Select and copy the summary text below.` | `diagnostic-copy-error`（`AC-20`） |
| `diagnostic.copy.manualLabel` | `手動コピー用の診断結果サマリー` | `Diagnostic Summary for Manual Copy` | `diagnostic-manual-copy-textarea` の `<label>` |
| `diagnostic.action.selectAll` | `テキストを全選択する` | `Select All Text` | `diagnostic-select-all-button` |
| `diagnostic.share.template` | `LOGIC ARCADE 思考力診断カルテ\n総合認定ランク: {rank} ({overall}/100)\n・仕様読解力: {s1}\n・順序構築力: {s2}\n・リソース制御力: {s3}\n・フェルミ概算センス: {s4}\n・仮説精度: {s5}` | `LOGIC ARCADE Diagnostic Chart\nOverall Rank: {rank} ({overall}/100)\n- Spec Comprehension: {s1}\n- Sequence Design: {s2}\n- Resource Control: {s3}\n- Fermi Sense: {s4}\n- Hypothesis Precision: {s5}` | クリップボード書き込みおよび手動コピー欄の出力文字列（`AC-11`, `AC-20`） |

### ステージ定義データの文言対訳規則

モード1全10ステージ（ステージ名・目標条件文・暴走上限名・各モジュール名および4属性説明）とモード2全9ステージ（お題文・各スロット役割名・各仮説カードラベル・基準因数分解式解説文・各罠カード理由文）もすべて `{ ja: string, en: string }` の対訳オブジェクトで定義し、空文字列・未翻訳キー露出 `0件`（PRD 12章言語要件）とする。

### 権限を求める理由の説明文とタイミング

- **カメラ・マイク・位置情報・プッシュ通知**：**一切求めない**（本機能では使用しない。ページ表示直後に通知許可ダイアログ等を出すことも禁止する：R-28）。
- **クリップボード書き込み（Clipboard API）**：ページ表示時には一切呼び出さず、利用者が画面4『思考力診断カルテ』で自発的に `診断結果をコピーする` ボタン（`diagnostic-copy-button`）を押したイベントハンドラ内でのみ `navigator.clipboard.writeText()` を1回呼び出す。ブラウザ設定により拒否・例外となった場合は偽の成功表示を出さず、即座に `diagnostic.copy.errorFallback` の理由説明と手動コピー用 `<textarea readonly>` を同じ区画に展開する（`AC-20`）。
- **Cookie・外部送信の同意画面**：`001-arcade-core` では Cookie 発行 `0件`・個人データ収集 `0件`・外部送信リクエスト `0件` であるため同意バナーは設けない（G5 本番公開時に Cookie レス匿名解析を接続する場合は PRD 17章・G0 承認 Q-2 に従い外部送信公表文面を整備する）。

---

## 8. 見た目

トークンの機械可読な完全定義は `design/tokens.json` に置き、すべての画面はトークンの値だけを参照する（B-3, B-4, B-5）。

### 使うトークン（文字・余白・サイズ・モーション）

- **書体と文字段階（B-4）**：
  - 書体は1つのみ：`typography.fontFamily.base`（`system-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", sans-serif`）。数値・スコア・ステップ番号には別フォントを追加せず同一書体の `font-variant-numeric: tabular-nums` を適用して桁を揃える。細字（`100`〜`300`）と極小ドットフォントは使用禁止。
  - 文字段階は4段階のみ：`display`（`1.75rem` / `28px`, Bold `700`, 行高 `1.25`）、`heading`（`1.25rem` / `20px`, Bold `700`, 行高 `1.35`）、`body`（`1rem` / `16px`, Regular `400` / Semibold `600`, 行高 `1.55`）、`caption`（`0.875rem` / `14px`, Semibold `600`, 行高 `1.45`）。説明文の1行最大幅は `38em`（全角35〜40字・英字45〜75字目安）。
- **余白と縦グリッド整列線（B-3）**：
  - 余白トークンは `4px` (`space.1`), `8px` (`space.2`), `12px` (`space.3`), `16px` (`space.4`), `24px` (`space.6`), `32px` (`space.8`) の6段階のみ。
  - 縦の整列基準線（`design/001-arcade-core/wireframes.md` 参照）：最大コンテナ幅 `1200px` 中央配置とし、PC（`>= 1280px`）は外周ガター `32px` で左ペイン左端 `L0`・右ペイン左端 `L1`（2カラム `5fr : 6fr`, `gap: 24px`）・右端 `R0` の3本の縦線に全パネル端を揃える。スマホ最小幅（`320px`）は外周ガター `12px`（有効幅 `296px`）で単一左基準線 `L0` と右基準線 `R0` の1カラムに揃える。
- **角丸・枠線・モーション時間**：
  - 角丸はベクター計器らしい引き締まった小角丸（`radiusSm: 4px`, `radiusMd: 8px`）に統一し、無意味な大角丸カードや装飾グラデーション・ドロップシャドウは置かない（B-2）。
  - 枠線は通常 `1.5px solid`、選択中スロット／カードおよび `forced-colors` 時は `2px solid`。
  - 再生時間は通常時 `2.4秒`（上限 `3.0秒以内`）、`STEP` 1手は `0.45秒`、`prefers-reduced-motion: reduce` 時はシェイク `0px`・全体再生 `0.45秒`（上限 `1.0秒以内`）、`RESET` は `0.1秒以内`（上限 `0.2秒以内`）。

### 新しく足す色トークン（意味の名前と4モード＋強制配色の値）

OS の `prefers-color-scheme`（ライト／ダーク）および `prefers-contrast: more`（ライト高コントラスト／ダーク高コントラスト）、`@media (forced-colors: active)`（システム色）に自動追従する。

| トークン名 | 用途（意味） | ライト | ダーク | 高コントラスト（ライト / ダーク） | `forced-colors` |
|---|---|---|---|---|---|
| `color.surface.canvas` | ページ最背面 | `#F4F7FB` | `#090D16` | `#FFFFFF` / `#000000` | `Canvas` |
| `color.surface.panel` | カード・スロット・解説パネル面 | `#FFFFFF` | `#111827` | `#FFFFFF` / `#000000` | `Canvas` |
| `color.surface.elevated` | ヘッダー・選択中スロット面 | `#EBF0F7` | `#1A2438` | `#F5F5F5` / `#0A0A0A` | `ButtonFace` |
| `color.surface.stage` | シミュレーション Canvas・SVG チャート盤面 | `#F8FAFC` | `#0D1424` | `#FFFFFF` / `#000000` | `Canvas` |
| `color.surface.disabled` | 非活性ボタン背景 | `#E2E8F0` | `#1E293B` | `#EEEEEE` / `#1A1A1A` | `ButtonFace` |
| `color.text.primary` | 見出し・本文・主要数値 | `#0F172A` | `#F1F5F9` | `#000000` / `#FFFFFF` | `CanvasText` |
| `color.text.secondary` | 補助ラベル・単位・条件補足 | `#334155` | `#CBD5E1` | `#141414` / `#EFEFEF` | `CanvasText` |
| `color.text.onAction` | 主操作ボタン上の文字 | `#FFFFFF` | `#06121E` | `#FFFFFF` / `#000000` | `HighlightText` |
| `color.text.disabled` | 非活性ボタン上の文字（近傍に活性案内文を併設） | `#64748B` | `#94A3B8` | `#555555` / `#A6A6A6` | `GrayText` |
| `color.action.primary` | 画面唯一の主操作ボタン塗り・選択強調枠 | `#0055D4` | `#22D3EE` | `#003399` / `#00FFFF` | `Highlight` |
| `color.action.primaryHover` | 主操作ホバー／押下時背景 | `#003FA3` | `#67E8F9` | `#001F66` / `#80FFFF` | `Highlight` |
| `color.status.success` / `successBg` | クリア・`PERFECT ORDER`・`S+`/`S` | `#006B54` / `#E6F7F2` | `#34D399` / `#082922` | `#004D3B` on `#FFFFFF` / `#5CFFB8` on `#000000` | `CanvasText` / `Canvas` |
| `color.status.info` / `infoBg` | `GOOD RANGE`・信号パルス・`A`/`B`・完了通知 | `#0055D4` / `#E8F1FF` | `#38BDF8` / `#0A2239` | `#003399` on `#FFFFFF` / `#66D9FF` on `#000000` | `Highlight` / `Canvas` |
| `color.status.warning` / `warningBg` | 発熱注意・`OVERKILL`・保存無効通知・`C`/`UNRANKED` | `#8A4B00` / `#FFF4E5` | `#FBBF24` / `#2B1F06` | `#663600` on `#FFFFFF` / `#FFD633` on `#000000` | `CanvasText` / `Canvas` |
| `color.status.danger` / `dangerBg` | `CRASHED`・`FAILED`・`UNDERESTIMATE`・罠解説・コピー失敗 | `#B3124F` / `#FDECF2` | `#FB7185` / `#310E1B` | `#8C0036` on `#FFFFFF` / `#FF80A6` on `#000000` | `CanvasText` / `Canvas` |
| `color.border.default` | ボタン・スロット・カード・パネル実線枠 | `#5B6B82` | `#7C8EA6` | `#000000` / `#FFFFFF` | `ButtonText` |
| `color.focus.ring` | `2px` キーボードフォーカスリング | `#0044AA` | `#38BDF8` | `#002277` / `#FFFF00` | `Highlight` |
| `color.chart.grid` | レーダーチャート正五角形グリッド・ゲージ枠 | `#64748B` | `#7C8EA6` | `#262626` / `#CCCCCC` | `CanvasText` |
| `color.chart.polygonStroke` | レーダーチャート多角形ストローク（`2.5px`）＆頂点 | `#0055D4` | `#22D3EE` | `#003399` / `#00FFFF` | `Highlight` |

### 使うアイコン記号（SF Symbols の Web 読み替え）

外部アイコンフォントへの通信を行わず（`AC-14`）、バンドル内蔵の軽量インラインベクター記号（すべて `aria-hidden="true"` とし必ず文字ラベルを併記する）を使う：`icon-sound-on`（スピーカー波形）、`icon-sound-off`（スピーカー斜線）、`icon-check`（`✓` クリア済・成功）、`icon-diamond`（`◆` PERFECT ORDER / S+）、`icon-triangle-warn`（`▲` 暴走注意・OVERKILL・保存退避通知）、`icon-cross-crash`（`✕` CRASHED / FAILED / 罠カード警告）。

### ターゲット仮説・性格語・差をつける点が表れている場所

- **ターゲット仮説の反映箇所**：
  - 業務の合間や通勤中のスマホ片手（5〜15分）で環境構築や音出し事故なく試したいエンジニア像（調査2章）に対し、画面1 `/` の登録0秒開始、共通ヘッダー右上の常設 `SOUND ON / OFF` と `JA / EN` 切替、および画面2・画面3のドラッグ不要な3スロット `<button>` 選択 UI と抑制された4色セマンティック配色（R-17）として表れている。
- **性格語（4語）が表れている場所**：
  - **明快（Crisp）**：画面2のモジュール4属性構造化タグと `combinator-debug-log`（発生ステップ・原因・期待値 vs 実測値の並列表示）、および画面3の `ACT 1 × ACT 2 × ACT 3` リアルタイム数式プレビューに表れている。
  - **軽快（Snappy）**：画面1の `1.0秒以内` 即時操作開始、画面2・画面3の `3.0秒以内`（動き軽減時 `1.0秒以内`）のシミュレーション再生、および `0.2秒以内` に即復帰する `RESET` ボタンに表れている。
  - **論理的（Analytical）**：画面2の `STEP`（試行回数を増やさず1手ずつ状態遷移を検証できるボタン）と、画面3の無料開放された `fermi-explanation-panel`（対数誤差 `d`・基準因数分解式・二重計上などの罠カード理由）に表れている。
  - **鮮烈（Neon-Tactile）**：画面2の回路パルス波形＆`+SCORE` ポップアップ、画面3の対数オーダー帯レーザー着弾メーター、画面4の `color.chart.polygonStroke` による正五角形レーダーチャートと `S+`〜`C` 認定バッジ（および Web Audio 合成チップチューン音）に表れている。
- **差をつける点（2個）が表れている場所**：
  1. **ベクター計器再生＆無料デバッグ／罠カード解剖ログ**：画面2 `/combinator` で `RUN` / `STEP` を押した直後の `combinator-simulation-canvas` から `combinator-debug-log` 点灯までの瞬間、および画面3 `/fermi` で `FIRE` を押した直後の `fermi-simulation-canvas` から `fermi-explanation-panel`（基準式＋罠カード理由）開示までの瞬間に表れている。
  2. **2モード統合アーケード認定証＆1タップ整形テキスト共有**：画面4 `/diagnostic` を開いた瞬間の `diagnostic-overall-rank`（`S+`〜`C`）＋ `diagnostic-radar-chart`（5軸統合）と、`diagnostic-copy-button` を押した瞬間の整形テキストコピー（および権限拒否時の手動コピー欄展開）に表れている。

### 参考にした WCAG 2.2・WAI-ARIA APG・MDN の URL

- WCAG 2.2 全体：https://www.w3.org/TR/WCAG22/
- WCAG 1.4.1 Use of Color：https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- WCAG 1.4.3 Contrast (Minimum)：https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- WCAG 1.4.4 Resize Text：https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- WCAG 1.4.10 Reflow：https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- WCAG 1.4.11 Non-text Contrast：https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- WCAG 1.4.2 Audio Control：https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html
- WCAG 2.1.1 Keyboard：https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html
- WCAG 2.3.1 Three Flashes or Below Threshold：https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html
- WCAG 2.4.2 Page Titled：https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html
- WCAG 2.4.13 Focus Appearance：https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- WCAG 2.5.7 Dragging Movements：https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- WCAG 2.5.8 Target Size (Minimum)：https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- WCAG 4.1.3 Status Messages：https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- WAI-ARIA APG Patterns（Tabs / Button / Alert）：https://www.w3.org/WAI/ARIA/apg/patterns/ 、 https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ 、 https://www.w3.org/WAI/ARIA/apg/patterns/button/ 、 https://www.w3.org/WAI/ARIA/apg/patterns/alert/
- MDN Media Queries（`prefers-color-scheme` / `forced-colors` / `prefers-reduced-motion`）：https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme 、 https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors 、 https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

---

## 9. アクセシビリティ

- **ブレークポイントごとの並びと、幅 `320px`・幅 `1280px`・文字拡大 `200%` での並び（`AC-18`）**：
  - **PC（`>= 1280px`・文字拡大 `100%`）**：共通ヘッダーは1行横並び（左上ロゴ・中央3モードリンク・右上ミュート＆言語切替）。画面1は3カラムモードカード並列。画面2・画面3は左ペイン（目標／お題＋Canvas＋状態／デバッグ・解説）と右ペイン（横3列スロット＋実行ボタン横並び＋2列モジュール／スロット別仮説カードグリッド）の2ペイン構成。画面4は左ペイン（認定ランク＋正五角形 SVG チャート）と右ペイン（5軸スコア `<dl>`＋共有ボタン）の2ペイン構成。
  - **タブレット（`768px`〜`1279px`）および PC `1280px × 200%` ズーム（実質 `640px` CSS ピクセル相当）**：2ペインを解除して1カラム縦積みに切り替え、スロット群・ステージ選択ボタン群・ヘッダー項目に `flex-wrap: wrap` を適用する。すべてのグリッド子要素に `min-width: 0; box-sizing: border-box;` を指定し、横はみ出し `0px` を保つ。
  - **スマホ最小幅（`320px × 100%`）および最厳条件（`320px × 文字拡大 200%`）**：外周左右パディングを固定 `12px`（有効幅 `296px`）とし、ヘッダーは2段以上に自動折り返し、ステージ選択ボタン（10個／9個）は横スクロールバーを使わず折り返しグリッド（1行2〜5個）に並べる。画面2の `STEP 1`〜`3` スロット・操作ボタン（`RUN`, `STEP`, `RESET`）・モジュールカード、および画面3の `ACT 1`〜`3` 仮説カード・操作ボタン（`FIRE`, `RESET`）はすべて幅 `100%` の1列縦積みにリフローする。Canvas と SVG レーダーチャートは `width: 100%; max-width: 100%; height: auto;` で親幅に縮小追従させる。
  - **押せる範囲（ターゲットサイズ）**：全ブレークポイント・全拡大率で操作可能な全要素に `min-width: 24px; min-height: 24px` 以上を強制し（WCAG 2.5.8 AA）、標準実寸はヘッダー補助ボタンで `36x36px` 以上、スマホ幅での主操作ボタン・ステージ選択・スロット・カードはすべて高さ `44px` 以上かつ隣接要素との間隔 `8px` 以上を確保し、重なりによる押下不能を `0件` にする。
- **色だけで区別していないか**：
  - ホバー専用の操作は `0件` とし、すべての状態区別で「色＋文字ラベル＋記号アイコン＋枠線形状」を併用する：
    - クリア済みステージ：`color.status.success` ＋ `✓` 記号 ＋ `CLEAR` バッジ（未クリアは番号のみ・通常実線枠）。
    - 選択中スロット／仮説カード：`color.action.primary` `2px` 太実線枠 ＋ `color.surface.elevated` 背景 ＋ `[選択中 / SELECTED]` テキストまたは `▶` インジケータ（未選択は `1.5px` 通常枠）。
    - 非活性（`disabled`）ボタン：`disabled` 属性 ＋ `1.5px` 破線枠 ＋ 直上の未配置スロット案内文（`AC-13`）。
    - モード1結果：`STAGE CLEAR`（`✓`＋成功色）、`CRASHED`（`✕`＋危険色＋発生ステップ番号）、`FAILED`（`✕`＋危険色＋`FINAL CHECK`）。
    - モード2判定：`PERFECT ORDER`（`◆`＋成功色）、`GOOD RANGE`（`●`＋情報色）、`OVERKILL`（`▲`＋警告色＋`+桁超過`）、`UNDERESTIMATE`（`▼`＋危険色＋`-桁不足`）。
    - 音声状態：`icon-sound-on` ＋ `SOUND ON` 文字列 と `icon-sound-off` ＋ `SOUND OFF` 文字列の切り替え。
- **動きを減らす設定、透明度を下げる設定・強制配色のとき**：
  - `prefers-reduced-motion: reduce` 有効時（`AC-17`）：画面シェイク振幅を `0px` に固定し、連続移動アニメーションを離散ステップハイライト更新に切り替えて、実行押下から結果表示までを `0.45秒`（上限 `1.0秒以内`）で完了させる。また通常時を含め、秒間3回を超える点滅（フラッシュ）は一切描画しない（WCAG 2.3.1）。
  - 透明度・強制配色：すりガラス半透明背景に依存せず不透明サーフェス色（`color.surface.*`）を使うため `prefers-reduced-transparency` でもコントラストが低下しない。`@media (forced-colors: active)` 時はネオン `box-shadow` が無効化されても `2px solid` 実線枠・システム色（`Highlight`, `CanvasText`, `GrayText`）・SVG 実線ストロークによってすべての境界と選択状態が判別できる。
- **見出しの階層、ランドマーク、キーボードのフォーカス順序と見え方、ページのタイトル**：
  - **ランドマーク**：全画面で `<a class="skip-link">` → `<header>`（内に主要 `<nav aria-label="モード切替">`）→ `<main id="main-content">` → `<footer>` の標準ランドマーク構造を持つ。
  - **見出し階層**：`<h1>` は1画面に厳密に1つ（画面1：`LOGIC ARCADE`、画面2：`3-ACT COMBINATOR`、画面3：`FERMI BLASTER`、画面4：`思考力診断カルテ` / `Diagnostic Chart`）とし、区画見出し `<h2>` → サブ区画 `<h3>` と段飛ばしなく構成する。
  - **キーボードのフォーカス順序と操作**：DOM の視覚順序と一致させ、`スキップリンク` → `ヘッダー（ホーム → 3モードナビ → SOUND 切替 → JA/EN 切替）` → `ステージ選択ボタン群` → `スロット群` → `実行・検証・リセットボタン群` → `モジュール／仮説カード群` → `結果・共有アクション（手動コピー欄展開時は textarea → 全選択ボタン）` の順に `Tab` / `Shift+Tab` で移動でき、`Enter` / `Space` だけで全19ステージのクリアと診断結果コピーまで100%完走できる。
  - **フォーカスの見え方**：`:focus-visible` 時に `outline: 2px solid var(--color-focus-ring); outline-offset: 2px;` を全操作要素に表示する（背景に対するコントラスト比は最小でも `7.24:1` あり WCAG 2.4.13 の `3:1` 基準を満たす）。
  - **ページの `<title>`**：画面遷移および `JA / EN` 言語切替のたびに `document.title` を第1章・第7章の `page.title.*`（「画面の名前 | LOGIC ARCADE」）へ即時更新する。
- **英語が長くなったとき（疑似言語 Double-Length で確かめる画面）**：
  - 全4画面すべてを対象とし、とくに文字幅が詰まりやすい (1) 共通ヘッダーのモード切替リンク・`SOUND ON/OFF` ボタン、(2) 画面2のモジュールカード4属性ラベルとデバッグログ見出し、(3) 画面3の4段階判定バッジ（`UNDERESTIMATE`）と仮説カードボタン、(4) 画面4の5軸名称（`Spec Comprehension`, `Hypothesis Precision`）と `UNRANKED` 案内区画において、英語文字列を約2倍長にした疑似言語でもボタン高さの自動伸長と複数行折り返しによって文字切れ・重なり・横はみ出しが `0件` であることを確かめる。

### コントラスト（独自の色を使う全36組の実計算値）

基準：通常文字（`16px` / `14px`）は **4.5:1 以上**、大文字（`24px` 以上または `18.66px` Bold 以上）および UI 操作部品の枠・アイコン・チャート図形は **3.0:1 以上**。下表は `design/tokens.json` の HEX 値から WCAG 2.2 相対輝度式で算出した正確な比率であり、全36組すべてが全モードで基準を満たす（「コントラストを上げる」列は `ライト高コントラスト / ダーク高コントラスト` の双方を記載。`forced-colors: active` 時は OS システム色ペアを適用）。

| 前景（文字、アイコン、枠）と背景の組 | ライト | ダーク | コントラストを上げる |
|---|---|---|---|
| `color.text.primary` on `color.surface.canvas`（通常文字 >= 4.5:1） | 16.61:1 | 17.74:1 | 21.00:1 / 21.00:1 |
| `color.text.primary` on `color.surface.panel`（通常文字 >= 4.5:1） | 17.85:1 | 16.19:1 | 21.00:1 / 21.00:1 |
| `color.text.primary` on `color.surface.elevated`（通常文字 >= 4.5:1） | 15.59:1 | 14.16:1 | 19.26:1 / 19.80:1 |
| `color.text.primary` on `color.surface.stage`（盤面内文字 >= 4.5:1） | 17.06:1 | 16.78:1 | 21.00:1 / 21.00:1 |
| `color.text.secondary` on `color.surface.canvas`（補助文字 >= 4.5:1） | 9.64:1 | 13.09:1 | 18.42:1 / 18.26:1 |
| `color.text.secondary` on `color.surface.panel`（補助文字 >= 4.5:1） | 10.35:1 | 11.95:1 | 18.42:1 / 18.26:1 |
| `color.text.secondary` on `color.surface.elevated`（補助文字 >= 4.5:1） | 9.04:1 | 10.45:1 | 16.90:1 / 17.22:1 |
| `color.text.secondary` on `color.surface.stage`（盤面内補助文字 >= 4.5:1） | 9.90:1 | 12.38:1 | 18.42:1 / 18.26:1 |
| `color.text.onAction` on `color.action.primary`（主ボタン文字 >= 4.5:1） | 6.46:1 | 10.44:1 | 10.86:1 / 16.75:1 |
| `color.text.onAction` on `color.action.primaryHover`（ホバー時主ボタン文字 >= 4.5:1） | 9.38:1 | 13.02:1 | 15.13:1 / 17.67:1 |
| `color.action.primary` on `color.surface.canvas`（主ボタン面・選択枠 >= 3.0:1） | 6.01:1 | 10.75:1 | 10.86:1 / 16.75:1 |
| `color.action.primary` on `color.surface.panel`（選択強調枠 >= 3.0:1） | 6.46:1 | 9.82:1 | 10.86:1 / 16.75:1 |
| `color.action.primary` on `color.surface.elevated`（選択強調枠 >= 3.0:1） | 5.64:1 | 8.59:1 | 9.96:1 / 15.79:1 |
| `color.status.success` on `color.surface.panel`（達成文字・記号 >= 4.5:1） | 6.50:1 | 9.23:1 | 9.88:1 / 16.45:1 |
| `color.status.success` on `color.surface.stage`（盤面内達成表示 >= 4.5:1） | 6.21:1 | 9.56:1 | 9.88:1 / 16.45:1 |
| `color.status.success` on `color.status.successBg`（成功バッジ文字 >= 4.5:1） | 5.87:1 | 8.09:1 | 9.88:1 / 16.45:1 |
| `color.status.info` on `color.surface.panel`（情報文字・パルス >= 4.5:1） | 6.46:1 | 8.28:1 | 10.86:1 / 12.93:1 |
| `color.status.info` on `color.surface.stage`（盤面内パルス波形 >= 4.5:1） | 6.18:1 | 8.58:1 | 10.86:1 / 12.93:1 |
| `color.status.info` on `color.status.infoBg`（情報トースト文字 >= 4.5:1） | 5.68:1 | 7.54:1 | 10.86:1 / 12.93:1 |
| `color.status.warning` on `color.surface.panel`（警告文字・記号 >= 4.5:1） | 6.80:1 | 10.63:1 | 10.04:1 / 14.92:1 |
| `color.status.warning` on `color.surface.stage`（盤面内警告ゲージ >= 4.5:1） | 6.50:1 | 11.01:1 | 10.04:1 / 14.92:1 |
| `color.status.warning` on `color.status.warningBg`（保存退避通知文字 >= 4.5:1） | 6.26:1 | 9.67:1 | 10.04:1 / 14.92:1 |
| `color.status.danger` on `color.surface.panel`（エラー・罠文字 >= 4.5:1） | 6.74:1 | 6.59:1 | 9.68:1 / 8.89:1 |
| `color.status.danger` on `color.surface.stage`（盤面内クラッシュ波形 >= 4.5:1） | 6.44:1 | 6.83:1 | 9.68:1 / 8.89:1 |
| `color.status.danger` on `color.status.dangerBg`（デバッグログ・失敗通知文字 >= 4.5:1） | 5.92:1 | 6.45:1 | 9.68:1 / 8.89:1 |
| `color.border.default` on `color.surface.canvas`（UI 操作部品枠 >= 3.0:1） | 5.05:1 | 5.81:1 | 21.00:1 / 21.00:1 |
| `color.border.default` on `color.surface.panel`（UI 操作部品枠 >= 3.0:1） | 5.43:1 | 5.30:1 | 21.00:1 / 21.00:1 |
| `color.border.default` on `color.surface.elevated`（UI 操作部品枠 >= 3.0:1） | 4.74:1 | 4.64:1 | 19.26:1 / 19.80:1 |
| `color.border.default` on `color.surface.stage`（盤面内区画枠 >= 3.0:1） | 5.19:1 | 5.49:1 | 21.00:1 / 21.00:1 |
| `color.focus.ring` on `color.surface.canvas`（フォーカス枠 >= 3.0:1） | 8.12:1 | 9.07:1 | 14.05:1 / 19.56:1 |
| `color.focus.ring` on `color.surface.panel`（フォーカス枠 >= 3.0:1） | 8.72:1 | 8.28:1 | 14.05:1 / 19.56:1 |
| `color.focus.ring` on `color.surface.elevated`（フォーカス枠 >= 3.0:1） | 7.62:1 | 7.24:1 | 12.88:1 / 18.44:1 |
| `color.chart.grid` on `color.surface.panel`（五角形グリッド線 >= 3.0:1） | 4.76:1 | 5.30:1 | 15.13:1 / 13.08:1 |
| `color.chart.grid` on `color.surface.stage`（盤面目盛り・グリッド >= 3.0:1） | 4.55:1 | 5.49:1 | 15.13:1 / 13.08:1 |
| `color.chart.polygonStroke` on `color.surface.panel`（5軸スコア多角形線 >= 3.0:1） | 6.46:1 | 9.82:1 | 10.86:1 / 16.75:1 |
| `color.chart.polygonStroke` on `color.surface.stage`（5軸スコア多角形線 >= 3.0:1） | 6.18:1 | 10.17:1 | 10.86:1 / 16.75:1 |

---

## 10. 決まっていないこと

- `001-arcade-core` の画面設計・実装・G3 検証を進めるうえで未決の項目は **なし**（アプリ名 `LOGIC ARCADE`、ヘッダー `JA / EN` 切替、開発・G3 時点での外部送信 `0件` はすべて `docs/approvals/001-arcade-core-G0.md` にて確定済み）。
- なお、後続関門（G1 後半の技術設計および G5 本番公開前）で他ロール・Takuma が確定する境界事項は次のとおり：
  1. Web フレームワーク・バンドル構成・`localStorage` 保存スキーマ・`window.__ARCADE_TEST_API__` 公開契約の詳細：G1 後半で `tech-lead` が ADR および `contracts/` に定義する。
  2. 本番公開（G5）時の OGP 画像実ファイル生成・`metadata/web.md`・利用規約および外部送信公表文面の最終承認：G5 関門で `pdm` 作成・Takuma 承認とする。

## 確かめ（提出前に designer が印を付ける。design-reviewer はこれを信じずに確かめる）
- [x] 調査が先にあり、決定表のすべての行に R-n と原則がある（R-n は調査に実在する）
- [x] 全画面に、仕事、主操作1つ、使う標準部品がある
- [x] 全画面の7つの状態が埋まっている
- [x] 押せる範囲が 44x44pt 以上（Web は 24x24px 以上、スマホの幅で 44px が目安）。コントラストが基準を満たし、独自の色の組に数字が3通りある
- [x] AX5 での並びと、VoiceOver の読み上げ順が書いてある（Web は 320px と200%の並び、キーボードの順番）
- [x] 性格語と差をつける点が、画面のどこに表れているか書いてある
- [x] 文言が日英そろい、テストで使う要素に accessibilityIdentifier（Web は data-testid）がある
