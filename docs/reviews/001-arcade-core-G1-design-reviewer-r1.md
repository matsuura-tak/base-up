FAIL

## 指摘
- **重大**、`design/001-arcade-core.md:135-141, 146-148, 151, 160-163, 168, 173, 175-176, 187, 209-218, 242-244, 269-270, 296` および `design/001-arcade-core/wireframes.md:15, 67, 125`、6章「読み上げのラベル」と7章「画面に見える文字」の定義が食い違っているうえ、主要な操作ボタン・リンクの読み上げ名（`aria-label`）から画面に見える文字列が脱落・分断・後置されており、音声入力操作および WCAG 2.2 達成基準 2.5.3 Label in Name（レベルA）に違反している。具体的には：(1) 常設ミュート切替 `header-sound-toggle` は可視文字が `SOUND ON` / `SOUND OFF`（213-214行）であるのに対し、6章（139行）は `効果音（ON のとき押してミュート…）` / `Sound effects (pressed when on)`、7章（215-216行）は `効果音をミュートする（現在 SOUND ON）` / `Mute sound effects (currently SOUND ON)` と同一仕様書内で二重定義になっており、139行には `SOUND ON` / `SOUND OFF` が一切含まれず、215-216行でも先頭に入っていない（さらに `aria-pressed` を使うトグルボタンでラベル動詞と押下状態を同時に反転させている）。(2) 言語切替 `header-lang-ja`・`header-lang-en`（140-141, 217-218行）は可視文字が `JA`・`EN` であるのに日本語読み上げ名が `表示言語を日本語に切り替える` / `表示言語を英語に切り替える` となっており、`JA`・`EN` が一切含まれない。(3) 主操作・検証・リセット・共有ボタン群で、7章の可視文字（`RUN（実行する）` / `RUN (Execute)`、`STEP（1手進める）` / `STEP (1 Act)`、`RESET（戻す）` / `RESET (Restore)`・`RESET (Clear)`、`FIRE（発射する）` / `FIRE (Launch)`、`診断結果をコピーする`）を6章（160-162, 175-176, 187行）の `aria-label` が別表現で上書き・分断しており、英語では `Execute`・`1 Act`・`Launch` が読み上げ名から完全に消え、日本語でも `診断結果をクリップボードにコピーする` のように可視文字の途中に語が挿入されている。(4) `header-home-link`・`nav-mode-*`・`lobby-mode-*`・`combinator-module-card-*`・`fermi-card-act*`（135-138, 146-148, 163, 173行）で `Return to ...`・`Open ...`・`Select hypothesis card ...`・`モジュール ...` を可視文字より前に置いており先頭一致を満たさない。(5) ステージ選択ボタン `combinator-stage-1`〜`10`（151行）・`fermi-stage-1`〜`9`（168行）は `wireframes.md:67, 125` で `[S1✓]`〜`[S10]` と描かれているが7章に可視ラベル用キーがなく、6章の読み上げ名（`ステージ {n} を選択する` / `Select Stage {n}`）と可視文字の関係が未定義である。根拠：`AC-1`, `AC-2`, `AC-3`, `AC-5`, `AC-7`, `AC-8`, `AC-11`, `AC-15` の主導線、`docs/prd/001-arcade-core.md:279`（WCAG 2.2 AA 準拠・`@axe-core/playwright` 違反 `0件`）、`docs/org/gates.md:48`、`.claude/skills/craft-design-reviewer/web.md:13`、WCAG 2.2 SC 2.5.3 Label in Name（https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html）、WAI-ARIA APG Button Pattern（https://www.w3.org/WAI/ARIA/apg/patterns/button/）、NN/g 重大度3（主導線上で頻発）。直す方向：(a) 十分な可視テキストを持つ標準 `<button>`・`<a>`（`nav-mode-*`, `RUN`, `STEP`, `RESET`, `FIRE`, `診断結果をコピーする`, モジュールカード, 仮説カード等）は不要な `aria-label` で内部テキストを上書きせず、可視テキスト自体をアクセシブル名の先頭（または全体）とし、補足説明が必要な場合は可視文字の後ろに続けるか `aria-describedby` に分離する。(b) `header-sound-toggle` は6章と7章の定義を1つに統一し、`SOUND ON — 効果音` / `SOUND OFF — 効果音`（または `aria-pressed="true|false"` と整合する固定機能名＋可視文字先頭一致）にする。(c) `header-lang-ja` / `en` は `JA：表示言語を日本語に切り替える` / `JA: Switch display language to Japanese` のように可視文字 `JA`・`EN` を先頭に置く。(d) ステージ選択ボタンの可視ラベル用キーを7章に追加し、可視文字と読み上げ名の先頭を一致させる。
- **要修正**、`design/001-arcade-core.md:70, 88, 136-138, 151, 168`、(1) 3章（70行）および6章（136-138行）では上部ナビゲーションを `<nav>` 内の URL 遷移リンク `<a href="/..." aria-current="page">` として定義している一方、4章の決定表（88行、および調査 `R-31`）では WAI-ARIA APG Tabs Pattern（`role="tablist"` / `role="tab"` / `aria-selected`・矢印キー移動）を原則 URL として引いており、HTML のリンクナビゲーションと APG タブウィジェットが混同されている（実装時に `<a href>` へ `role="tab"` や `aria-current="page"` を混在させると `axe-core` の ARIA ロール違反となる）。(2) 画面2のステージ選択ボタン（151行）には `選択中は aria-pressed="true"` の指定があるが、同じ部品である画面3のステージ選択ボタン（168行 `fermi-stage-1`〜`9`）には現在選択中ステージを示す ARIA 属性（`aria-pressed="true|false"` 等）が抜けている。根拠：`.claude/skills/craft-design-reviewer/web.md:10`（カテゴリB）、WAI-ARIA APG Tabs Pattern（https://www.w3.org/WAI/ARIA/apg/patterns/tabs/）、WCAG 2.2 SC 4.1.2 Name, Role, Value（https://www.w3.org/TR/WCAG22/#name-role-value）。直す方向：上部 `<nav>` は標準リンクナビゲーション（`<nav>` ランドマーク＋`<a aria-current="page">`、WCAG 2.4.8 / APG Landmarks）に統一して決定表88行の原則記載を整合させ、`fermi-stage-1`〜`9` にも選択中を示す `aria-pressed="true|false"` を明記する。
- **要修正**、`design/001-arcade-core.md:27-30, 115-116, 158, 163, 264, 277-281`、(1) シミュレーション再生中（`RUNNING`：最大 `3.0秒`）の誤操作・二重実行予防について、画面2（115行）は「状態バッジを `RUNNING` にして二重実行を防ぐ」とのみ書きどのボタン（`RUN` / `STEP` / スロット / モジュール / ステージ選択）を非活性にするか未定義であり、画面3（116行）には `FIRE` 再生中の二重発射抑止自体が書かれていない（連打で公式試行回数 $R_1, F_2$ が二重加算されると `AC-10` の5軸スコアが不当に下がる）。(2) 画面2で `STEP 1`〜`3` の全3スロットが配置済みのときに未配置のモジュールカードを押したときの挙動（無効化して誤上書きを防ぐか、対象スロットを差し替えるか）および `STEPPING` 一時停止中にスロット／カードを変更したときの扱いが未定義である。(3) 画面2の失敗デバッグログには再試行案内キー `combinator.debug.retryHint`（264行）があるが、画面3の未達判定（`OVERKILL` / `UNDERESTIMATE`）時の `fermi-explanation-panel`（277-281行）には次の回復操作を案内する文言キーがない。根拠：`AC-3`, `AC-5`, `AC-8`, `AC-10`、Nielsen の10原則「5 エラーの予防」「9 エラーからの回復」（https://www.nngroup.com/articles/ten-usability-heuristics/）、`.claude/skills/craft-design-reviewer/SKILL.md:25, 70-73`。直す方向：`RUNNING` 中に `disabled` とする操作要素を画面2・画面3双方で明記し、画面2の3スロット満杯時および `STEPPING` 中のモジュール・スロット押下規則を1つに定め、画面3にも再試行案内文言キーを追加する。
- **要修正**、`design/001-arcade-core.md:13-21, 114-117, 142, 219, 224, 286, 298`、(1) Web の状態要件である「URL を直接開いたとき」について、定義外のパス（例：`/unknown` 等の 404 直アクセス）を開いたときの表示内容・文言キー・次の一手ボタンが未定義であり、また不正クエリ直アクセス時（`/combinator?stage=99`、`/fermi?stage=0`）について5章（115-116行）の画面2では「ステージ1を表示し案内を出す」、画面3では「ステージ1へ安全フォールバック」と表記が揺れ、7章にその案内文言キーが存在しない。(2) 5章の状態表（114-117行）や6章（142行）が7章の文言キー名を引かずに別表現で書き下しているため、7章の正式文言と不一致が起きている（114行 `STAGE 1 から試す（3-ACT COMBINATOR）` ⇔ 224行 `lobby.cta.startCombinator` `3-ACT COMBINATOR の STAGE 1 を始める`、117行の未解放案内・コピー失敗案内および142行の保存無効バナー文言 ⇔ 219, 286, 298行）。根拠：`.claude/skills/craft-design-reviewer/SKILL.md:76-78, 102`、`.claude/skills/craft-design-reviewer/web.md:11`（カテゴリE）。直す方向：未知 URL パスおよび不正 `?stage=` 直アクセス時のフォールバック表示と文言キーを画面2・3共通規則として7章に追加し、5章・6章の各状態には7章の文言キー名を明記して文言を一本化する。
- **要修正**、`design/001-arcade-core.md:77, 244, 270, 328, 336-356, 402, 413` および `design/tokens.json:183-190, 219-226, 277-287`、(1) `design/tokens.json` にある `color.border.disabled`・`color.chart.polygonFill` が仕様8章の色トークン表（336-356行）から漏れており、逆に仕様本文中の `2.5px`（チャート多角形線幅：77, 356行）と `36x36px`（ヘッダー補助ボタン最小実寸：402行）が `design/tokens.json` の `sizing` に定義されていない。また328行で「ドロップシャドウは置かない（B-2）」と決めながら413行で「ネオン `box-shadow` が無効化されても」と記述しており矛盾している。(2) 画面2の `RESET`（`AC-5`：スロット配置を維持して初期パラメータに戻す）と画面3の `RESET`（`AC-9`：3スロットの選択をすべて解除する）は異なる働きであるにもかかわらず、英語では `RESET (Restore)` / `RESET (Clear)` と区別しているのに対し日本語（244, 270行）では両方とも同一の `RESET（戻す）` になっている。根拠：`AC-5`, `AC-9`、`.claude/skills/craft-design-reviewer/SKILL.md:87-89`（カテゴリG 一貫性）、B-2・B-5。直す方向：`design/tokens.json` と仕様8章のトークン一覧を完全一致させ、413行の `box-shadow` 記述を削除して枠線トークン表現に統一し、日本語の `RESET` ボタン文言も働きに合わせて区別する（例：`RESET（初期値に戻す）` と `RESET（選択をクリア）`）。
- **提案**、`design/001-arcade-core-research.md:60-66`、4章「手本（別カテゴリー）」の Monkeytype・Wordle はテンプレート項目（「名前と選んだ理由」「取り入れる考え方」）を満たし8章 `R-15`・`R-16` で任意広告や標準緑黄配色の色覚課題にも触れているが、4章本文にも手本の「悪い点（取り入れない点：例・Monkeytype の任意広告枠や Wordle の1日1問制限は採らない等）」を1行添えると、採点表の表現とも誤解なく一致する。根拠：`.claude/skills/craft-design-reviewer/SKILL.md:55`。

