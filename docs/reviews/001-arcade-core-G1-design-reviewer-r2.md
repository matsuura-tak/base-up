PASS

## 指摘
なし

## 採点表
| カテゴリ | 点（0〜2） | ★ごとの結果 | 証拠 |
|---|---|---|---|
| **A 根拠** | **2 / 2** | ・★ 調査が先：**満たす**<br>・★ 決定表の全行に実在する R-n と原則（WCAG / APG URL か B-n）：**満たす**<br>・★ 意味のある狙い（ターゲット仮説と R-n、性格語3〜5語と意味しないこと・仕様8章の画面要素、差をつける点1〜2個と画面、方向性2案と不採用理由）：**満たす** | ・`git log --diff-filter=A` で調査コミット `9259081`（`2026-11-12 00:55:47 +0900`）が仕様初回コミット `9149ca1`（`2026-11-12 01:18:33 +0900`）より先行しており、r2 修正コミット `a0dbc1c` でも調査ファイルは無変更で順序が保持されている。<br>・`design/001-arcade-core-research.md:115-150` に `R-1`〜`R-34` の計 `34件`（`>= 5`）、URL・確認日欠落 `0件`、全34 URL が HTTP `200` で疎通確認済み。直接競合4件（`46-58` 行）に URL・良い点・悪い点3つ、別カテゴリー手本2件（`60-66, 131-132` 行）あり。<br>・`design/001-arcade-core.md:96-118` の決定表全 `21行` すべてに調査に実在する `R-n`（未定義参照 `0件`）と WCAG 2.2 / WAI-ARIA APG の URL または `B-1`〜`B-6` がある（HIG URL 混入 `0件`、r2 追加の5 URL もすべて HTTP `200` 確認済み）。<br>・`design/001-arcade-core-research.md:24-40, 68-103` および `design/001-arcade-core.md:413-424` に仮説明記・性格語4語（意味しないこと＋画面要素）・差をつける点2個・方向性2案と不採用理由を確認。 |
| **B HTML の標準と部品集** | **2 / 2** | ・★ 標準要素か ADR の部品集で作れる所はそれを使う：**満たす**<br>・★ 外れる所は逸脱の表に「場所、本来の要素か部品、理由、APG の型（アクセシビリティ対応）」がある：**満たす** | ・`design/001-arcade-core.md:81-88` で全操作・構造に `<header>`, `<nav aria-label>`, `<main>`, `<section>`, `<h1>`〜`<h3>`, `<fieldset>`+`<legend>`, `<a href aria-current="page">`（`role="tab"` 不使用）, `<button type="button" aria-pressed="true\|false">`（APG Button Pattern 準拠）, `<dl>`, `<label>`+`<textarea readonly>`, `<footer>` を使用し、ホバー専用操作 `0件`（`459` 行）。r1 で指摘した決定表の APG `tabs/` 混同および画面3ステージ選択ボタン `fermi-stage-1`〜`9` の `aria-pressed` 漏れも解消済み（`81, 87, 99, 185` 行）。<br>・逸脱3箇所（画面2 `<canvas>` `combinator-simulation-canvas`、画面3 `<canvas>` `fermi-simulation-canvas`、画面4 `<svg>` `diagnostic-radar-chart`：`86-88` 行）すべてに場所・本来の標準要素・理由・外部 `<button>` 分離＋`role="img"`＋`role="status"` / `role="alert"`（APG Alert Pattern）DOM ミラー出力が明記されている。 |
| **C バウハウス（形は働きに従う）** | **2 / 2** | ・★ B-1、B-2（全画面に仕事1文と主操作1つ、主操作が最も目立ち、全要素が仕事か AC に結びつき、役目のない飾りがない）：**満たす** | ・`design/001-arcade-core.md:81-88` および `design/001-arcade-core/wireframes.md:5, 37-188` で全4画面に仕事1文と画面唯一のプライマリ塗り主操作1つ（`color.action.primary`）を確認。グラデーション・ドロップシャドウ・絵文字アイコンすべて `0件`（`373, 468` 行、コマンド検査で確認）。<br>・単一システムサンセリフ書体（`tabular-nums` 併用）・文字4段階（`1.75rem`, `1.25rem`, `1rem`, `0.875rem`）・細字不使用（`365-367` 行、`tokens.json:230-264`）、主操作アクセント1色＋意味色4系統（`381-407` 行）、余白トークン6段階（`4, 8, 12, 16, 24, 32px`）と縦整列基準線 `L0`/`L1`/`R0`（`368-370` 行、`wireframes.md`）を確認。 |
| **D 使いやすさ** | **2 / 2** | （★項目なし） | ・全4画面で Nielsen の10原則（特に #5 エラーの予防・#9 エラーからの回復）を満たす。`RUNNING` 再生中の非活性対象ボタン列挙（画面2：`39, 129` 行、画面3：`44, 130` 行）、画面2の3スロット満杯時未配置カード `disabled` 化（`33, 180, 280` 行）と `STEPPING` 中の構成変更規則（`38` 行）、画面3未達時の再試行案内キー `fermi.explain.retryHint`（`44, 130, 194, 324` 行）がすべて明確化された。<br>・取り消せない破壊的操作は存在せず、`RESET` は両モードとも可逆（`138` 行）。すべてのエラー・退避通知文言に「何が起きたか」と「どうすればよいか」が揃っている。 |
| **E 状態** | **2 / 2** | ・★ 全画面に7つの状態（＋Web の URL 直開き・ログイン切れ）があり、該当しないときは「なし」と理由がある：**満たす** | ・`design/001-arcade-core.md:126-131` で全4画面×7状態がすべて埋まり、ログイン未済・セッション切れは「なし（認証不要）」と理由を明記。<br>・Web 追加要件の「URL を直接開いたとき」について、各画面の固有 URL、不正 `?stage=` 指定時の `history.replaceState` 補正＋`stage-fallback-notice`（`common.stageFallbackNotice`）、および未知パス（404）直アクセス時の `not-found-section`＋`not-found-home-link`（`error.notFound.*`）が定義された（`17-21, 27, 29, 42, 128-130, 159, 166` 行）。<br>・全状態が第7章の文言キーを正確に参照しており（未定義キー参照 `0件`）、長い文字・0件・大量件数の表示も `135-137` 行に定義済み。 |
| **F アクセシビリティ** | **2 / 2** | ・★ コントラスト（通常文字 >= 4.5:1、大文字・UI枠・図形 >= 3.0:1、ライト・ダーク・高コントラスト）：**満たす**<br>・★ 押せる範囲 24×24px 以上（スマホ幅 44px 目安）：**満たす**<br>・★ アイコンだけの操作に読み上げの名前：**満たす** | ・`design/tokens.json` から全36組×4配色（計144通り）および横断・半透明合成組を `python3 -c` で独立再計算し、通常文字最小 `5.68:1`（`>= 4.5:1`）、UI部品枠・主操作面・フォーカス枠・チャート線最小 `4.55:1`（`>= 3.0:1`）で基準未達 `0件`・仕様記載値との乖離 `0件` を確認。<br>・`design/001-arcade-core.md:372, 457`・`tokens.json:279-281` で全操作要素 `>= 24x24px`（ヘッダー補助 `>= 36x36px`、スマホ主要操作・スロット・カード高さ `>= 44px`・間隔 `>= 8px`）。<br>・アイコン単独操作 `0件`（全インライン SVG は `aria-hidden="true"`＋文字併記：`411, 459-465` 行）。色以外の記号・枠線併用（`459-465` 行）、キーボード順序・`2px` フォーカス枠（最小 `7.24:1`：`472-473` 行）、`320px`・`200%` リフロー（`453-456` 行）、ドラッグ代替 `<button>`（`104` 行）、`prefers-reduced-motion: reduce` 時シェイク `0px`・`<= 1.0秒`（`467` 行）を確認。 |
| **G 一貫性** | **2 / 2** | （★項目なし） | ・`design/tokens.json` と仕様8章（`365-407` 行）の色トークン全 `25個`・文字4段階・余白6段階・サイズ全 `11個`（`targetAuxiliaryRecommended: 36px`, `chartPolygonStrokeWidth: 2.5px` を含む）・ブレークポイント3個・モーション全 `11個` が1対1で完全一致（差分 `0件`、本文中の HEX 直書き `0件`、`box-shadow` 記述 `0件`）。<br>・同じ働きの要素は全画面で同一部品・命名を用い、働きが異なる画面2の `RESET（初期値に戻す）`（スロット維持：`275` 行）と画面3の `RESET（選択をクリア）`（全選択解除：`312` 行）は日英ともに明確に区別されている。 |
| **H 文言** | **2 / 2** | （★項目なし） | ・第7章 UI 辞書全 `125キー`（`217-345` 行）＋ステージ対訳規則（`349` 行）で日英完全対訳（重複 `0件`・空欄 `0件`・プレースホルダー不一致 `0件`）。アクションボタンは動詞、トグルボタンは状態非逆転の固定ラベルで記述。<br>・英語が日本語の2倍超となる `26キー` に対する省略禁止・折り返し・全4画面 Double-Length 検証（`135, 475-476` 行）を確認。<br>・WCAG 2.2 SC 2.5.3 Label in Name：可視テキストを持つボタン・リンクは `aria-label` 不使用で内部可視文字をそのままアクセシブル名とし、`aria-label` を使う全7種（`header-home-link`, `header-lang-ja`, `header-lang-en`, `combinator-stage-*` 未クリア/クリア済, `fermi-stage-*` 未クリア/クリア済）すべてで日英とも可視文字列が `aria-label` の先頭に完全一致（不一致 `0件`、6章⇔7章不一致 `0件`）。全4画面＋404 の日英ページ `<title>`（`17-21, 221-225` 行）も完備。 |