## 採点表
| カテゴリ | 点（0〜2） | ★ごとの結果 | 証拠 |
|---|---|---|---|
| **A 根拠** | **2 / 2** | ・★ 調査が先：**満たす**<br>・★ 決定表の全行に実在する R-n と原則（WCAG / APG URL か B-n）：**満たす**<br>・★ 意味のある狙い（ターゲット仮説と R-n、性格語3〜5語と意味しないこと・仕様8章の画面要素、差をつける点1〜2個と画面、方向性2案と不採用理由）：**満たす** | ・`git log --diff-filter=A` で調査コミット `9259081`（`2026-11-12 00:55:47`）が仕様コミット `9149ca1`（`2026-11-12 01:18:33`）より古いことを確認。<br>・`design/001-arcade-core-research.md:115-150` に `R-1`〜`R-34` の計 `34件`（`>= 5`）、URL・確認日欠落 `0件`、全34 URL が HTTP 200 で疎通確認済み。直接競合4件（46-58行）に良い点・悪い点3つと URL、別カテゴリー手本2件（60-66行）あり。<br>・`design/001-arcade-core.md:85-106` 全20行すべてに調査に実在する `R-n`（未定義 `0件`）と WCAG / APG URL または `B-1`〜`B-6` あり。<br>・`design/001-arcade-core-research.md:24-40, 68-103` および `design/001-arcade-core.md:362-373` に仮説明記・性格語4語（意味しないこと＋画面要素）・差をつける点2個・2案比較と不採用理由を確認。 |
| **B HTML の標準と部品集** | **1 / 2** | ・★ 標準要素か ADR の部品集で作れる所はそれを使う：**満たす**<br>・★ 外れる所は逸脱の表に「場所、本来の要素か部品、理由、APG の型（アクセシビリティ対応）」がある：**満たす** | ・`design/001-arcade-core.md:70-77` で全操作要素に `<header>`, `<nav>`, `<main>`, `<fieldset>`, `<legend>`, `<button>`, `<a>`, `<dl>`, `<label>`, `<textarea>` を使用し、ホバー専用操作 `0件`（404行）。<br>・逸脱3箇所（画面2 `<canvas>`、画面3 `<canvas>`、画面4 `<svg>`：75-77行）すべてに場所・本来の標準要素・理由・`role="img"`＋外部 `<button>`＋`role="status"`（APG Alert）ミラーリング対応を記載。<br>・減点理由（要修正）：上部 `<nav><a aria-current="page">` に対し決定表88行が APG `tabs/` を引いている不整合、および画面3ステージ選択ボタン（168行）の選択状態 ARIA 属性漏れ。 |
| **C バウハウス（形は働きに従う）** | **2 / 2** | ・★ B-1、B-2（全画面に仕事1文と主操作1つ、主操作が最も目立ち、全要素が仕事か AC に結びつき、役目のない飾りがない）：**満たす** | ・`design/001-arcade-core.md:70-77` および `design/001-arcade-core/wireframes.md:34-174` で全4画面に仕事1文と唯一のプライマリ塗り主操作1つ（`color.action.primary`）を確認。グラデーション `0件`・絵文字アイコン `0件`。<br>・単一サンセリフ書体（`tabular-nums` 併用）・文字4段階・細字不使用（`design/tokens.json:230-264`）、アクセント1色＋意味色4色（`90-173` 行）、余白6段階（`4,8,12,16,24,32px`）と縦整列線 `L0`/`L1`/`R0`（`wireframes.md:5, 13, 65`）を確認。 |
| **D 使いやすさ** | **1 / 2** | （★項目なし） | ・取り消せない破壊的操作は存在せず、`RESET` は可逆（`design/001-arcade-core.md:124`）。エラーバウンダリ・デバッグログ・クリップボード失敗文言に「何が起きたか」と「どう直すか」を確認。<br>・減点理由（要修正）：Nielsen 5・9 の観点で、`RUNNING` 再生中の非活性化対象ボタン未定義（特に画面3の二重 `FIRE` 防止欠落）、画面2の3スロット満杯時・`STEPPING` 時のモジュール押下挙動未定義、および画面3失敗時の再試行案内文言キー欠落。 |
| **E 状態** | **1 / 2** | ・★ 全画面に7つの状態があり、該当しないときは「なし」と理由がある：**満たす** | ・`design/001-arcade-core.md:112-117` で全4画面×7状態すべて埋まり、ログイン未済・セッション切れも「なし（認証不要）」と理由明記。長い文字・0件・大量件数の表示も `121-123` 行に定義済み。<br>・減点理由（要修正）：Web 追加要件の未知 URL 直アクセス（404）時の表示・文言キー未定義、不正 `?stage=` 直アクセス時の案内文言キー欠落、および5章状態表が7章の文言キー名を引かず別文言になっている不整合。 |
| **F アクセシビリティ** | **2 / 2** | ・★ コントラスト（通常文字 >= 4.5:1、大文字・UI枠・図形 >= 3.0:1、ライト・ダーク・高コントラスト）：**満たす**<br>・★ 押せる範囲 24×24px 以上（スマホ幅 44px 目安）：**満たす**<br>・★ アイコンだけの操作に読み上げの名前：**満たす** | ・`design/tokens.json` から全36組＋横断11組＋半透明 `polygonFill` アルファ合成8組を Python で再計算し、全モードで基準適合を確認（通常文字最小 `5.64:1` >= `4.5:1`、UI枠・チャート線最小 `3.47:1` >= `3.0:1`）。<br>・`design/001-arcade-core.md:402`・`tokens.json:279-280` で全操作要素 `>= 24x24px`（補助 `>= 36x36px`、スマホ主操作・スロット・カード高さ `>= 44px`・間隔 `>= 8px`）。<br>・アイコン単独ボタン `0件`（全アイコン `aria-hidden="true"`＋文字併記：`360, 410` 行）。色以外の記号・枠線併用（`404-410` 行）、`320px`・`200%` リフロー（`398-401` 行）、キーボード順序・`2px` フォーカス枠（`>= 7.24:1`：`417-418` 行）、`prefers-reduced-motion` 対応（`412` 行）を確認。 |
| **G 一貫性** | **1 / 2** | （★項目なし） | ・本文中に HEX 色直書きはなくトークン参照で構成。<br>・減点理由（要修正）：`tokens.json` の `color.border.disabled`・`color.chart.polygonFill` が仕様8章の表から漏れ、仕様の `2.5px`・`36x36px` が `tokens.json` に未定義、328行のシャドウ禁止と413行の `box-shadow` 記述が矛盾、および異なる働きをする画面2・画面3の `RESET` ボタンに同じ日本語名 `RESET（戻す）` を付けている点。 |
| **H 文言** | **0 / 2** | （★項目なし。ただし WCAG 2.5.3 レベルA の重大違反あり） | ・UI 辞書100キーの日英対訳完備（空文字・重複 `0件`）、英語が2倍超となる25キーに対する折り返し・疑似言語検証方針（`121, 420-421` 行）、全4画面の日英ページ `<title>`（`17-20, 204-207` 行）を確認。<br>・0点理由（重大）：`header-sound-toggle` の6章・7章二重定義と可視文字 `SOUND ON/OFF` 脱落、`header-lang-ja/en` の可視文字 `JA/EN` 脱落、`RUN`/`STEP`/`RESET`/`FIRE`/`診断結果をコピーする`/ナビ/カード等の `aria-label` 上書きによる WCAG 2.5.3 Label in Name（レベルA）違反および先頭不一致、ならびにステージ選択ボタンの可視ラベルキー欠落。 |

- **合計点**：**10 / 16 点**（A:2, B:1, C:2, D:1, E:1, F:2, G:1, H:0）
- **合否の線を満たすか**：**満たさない（FAIL）** — すべての★項目は満たしているものの、カテゴリ H に重大な指摘（0点カテゴリ）が1件あり、合計点も 10/16 点で合格ライン（0点カテゴリなし・13点以上・重大指摘0件）に届かないため。

## 証拠
- 対象：`main...HEAD`（`371348a...9149ca1`、G1 デザイン追加コミット `7835cd1...9149ca1`、ブランチ `feat/001-arcade-core`）、観点：G1 Web デザイン調査・仕様・トークン・ワイヤーフレームの原則適合性とアクセシビリティ検証
  - `git diff --name-only main...HEAD` の一覧と読んだ印：
    - [x] `design/001-arcade-core-research.md`（全165行読了）
    - [x] `design/001-arcade-core.md`（全482行読了）
    - [x] `design/001-arcade-core/wireframes.md`（全174行読了）
    - [x] `design/tokens.json`（全306行読了）
    - [x] `docs/approvals/001-arcade-core-G0.md`（全16行読了）
    - [x] `docs/prd/001-arcade-core.md`（全356行読了）
    - [x] `docs/prd/product.md`（全59行読了）
    - [ ] `docs/progress.md`（進捗記録のため対象外、SessionStart で確認）
    - [ ] `docs/reviews/001-arcade-core-G0-tech-lead-r1.md`（G0 履歴）
    - [ ] `docs/reviews/001-arcade-core-G0-tech-lead-r2.md`（G0 履歴）
    - [x] `docs/reviews/001-arcade-core-G0-verifier-r1.md`（参照確認）
    - [x] `docs/reviews/001-arcade-core-G0-verifier-r2.md`（全54行読了・テストつなぎ口照合）