- **合計点**：**16 / 16 点**（A:2, B:2, C:2, D:2, E:2, F:2, G:2, H:2）
- **合否の線を満たすか**：**満たす（PASS）** — すべての★項目を満たし、0点のカテゴリがなく、合計 16 / 16 点（合格基準 13 点以上）かつ重大・要修正の指摘が 0 件のため。

## 前回の指摘の追跡（r2 だけ）
| 前回の指摘 | 直った / 直っていない | 証拠 |
|---|---|---|
| **`design-reviewer-r1` 重大1 / `tech-lead-r1` 要修正1**：6章「読み上げのラベル」と7章「画面に見える文字」の不一致・二重定義、トグルボタン状態逆転、および `aria-label` 上書きによる WCAG 2.2 SC 2.5.3 Label in Name 違反・ステージ選択ボタン可視ラベルキー欠落 | 直った | `design/001-arcade-core.md:144-207, 219-345` および `design/001-arcade-core/wireframes.md:15, 26, 70, 135` で全面解消を確認。(1) `header-sound-toggle`（`154, 232-234` 行）は固定可視文字 `SOUND（効果音）` / `SOUND (SFX)`（`aria-label` 不使用、`aria-pressed="true\|false"`、`data-sound-state="on\|off"`）＋隣接状態バッジ `header-sound-state`（`SOUND ON` / `SOUND OFF`, `aria-describedby`）に一本化され、状態逆転が解消された。(2) 十分な可視文字を持つ全ボタン・リンク（`RUN`, `STEP`, `RESET`, `FIRE`, `診断結果をコピーする`, `nav-mode-*`, `lobby-*`, スロット, カード等）は `aria-label` 不使用に統一された。(3) `aria-label` を持つ全7種（`header-home-link`, `header-lang-ja/en`, `combinator-stage-1..10`, `fermi-stage-1..9`）すべてで7章に可視キー（`S{n}` / `S{n} CLEAR` 等）が定義され、日英とも可視文字列が `aria-label` 先頭に完全一致すること、および6章と7章のリテラル不一致が `0件` であることをスクリプトで確認した。 |
| **`design-reviewer-r1` 要修正1**：上部 `<nav><a aria-current="page">` と4章決定表の APG `tabs/` 原則 URL の混同、および画面3ステージ選択ボタン `fermi-stage-1`〜`9` の選択状態 ARIA 属性漏れ | 直った | `design/001-arcade-core.md:81` で `<a href="/..." aria-current="page">（role="tab" は付与しない標準リンクナビゲーション）` と明記され、4章決定表（`99` 行）の原則 URL が APG Landmarks・WCAG 2.4.8 Location・APG Button に修正された（仕様内の `tabs/` 参照 `0件`）。また `87, 185` 行で `fermi-stage-1`〜`9` に `選択中は aria-pressed="true"・非選択は "false"` が明記された。 |
| **`design-reviewer-r1` 要修正2**：`RUNNING` 再生中の非活性対象ボタン未列挙（特に画面3の二重発射抑止欠落）、画面2の3スロット満杯時・`STEPPING` 中のカード／スロット押下規則未定義、および画面3未達時の再試行案内キー欠落 | 直った | `design/001-arcade-core.md:39, 129`（画面2）および `44, 130`（画面3）で `RUNNING` 中に `disabled` 化する全ボタン・スロット・カード・ステージ選択要素が漏れなく列挙された。画面2の3スロット満杯時は未配置モジュールカードを `disabled`（`combinator.module.fullAction`）にする規則（`33, 180, 280` 行）、`STEPPING` 中に構成変更した際は即座に `IDLE`（ステップ `0`・初期値）へ戻して更新する規則（`38` 行）が定義され、画面3にも未達時の再試行案内 `fermi-retry-hint`（`fermi.explain.retryHint`：`44, 130, 194, 324` 行）が追加された。 |
| **`design-reviewer-r1` 要修正3 / `tech-lead-r1` 提案1**：未知 URL パス（404）直アクセス時の表示・キー未定義、不正 `?stage=` 直アクセス時の画面2・3間の揺れとキー欠落、5章・6章の別文言直書き、`<nav aria-label>` の辞書キー欠落、および `wireframes.md` の `READY` 表記揺れ | 直った | (1) 未知 URL（404）表示として `page.title.notFound`、`not-found-section`（`error.notFound.heading` / `message`）、`not-found-home-link`（`error.notFound.backToLobby`）が追加された（`design/001-arcade-core.md:21, 27, 128, 159, 225, 242-244`、`wireframes.md:33`）。(2) 不正 `?stage=` は画面2・3共通で `history.replaceState` による `?stage=1` 補正＋`stage-fallback-notice`（`common.stageFallbackNotice`）に統一された（`18-19, 29, 42, 129-130, 166, 258` 行）。(3) 5章・6章がすべて7章の辞書キー名参照に統一された（未定義キー参照 `0件`）。(4) `nav.modeSwitcherAria`（`モード切替` / `Mode navigation`：`81, 150, 228, 470` 行）が追加され、`wireframes.md:144` も `IDLE` に統一された（旧表記残存 `0件`）。 |
| **`design-reviewer-r1` 要修正4**：`tokens.json` と仕様8章のトークン不一致（`color.border.disabled`, `color.chart.polygonFill`, `2.5px`, `36x36px`）、`box-shadow` 記述の矛盾、および画面2・3の `RESET` 日本語文言の未区別 | 直った | `design/001-arcade-core.md:381-407` の色トークン全25個と `design/tokens.json` が1対1で完全一致し、`tokens.json:280, 284` に `targetAuxiliaryRecommended: "36px"`・`chartPolygonStrokeWidth: "2.5px"` が追加された。`468` 行から `box-shadow` 記述が削除され（`shadow` 検索 `0件`）、`RESET` の日本語文言も画面2 `RESET（初期値に戻す）`（`275` 行）と画面3 `RESET（選択をクリア）`（`312` 行）に明確に区別された。 |
| **`design-reviewer-r1` 提案1**：`design/001-arcade-core-research.md:60-66` の手本（Monkeytype・Wordle）4章本文への「取り入れない点」の補足提案 | 直っていない（提案のため任意・合否影響なし） | 「提案」区分（作り手判断）であり、先行コミット `9259081` の調査ファイルを不変に保つため現状維持とされている。なお手本の課題（任意広告・標準緑黄配色の色覚課題）自体は同ファイル8章 `R-15`・`R-16`（`131-132` 行）に記載済みであり、カテゴリ A の基準は完全に満たしている。 |