- 観点の表：

### 1. 1周目：受け入れ条件（AC-1〜AC-20）の画面・操作追跡表
| AC | たどれた / たどれない | 画面と操作・要素の場所（`design/001-arcade-core.md`） | 備考 |
|---|---|---|---|
| AC-1 | たどれた | 画面1 `/`（`lobby-mode-combinator/fermi/diagnostic`）＋共通ヘッダー（`nav-mode-*`）：24, 45, 74, 136-148行 | 登録なし・`1.0秒以内`・迷路/未実装ボタン `0件` |
| AC-2 | たどれた | 画面2 `/combinator`（`combinator-stage-1`〜`10`, `combinator-module-card-1`〜`7` 4属性, `combinator-target-condition`, `combinator-overheat-limit`）：46, 151-153, 163-164行 | ステージボタン可視文言キーのみ7章へ追加要（重大1） |
| AC-3 | たどれた | 画面2 `/combinator`（`combinator-slot-1`〜`3` → `combinator-run-button` → `combinator-simulation-canvas`, `combinator-result-status`=`STAGE CLEAR`, `combinator-score-value`）：47, 155-160行 | `RUNNING` 中の二重押下抑止対象の明記要（要修正2） |
| AC-4 | たどれた | 画面2 `/combinator?stage=1..10`（全10ステージ順列実行＋ソルバー検証契約）：48行 | |
| AC-5 | たどれた | 画面2 `/combinator`（`combinator-step-button` → `STEPPING` 一時停止 → `combinator-reset-button` `0.2秒以内` スロット維持復帰）：49, 156, 161-162, 252行 | |
| AC-6 | たどれた | 画面2 `/combinator`（`CRASHED`［`STEP 1`〜`3`］/ `FAILED`［`FINAL CHECK`］＋`combinator-debug-log` 3項目）：50, 156, 165, 255-263行 | |
| AC-7 | たどれた | 画面3 `/fermi`（`fermi-stage-1`〜`9`, `fermi-slot-act-1`〜`3`, `fermi-card-act{s}-{c}`, 自由数値入力 `0件`）：51, 168, 172-173行 | `fermi-stage-*` の選択中 ARIA 属性追記要（要修正1） |
| AC-8 | たどれた | 画面3 `/fermi`（`fermi-fire-button` → `fermi-simulation-canvas` `3.0秒以内` → `fermi-result-status` 4段階判定＋`data-cleared`）：52, 170-171, 175, 273-276行 | |
| AC-9 | たどれた | 画面3 `/fermi`（`fermi-explanation-panel` 3項目確認 → `fermi-reset-button` `0.2秒以内` 全3スロット未選択初期化）：53, 176-177, 277-281行 | `RESET` 日本語名の区別要（要修正4） |
| AC-10 | たどれた | 画面4 `/diagnostic`（5軸整数スコア `diagnostic-axis-*-score`, `diagnostic-radar-chart`, `diagnostic-overall-rank` `S+`〜`C`, 活性 `diagnostic-copy-button`）：54, 180-183, 187行 | |
| AC-11 | たどれた | 画面4 `/diagnostic`（`diagnostic-copy-button` → Clipboard 書き込み＋`diagnostic-copy-toast` `2.0秒以上`）：55, 187-188, 296-297, 301行 | |
| AC-12 | たどれた | 画面4 `/diagnostic`（`UNRANKED`, `diagnostic-copy-button` `disabled`, 未クリア軸 `0`, `diagnostic-start-combinator/fermi-button`）：56, 117, 184-187, 283-288行 | 履歴0件・失敗のみ・片側のみクリアの3分岐すべて対応 |
| AC-13 | たどれた | 画面2・画面3（未充足時 `RUN`/`STEP`/`FIRE` が `disabled`＋`combinator-slot-guidance` / `fermi-slot-guidance` 表示）：57, 159-161, 174-175, 241, 268行 | |
| AC-14 | たどれた | 全4画面（初期バンドル内蔵による `offline` 完走＋`localStorage` 復元）：58, 114-117行 | |
| AC-15 | たどれた | 共通ヘッダー `header-sound-toggle`（初回 `SOUND ON`・自動発音 `0回`・外部音声通信 `0件`・`SOUND OFF` ゲイン `0` 永続化）：59, 139, 213-216行 | 6章・7章ラベル統一と WCAG 2.5.3 対応要（重大1） |
| AC-16 | たどれた | 共通ヘッダー直下 `storage-fallback-banner`（`localStorage` 例外時のインメモリ退避＋通知1件、破損 JSON 破棄初期化）：60, 114-117, 142, 219行 | |
| AC-17 | たどれた | 画面2・画面3（`prefers-reduced-motion: reduce` 時シェイク `0px`・再生 `0.45秒 <= 1.0秒`）：61, 330, 412行、`tokens.json:297-298, 303` | |
| AC-18 | たどれた | 全4画面（`320px`/`1280px` × `100%`/`200%` で横はみ出し `0px`、全操作要素 `>= 24x24px`、重なり `0件`）：62, 398-402行、`wireframes.md` | |
| AC-19 | たどれた | 画面3 `/fermi?stage=1..9`（全9ステージ正解組・罠カード存在保証）：63, 173, 177行 | |
| AC-20 | たどれた | 画面4 `/diagnostic`（Clipboard 例外時に `diagnostic-copy-error`＋`diagnostic-manual-copy-textarea`＋`diagnostic-select-all-button`）：64, 189-190, 298-301行 | |

### 2. 2周目：全4画面の Nielsen 10原則（必須の「5 エラーの予防」「9 エラーからの回復」を含む）検証表
| 画面 | Nielsen 5（エラーの予防） | Nielsen 9（エラーからの回復） | 他の原則で気になった点 |
|---|---|---|---|
| **画面1：モード選択**（`/`） | 登録入力や未実装ダミー導線を `0件` にし、`localStorage` 無効時は操作前に退避通知バナーで揮発保存を知らせて誤認を防いでいる（良好）。 | 描画例外時に何が起きたかと `ページを再読み込みする` ボタン（`error.boundary.*`）を出し、未知 URL 直アクセス時の案内追加のみ要修正（要修正3）。 | 進捗に応じた推奨主操作1つ（#1 状態可視性・#8 最小限デザイン）が明快。 |
| **画面2：モード1**（`/combinator`） | スロット未充足時に `RUN`・`STEP` を `disabled` にし不足スロット名を明示する一方、`RUNNING` 中の非活性対象と3スロット満杯時の未配置モジュール押下挙動が未定義（要修正2）。 | `CRASHED` / `FAILED` 時に発生ステップ・原因種別・期待値 vs 実測値の3項目と再試行案内（`combinator.debug.retryHint`）＋`RESET` を即座に表示している（良好）。 | `RESET` の日本語ラベルが画面3の選択全解除と同じ `RESET（戻す）` になっており #4 一貫性の観点で区別が必要（要修正4）。 |
| **画面3：モード2**（`/fermi`） | 自由数値入力を廃し3〜4枚の仮説カード選択と未充足時 `FIRE` `disabled` で入力ミスを防ぐ一方、`FIRE` 再生中（`RUNNING`）の二重発射抑止の明記が抜けている（要修正2）。 | `OVERKILL` / `UNDERESTIMATE` 時に数値比較・基準式・罠カード理由を開示するが、次の回復操作を示す再試行案内文言キーが7章にない（要修正2）。 | ステージ選択ボタン `fermi-stage-1`〜`9` に選択中 ARIA 属性の明記が必要（要修正1）。 |
| **画面4：診断カルテ**（`/diagnostic`） | 未解放（`UNRANKED`）時はコピーボタンを `disabled` にして不完全な共有を防ぎ、未クリア側モードの STAGE 1 開始ボタンへ直接誘導している（良好）。 | Clipboard 権限拒否・例外時に原因説明（`diagnostic.copy.errorFallback`）と手動コピー用 `<textarea readonly>`＋全選択ボタンを即展開している（良好）。 | 5軸 `<dl>` と `<svg>` の二重表現により視覚・支援技術双方で情報欠損がない。 |