## 証拠
- 対象：`main...HEAD`（`371348a...a0dbc1c`、前回 r1 からの修正差分 `9149ca1...a0dbc1c`、ブランチ `feat/001-arcade-core`）、観点：G1 Web デザイン仕様 r2 — 前回（`design-reviewer-r1`・`tech-lead-r1`）の全指摘解消確認、新たに入った不整合の有無、および採点表 A〜H 全基準の独立検証
  - `git diff --name-only main...HEAD` の一覧と読んだ印：
    - [x] `design/001-arcade-core-research.md`（全165行読了・先行コミット `9259081` 維持確認）
    - [x] `design/001-arcade-core.md`（全537行読了・`9149ca1...a0dbc1c` 全差分照合）
    - [x] `design/001-arcade-core/wireframes.md`（全188行読了・`9149ca1...a0dbc1c` 全差分照合）
    - [x] `design/tokens.json`（全308行読了・`9149ca1...a0dbc1c` 全差分照合）
    - [x] `docs/approvals/001-arcade-core-G0.md`（全16行読了）
    - [x] `docs/prd/001-arcade-core.md`（全356行読了）
    - [x] `docs/prd/product.md`（全59行読了）
    - [x] `docs/reviews/001-arcade-core-G0-verifier-r2.md`（全54行読了・テストつなぎ口照合）
    - [x] `docs/reviews/001-arcade-core-G1-design-reviewer-r1.md`（全144行読了・全指摘追跡）
    - [x] `docs/reviews/001-arcade-core-G1-tech-lead-r1.md`（全134行読了・全指摘追跡）