### 3. `verifier` G0 r2 要求 DOM 識別子（`data-testid`）網羅確認
- `docs/reviews/001-arcade-core-G0-verifier-r2.md:28-32` で要求された全識別子（共通シェル：3モード導線・`header-sound-toggle`［`aria-pressed` / `data-sound-state`］・`header-lang-ja/en`、モード1：`combinator-stage-1..10`［`data-cleared`］・モジュール4属性・条件/上限・3スロット・`RUN`/`STEP`/`RESET`・未配置案内・Canvas・状態・スコア・デバッグログ3項目、モード2：`fermi-stage-1..9`［`data-cleared`］・3スロット・仮説カード・`FIRE`/`RESET`・未選択案内・Canvas・4段階判定・解説3項目、診断カルテ：5軸スコア・5角形チャート・総合ランク・コピーボタン・完了通知・`AC-20` 失敗通知と手動コピーテキスト領域・`AC-12` 開始ボタン・`AC-16` 保存無効通知）が `design/001-arcade-core.md:134-190` に **漏れなく全件定義されている** ことを確認した。

- 読んだファイル：
  - `.claude/agents/design-reviewer.md`
  - `.claude/skills/craft-design-reviewer/SKILL.md`
  - `.claude/skills/craft-design-reviewer/web.md`
  - `.claude/skills/craft-designer/SKILL.md`
  - `.claude/skills/craft-designer/web.md`
  - `.claude/org/app.json`
  - `CLAUDE.md`
  - `docs/org/gates.md`
  - `docs/templates/review-report.md`
  - `docs/templates/design-research.md`
  - `docs/templates/design-spec.md`
  - `docs/prd/product.md`
  - `docs/prd/001-arcade-core.md`
  - `docs/approvals/001-arcade-core-G0.md`
  - `docs/reviews/001-arcade-core-G0-verifier-r1.md`
  - `docs/reviews/001-arcade-core-G0-verifier-r2.md`
  - `design/001-arcade-core-research.md`
  - `design/001-arcade-core.md`
  - `design/001-arcade-core/wireframes.md`
  - `design/tokens.json`