- 実行したコマンドと結果：
  1. `git log --diff-filter=A --format='%h %ci %s' -- design/001-arcade-core-research.md design/001-arcade-core.md` → `9259081`（調査）が `9149ca1`（仕様）より先行。
  2. `grep` / `comm` / `python3` による R 件数（34件）・未定義参照（0件）・直書き HEX / シャドウ / 絵文字検査（0件）。
  3. `python3` によるコントラスト比独立再計算（全36組×4モード＝144通り、未達 `0件`、最小通常文字 `5.68:1`、最小UI枠 `4.55:1`）。
  4. `python3` によるトークン1対1一致（色25・非色38差分 `0件`）、決定表21行検査。
  5. `python3` による第6章⇔第7章⇔第5章⇔`wireframes.md` 完全整合・WCAG 2.5.3 先頭一致検査（全7種違反 `0件`、未定義キー参照 `0件`）。
  6. 全30 URL＋調査全34 URL の HTTP `200` 疎通確認。

- 開いた URL と確認した日付：2026-11-12（新規追加5 URL を含む仕様内全30 URL・調査全34 URL すべて HTTP `200` 確認済み）
- 未検証：なし

## 記録
- 関門：G1
- 判定した役：design-reviewer
- 回：r2
- 対象：`design/001-arcade-core-research.md`, `design/001-arcade-core.md`, `design/001-arcade-core/wireframes.md`, `design/tokens.json`（ブランチ `feat/001-arcade-core`、`main...HEAD`: `371348a...a0dbc1c`、前回からの差分: `9149ca1...a0dbc1c`）
- 日付：2026-11-12