- 実行したコマンドと結果：
  1. **調査が仕様より先のコミットにあることの確認**：
     `git log --diff-filter=A --format='%h %ci %s' -- design/001-arcade-core-research.md design/001-arcade-core.md`
     → 出力：
     `9149ca1 2026-11-12 01:18:33 +0900 001-arcade-core デザイン仕様（designer）`
     `9259081 2026-11-12 00:55:47 +0900 001-arcade-core デザイン調査（designer）`
     （調査 `9259081` が仕様 `9149ca1` より前のコミットであることを確認）
  2. **R の件数・URL と確認日の欠落・未定義 R-n 参照の検査**：
     - `grep -cE '^\| R-[0-9]+' design/001-arcade-core-research.md` → `34`（5件以上）
     - `grep -E '^\| R-[0-9]+' design/001-arcade-core-research.md | grep -cvE 'https?://.*[0-9]{4}-[0-9]{2}-[0-9]{2}'` → `0`（URL・確認日欠落なし）
     - `comm -23 <(grep -oh 'R-[0-9]\+' design/001-arcade-core.md | sort -u) <(grep -oh 'R-[0-9]\+' design/001-arcade-core-research.md | sort -u) | wc -l` → `0`（調査にない R-n 参照なし）
  3. **直書き HEX・独自部品・グラデーション・シャドウ・絵文字の検査**：
     - `grep -nE '#[0-9A-Fa-f]{6}|独自|カスタム|[Cc]ustom|glassEffect|[Gg]radient|shadow' design/001-arcade-core.md` → HEX 値は8章トークン定義表（338-356行）のみ。413行に `box-shadow` の記述1件を検出し「要修正」に計上。
     - Python による絵文字コードポイント（`> U+1F000`）検査 → `design/001-arcade-core.md`・`wireframes.md` ともに `set()`（`0件`）。
  4. **コントラスト比の独立再計算（`design/tokens.json` から WCAG 2.2 相対輝度式で全組計算）**：
     - `python3 -c` で仕様記載の全36組（ライト・ダーク・ライト高コントラスト・ダーク高コントラストの計144通り）を再計算 → **基準未達 `0件`**。
  5. **決定表20行・文言辞書100キー・トークン整合の機械検査（`python3 -c`）**：
     - 決定表20行：全行に `R-n` と WCAG / APG URL または `B-1`〜`B-6` あり（HIG URL 混入 `0件`）。
     - 7章 UI 文言辞書：`100キー`、重複 `0件`、`ja`/`en` 空欄 `0件`、`len(en) > 2 * len(ja)` 該当 `25キー`（9章の折り返し・疑似言語対象に含まれることを確認）。
     - `tokens.json` 対仕様8章比較：仕様表未掲載トークン2件（`color.border.disabled`, `color.chart.polygonFill`）を検出。
  6. **全34 R 出典 URL の HTTP 疎通・競合ページ本文引用照合（`python3 urllib.request`）**：
     - `R-1`〜`R-34` の全34 URL すべて HTTP `200`（エラー `0件`）。

- 開いた URL と確認した日付：
  - `https://brilliant.org/premium/`（2026-11-12、HTTP 200 → `https://brilliant.org/subscribe/`）
  - `https://www.codingame.com/start/`（2026-11-12、HTTP 200、引用一致確認）
  - `https://tomorrowcorporation.com/humanresourcemachine`（2026-11-12、HTTP 200、引用一致確認）
  - `https://www.quantable.io/pricing`（2026-11-12、HTTP 200、引用一致確認）
  - `https://www.quantable.io/games/fermiestimation`（2026-11-12、HTTP 200、引用一致確認）
  - `https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html`（2026-11-12、HTTP 200、WCAG 2.5.3 基準確認）
  - `https://www.w3.org/WAI/ARIA/apg/patterns/tabs/`（2026-11-12、HTTP 200）
  - `https://www.w3.org/WAI/ARIA/apg/patterns/button/`（2026-11-12、HTTP 200）
  - `https://www.nngroup.com/articles/ten-usability-heuristics/`（2026-11-12、HTTP 200）
  - （ほか `R-1`〜`R-34` の全34 URL すべて 2026-11-12 に HTTP 200 疎通確認済み）

- 未検証：なし

## 記録
- 関門：G1
- 判定した役：design-reviewer
- 回：r1
- 対象：`design/001-arcade-core-research.md`, `design/001-arcade-core.md`, `design/001-arcade-core/wireframes.md`, `design/tokens.json`（ブランチ `feat/001-arcade-core`、`371348a...9149ca1`）
- 日付：2026-11-12
