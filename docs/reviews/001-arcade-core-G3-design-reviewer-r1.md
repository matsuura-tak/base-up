PASS

## 指摘
- **要修正**、`web/src/components/CombinatorScreen.tsx:215-228`、`design/001-arcade-core.md:171, 217-345`、およびスクリーンショット `docs/verification/001-arcade-core/evidence/combinator_normal_light.png`・`docs/verification/001-arcade-core/evidence/combinator_normal_en.png`・`docs/verification/001-arcade-core/evidence/AC6_CRASHED.png`、画面2『3-ACT COMBINATOR』のキャンバス直上にある現在パラメータ3計器（残エネルギー `10` → `-1`、現在出力 `0 / 24`、現在発熱 `0 / 12`）の `<dt>` 見出しに、モジュールカード用の差分属性キー `combinator.attr.cost`（`エネルギーコスト` / `Energy Cost`）・`combinator.attr.effect`（`基本性能` / `Effect`）・`combinator.attr.sideEffect`（`副作用` / `Side Effect`）が流用されている。そのため未配置の待機状態でも残量 `10` が「エネルギーコスト `10`」、エネルギー枯渇クラッシュ時（`AC6_CRASHED.png`）も残量 `-1` が「エネルギーコスト `-1`」と表示され、「現在の残りリソース・累積値」と「1手あたりの消費コスト・増減量」の意味が反転している（直上の `初期値 E:10 / OUT:0 / HEAT:0` およびキャンバス内の `OUT`・`HEAT` 表記から自力で推測できるため進行不能にはならない）。根拠：`AC-2`, `AC-3`, `AC-6`、`design/001-arcade-core/wireframes.md:76`（`[ ENERGY: 10 ] [ OUTPUT: 0 / 24 ] [ HEAT: 0 / 12 ]`）、Nielsen の10原則「2 システムと現実世界の一致」「6 記憶よりも再認」（https://www.nngroup.com/articles/ten-usability-heuristics/）、`.claude/skills/craft-design-reviewer/SKILL.md:91-94`（カテゴリ H 文言）、NN/g 重大度2（引っかかるが自力で抜けられる）。直す方向：`design/001-arcade-core.md` 7章および `web/src/i18n/dictionary.ts` にライブ計器専用の `<dt>` キー（例：`残りエネルギー (ENERGY)` / `Energy`、`現在出力 (OUTPUT)` / `Output`、`現在発熱 (HEAT)` / `Heat`）を追加し、モジュールデッキ側の属性名（`エネルギーコスト` 等）と区別する。
- **提案**、`web/src/styles/app.css:285-307, 394-403`、`web/src/components/DiagnosticScreen.tsx:168`、`web/src/components/ErrorBoundary.tsx:35`、およびスクリーンショット `docs/verification/001-arcade-core/evidence/AC12_UNRANKED.png`・`docs/verification/001-arcade-core/evidence/diagnostic_unranked_partial_light.png`、`app.css` 内で `.status-box-warning` / `.status-box-danger`（285-307行）より後に `.panel-card`（394-403行）が宣言されているため、`className="panel-card status-box-warning"`（`diagnostic-unranked-notice`）および `className="panel-card status-box-danger"`（`ErrorBoundary`）で背景色と枠線が通常パネル色（`--color-surface-panel` / `--color-border-default`）に上書きされ、文字色のみが意味色になっている（左ペインの `⚠ 総合認定ランク：UNRANKED` ボックスには警告枠・警告背景が出ており、文字コントラストもライト `6.80:1`・ダーク `10.63:1` で WCAG AA を満たすため機能上の支障はない）。根拠：`AC-12`、`design/001-arcade-core.md:371-395`（B-5 色の役割の一貫性）、NN/g 重大度1（見た目のみ）。直す方向：`app.css` で `.status-box-*` の宣言順を `.panel-card` の後ろへ移し、意図どおり警告・危険の薄い背景色と枠線トークンが当たるようにする。
- **提案**、`web/src/styles/app.css:624, 992, 1019` およびスクリーンショット `docs/verification/001-arcade-core/evidence/combinator_normal_zoom200.png`、ブラウザのページズーム `200%`（`1280px` → 実質 `640px` CSS px）では `@media (min-width: 80rem)` が解除されて仕様（`design/001-arcade-core.md:455`）どおり1カラム縦積みになる一方、CSS ルート文字サイズのみを `html { font-size: 200% }` に拡大した `1280px` 条件（`combinator_normal_zoom200.png`）では CSS Values and Units 仕様により `@media` 内の `rem` が初期 `16px` 基準で評価されるため2ペイン＋横3スロットが維持され、各スロットボタン内が1行5文字前後で細かく折り返している（横はみ出し `0px`・文字切れ `0件`・最小押下サイズ `>= 24x24px` はすべて満たしている）。根拠：`AC-18`、`R-21`, `R-22`、WCAG 2.2 SC 1.4.4 Resize Text（https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html）、NN/g 重大度1（見た目のみ）。直す方向：将来的に `.slots-row` 等へ `repeat(auto-fit, minmax(min(100%, 11rem), 1fr))` または CSS Container Queries を併用すると、文字サイズ単独 `200%` 拡大時にもよりゆったり1カラムへ折り返せる。

## 採点表
| カテゴリ | 点（0〜2） | ★ごとの結果 | 証拠 |
|---|---|---|---|
| **A 根拠** | **2 / 2** | ・★ 調査が先（`R-n` >= 5、全件 URL・確認日あり、競合2〜4件＋別カテゴリー手本に良い点・悪い点）：**満たす**<br>・★ 決定表の全行に実在する `R-n` と原則（WCAG / APG URL か `B-n`）：**満たす**<br>・★ 意味のある狙い（ターゲット仮説と `R-n`、性格語3〜5語と意味しないこと・画面要素、差をつける点1〜2個と画面、2案比較と不採用理由）が実画面に表れている：**満たす** | ・`git log --diff-filter=A` で調査 `9259081`（`2026-11-12 00:55:47 +0900`）が仕様 `9149ca1`（`2026-11-12 01:18:33 +0900`）より先行していることを確認。<br>・`design/001-arcade-core-research.md:119-154` に `R-1`〜`R-34`（計 `34件` >= 5）、URL・日付欠落 `0件`、仕様内未定義 `R-n` `0件`。直接競合4件（46-58行）・別カテゴリー手本2件（60-68行）すべてに良い点・悪い点と URL あり。<br>・`design/001-arcade-core.md:96-123` 全26行に `R-n` と WCAG 2.2 / WAI-ARIA APG URL または `B-1`〜`B-6` あり。<br>・実画面（`lobby_normal_light.png`, `combinator_normal_dark.png`, `fermi_perfect_order_light.png`, `diagnostic_normal_light.png`）で性格語4語（明快な・手応えのある・知的な・計器のような）と差をつける点2点（迷路を排したベクター計器シミュレーション、両モード横断5軸レーダーチャート＋認定ランク共有）が一貫して表現されていることを確認。 |
| **B HTML の標準と部品集** | **2 / 2** | ・★ 標準要素か ADR の部品集で作れる所はそれを使う：**満たす**<br>・★ 外れる所は逸脱の表に「場所、本来の要素か部品、理由、APG の型（アクセシビリティ対応）」があり、実装と一致する：**満たす** | ・`HeaderShell.tsx:30-115`・`App.tsx:1330-1404`・各画面コンポーネントで `<header>`, `<nav aria-label>`, `<main id="main-content" tabIndex={-1}>`, `<footer>`, `<a href aria-current="page">`, `<button type="button" aria-pressed>`, `<fieldset>`+`<legend>`, `<dl>`, `<label>`+`<textarea readOnly>` を使用。ホバー専用操作 `0件`。<br>・標準から外れる2部品（`SimulationCanvas.tsx:397-404` `<canvas role="img" aria-label>`、`RadarChartSvg.tsx:86-98` `<svg role="img" aria-labelledby>`）は `design/001-arcade-core.md:86-88` の逸脱表どおり内部に押下要素を一切持たず、直下の標準 DOM（`<dl>`, `role="status"`, `role="alert"`）へ全数値・判定・デバッグログを完全ミラー出力していることを実装とスクリーンショットで確認。<br>・画面ごとの固有 URL（`/`, `/combinator`, `/fermi`, `/diagnostic`, 未定義 URL）と日英 `<title>`、`popstate` 戻る・進む、リロード復元がすべて動作（`verification.md` AC-1〜AC-4, AC-14）。 |
| **C バウハウス（形は働きに従う）** | **2 / 2** | ・★ B-1、B-2（全画面に仕事1文と主操作1つがあり、主操作がいちばん目立ち、スクリーンショットの第一印象が仕様の仕事・主操作と一致し、役目のない飾りがない）：**満たす** | ・全4画面のスクリーンショット（`lobby_normal_light.png`, `combinator_normal_light.png`, `fermi_normal_light.png`, `diagnostic_normal_light.png` / `AC12_UNRANKED.png`）で `color.action.primary` の塗りつぶし主ボタンが厳密に1画面1つに絞られ、第一印象が仕様3章（`design/001-arcade-core.md:85-88`）の仕事・主操作と100%一致。<br>・`grep -rnE 'gradient|box-shadow' web/src/` 出力 `0件`、絵文字アイコン `0件`（すべて `Icons.tsx` の単色インライン SVG ベクター記号）。<br>・単一システムサンセリフ書体＋数値 `tabular-nums`・文字サイズ4段階（`0.875rem`〜`1.75rem`）・余白6段階（`4, 8, 12, 16, 24, 32px`）・アクセント1色＋意味色3色の規律が全44枚で崩れていないことを確認。 |
| **D 使いやすさ** | **2 / 2** | （★項目なし） | ・全4画面で Nielsen 10原則を検証し重大違反 `0件`。<br>・エラー予防（#5）：スロット未充足時の `RUN` / `STEP` / `FIRE` `disabled`＋不足スロット案内（`combinator_empty_light.png`, `fermi_empty_light.png`）、3スロット満杯時の未配置モジュールカード `disabled`（`combinator_normal_light.png`）、`RUNNING` 再生中の全操作ボタン `disabled` による二重実行防止（`combinator_running_light.png`, `fermi_running_light.png`）、未解放時のコピー `disabled`（`AC12_UNRANKED.png`）をすべて目視・コードで確認。<br>・エラーからの回復（#9）：`AC6_CRASHED.png`・`AC6_FAILED.png`・`AC9_解説表示.png`・`fermi_underestimate_light.png`・`AC16_ストレージ退避バナー.png`・`AC20_手動コピー展開.png`・`combinator_stage_fallback_light.png`・`not_found_404_light.png` の全状態で「何が起きたか」と「次に押すべき回復手段」が明示されていることを確認。 |
| **E 状態** | **2 / 2** | ・★ 全画面に7つの状態＋URL直開き（通常5通り：ライト・ダーク・200%・英語・スマホ幅 `320px` を含む全「画面×状態」）のスクリーンショットが揃い、仕様と一致する：**満たす** | ・`docs/verification/001-arcade-core/evidence/` の全44枚のスクリーンショットを1枚ずつ開いて目視確認：通常状態5通り×4画面＝20枚（`{lobby,combinator,fermi,diagnostic}_normal_{light,dark,zoom200,en,mobile}.png`）＋状態別24枚（空・片方クリア・未配置・`STEPPING`・`RUNNING`・`STAGE CLEAR`・`CRASHED`・`FAILED`・`PERFECT ORDER`・`GOOD RANGE`・`OVERKILL`・`UNDERESTIMATE`・`?stage=99` 補正2種・`UNRANKED` 3種・コピー完了通知・手動コピー展開・ストレージ退避バナー・オフライン完走・404）すべて欠落 `0件`。<br>・認証不要アプリのためログイン切れは「なし（認証不要）」で仕様5章（`design/001-arcade-core.md:131-138`）と整合。 |
| **F アクセシビリティ** | **2 / 2** | ・★ コントラスト（通常文字 >= 4.5:1、大文字・UI枠・図形 >= 3.0:1、ライト・ダーク・高コントラスト／強制カラー）：**満たす**<br>・★ 押せる範囲 24×24px 以上（スマホ幅 44px 目安）：**満たす**<br>・★ アイコンだけの操作に読み上げの名前がある（＋G3：全画面・全状態 axe 違反 `0件`、キーボード完走、`200%`・`320px` 破綻なし）：**満たす** | ・`design/tokens.json` と `web/src/styles/tokens.css` の全152組（38ペア×4モード）＋横断配色を `python3 -c` で独立再計算し違反 `0件`（通常文字最小 `5.68:1` >= `4.5:1`、UI枠・フォーカス・チャート線最小 `4.55:1` >= `3.0:1`、`forced-colors: active` システム色対応確認）。<br>・全操作要素に `min-height: 2.75rem`（`44px`）・`min-width: 44px`（`app.css`）、Playwright `AC-18` 実測で4表示条件すべて `>= 24x24px`・重なり `0件`。<br>・アイコン単独ボタン `0件`（全 SVG に `aria-hidden="true"`＋可視文字併記）。色以外の記号（`✓` / `◇` / `⚠` / `✕`）・下線・破線を全状態で併用。<br>・`axe-full-audit.json`（全44状態、`wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`）で `totalViolations: 0`、`lighthouse-audit.log` 全4ルート Accessibility `100`。<br>・キーボード単独完走テスト合格・`2px` フォーカス枠可視（`outline: none` `0件`）、`200%`・`320px` 横スクロール `0px`、`prefers-reduced-motion: reduce` 時のシェイク `0px`・`1.0秒以内` 完了（`AC-17`）を確認。 |
| **G 一貫性** | **2 / 2** | （★項目なし。G3 コード直書き検査・ダークモード切替を含む） | ・`grep -rnE 'outline:\s*(none\|0)\|#[0-9A-Fa-f]{3,8}\b' web/src/` により、`tokens.css` 以外の全 CSS / TSX / TS ファイルに `#HEX` 直書き `0件`・フォーカス消去 `0件` を確認（Canvas も `getComputedStyle` で CSS トークンを解決）。`tokens.json` と `tokens.css` の全25色×5モード不一致 `0件`。<br>・ダークモード4画面（`*_normal_dark.png`）すべてで背景・枠線・シアンプライマリボタン（`#22D3EE` / 文字 `#06131F` = `10.89:1`）・Canvas・SVG チャートが破綻なく切り替わっていることを目視確認。<br>・働きが異なる画面2（`RESET（初期値に戻す）`）と画面3（`RESET（選択をクリア）`）のボタン名も日英とも一貫して区別されている。 |
| **H 文言** | **1 / 2** | （★項目なし。WCAG 2.5.3 先頭一致・固有ページ `<title>`・誇張なし・動詞ラベルを含む） | ・全99キーの日英対訳が揃い（未翻訳キー露出 `0件`・誇張表現 `0件`）、主操作はすべて動詞、エラー文は利用者を責めず回復手順を明示。<br>・英語表示4画面（`*_normal_en.png`）および `320px`・`200%` 表示で長文キーの文字切れ `0件`。<br>・すべてのリンク・ボタンで可視文字がアクセシブル名の先頭に一致（WCAG 2.5.3）し、全画面に固有の日英 `<title>` があることを確認。<br>・減点理由（要修正1件）：`CombinatorScreen.tsx:215-228`（`combinator_normal_light.png`, `AC6_CRASHED.png`）のライブ残量計器 `<dt>` にモジュール属性キー `combinator.attr.cost`（`エネルギーコスト`）等を流用しており、残エネルギー `10` / `-1` が「エネルギーコスト」と表示される用語の不整合がある点。 |

- **合計点**：**15 / 16 点**（A:2, B:2, C:2, D:2, E:2, F:2, G:2, H:1）
- **合否の線を満たすか**：**満たす（PASS）** — すべての★項目を満たし（未検証の★ `0個`）、`0点` のカテゴリがなく（最低 `1点`）、合計 `15 / 16 点` で合格基準（`13 / 16 点` 以上）を満たし、重大な指摘が `0件` のため。

## 証拠
- 対象：`origin/main...HEAD`（`5dfb633...fdb0756`、ブランチ `feat/001-arcade-core`）、観点：G3 実画面デザイン判定 r1（全44枚スクリーンショット目視確認、仕様・トークン一致、WCAG 2.2 AA コントラスト再計算、200%拡大・320px幅リフロー、日英文言、キーボード・axe・Lighthouse 監査）
  - `git diff --name-only origin/main...HEAD` の確認一覧と読んだ印：
    - [x] `docs/prd/001-arcade-core.md`（全356行読了）
    - [x] `design/001-arcade-core-research.md`（全165行読了）
    - [x] `design/001-arcade-core.md`（全537行読了）
    - [x] `design/001-arcade-core/wireframes.md`（全188行読了）
    - [x] `design/tokens.json`（全308行読了）
    - [x] `docs/adr/001-web-foundation.md`（全93行読了）
    - [x] `docs/reviews/001-arcade-core-G1-design-reviewer-r1.md`・`docs/reviews/001-arcade-core-G1-design-reviewer-r2.md`（全行読了）
    - [x] `web/index.html`（全31行読了）
    - [x] `web/src/styles/tokens.css`（全161行読了）
    - [x] `web/src/styles/app.css`（全1047行読了）
    - [x] `web/src/i18n/dictionary.ts`（全328行読了）
    - [x] `web/src/App.tsx`（全1407行読了）
    - [x] `web/src/components/HeaderShell.tsx`・`LobbyScreen.tsx`・`CombinatorScreen.tsx`・`FermiScreen.tsx`・`DiagnosticScreen.tsx`・`SimulationCanvas.tsx`・`RadarChartSvg.tsx`・`NotFoundSection.tsx`・`ErrorBoundary.tsx`・`Icons.tsx`（全10ファイル全行読了）
    - [x] `web/src/audio/chipSynth.ts`（1〜120行読了）
    - [x] `web/tests/acceptance/specs/responsive-and-a11y.spec.ts`（全235行読了）・`resilience-and-media.spec.ts`（1〜250行読了）
    - [x] `docs/verification/001-arcade-core/verification.md`（全463行読了）
    - [x] `docs/verification/001-arcade-core/evidence/axe-full-audit.json`（全808行読了）
    - [x] `docs/verification/001-arcade-core/evidence/lighthouse-audit.log`（全行読了）
    - [x] `docs/verification/001-arcade-core/evidence/*.png`（全44枚すべて `read_file` で画像を開いて目視確認）
    - [ ] ドメイン計算単体テスト・設定ファイル群（`web/src/domain/*`, `web/src/__tests__/*`, `contracts/*`, `docs/reviews/*G0*/*G2*`：UI 表示・デザイン判定対象外、`verification.md` で全テスト緑を確認）

### 1. スクリーンショット単独からの「第一印象」と仕様3章の照合（G3）
| 画面（見たスクリーンショット） | スクリーンショットだけを見た第一印象（1文） | `design/001-arcade-core.md:85-88` の「仕事・主操作」との一致 |
|---|---|---|
| 画面1：モード選択（`lobby_normal_light.png`, `lobby_empty_light.png`） | 2つの思考パズルモードと診断カルテの役割・クリア進捗をひと目で確認し、唯一の青い塗りボタン（未プレイ時は `3-ACT COMBINATOR の STAGE 1 を始める`、達成後は `思考力診断カルテで認定ランクを見る`）を押して次の推奨ステップへ進む画面。 | **一致**（主操作1つが最も目立ち、補助3カードは枠線セカンダリに分離） |
| 画面2：『3-ACT COMBINATOR』（`combinator_normal_light.png`） | ステージの目標出力と暴走上限を見ながら下段デッキのモジュールを3つの実行スロットに配置し、唯一の青い塗りボタン `RUN（実行する）` を押して回路シミュレーションを実行する画面。 | **一致**（`STEP`・`RESET` は枠線セカンダリで階層分離明確） |
| 画面3：『FERMI BLASTER』（`fermi_normal_light.png`） | お題の未知数を `ACT 1 × ACT 2 × ACT 3` の3スロットの仮説カードで因数分解し、唯一の青い塗りボタン `FIRE（発射する）` を押して対数レーザー計測を実行する画面。 | **一致**（`RESET（選択をクリア）` は枠線セカンダリ） |
| 画面4：『思考力診断カルテ』（`diagnostic_normal_light.png`, `AC12_UNRANKED.png`） | 5軸思考特性レーダーチャートと総合認定ランクを確認し、唯一の青い塗りボタン `診断結果をコピーする`（`UNRANKED` 時は未クリアモードの `STAGE 1 を始める`）を押す画面。 | **一致**（ランク解放・未解放どちらの状態でもプライマリ塗りボタンは1画面1つ） |

### 2. 1周目：受け入れ条件（AC-1〜AC-20）の実画面・状態追跡表
| AC | たどれた / たどれない | 確認した実画面スクリーンショット・監査出力 |
|---|---|---|
| AC-1 | たどれた | `lobby_normal_light.png`, `lobby_empty_light.png`, `lighthouse-audit.log`（LCP `901ms` <= `1.0s`、登録壁・迷路要素 `0件`） |
| AC-2 | たどれた | `combinator_empty_light.png`, `combinator_normal_light.png`（全10ステージ切替、5モジュール×4属性、目標・暴走上限表示） |
| AC-3 | たどれた | `combinator_running_light.png`, `AC3_STAGE_CLEAR.png`（3スロット配置 → `RUN` → `✓ STAGE CLEAR`＋`1105 pt`＋`次のステージを開く`） |
| AC-4 | たどれた | `verification.md`（全10ステージ順列ソルバー検証＋Playwright E2E 完走） |
| AC-5 | たどれた | `combinator_stepping_light.png`（`STEPPING（1/3 一時停止中）`、1手ごとのパラメータ更新、`RESET（初期値に戻す）`） |
| AC-6 | たどれた | `AC6_CRASHED.png`（`STEP 3` エネルギー枯渇 `ENERGY = -1`）、`AC6_FAILED.png`（`FINAL CHECK` ターゲット未達 `OUTPUT = 17`） |
| AC-7 | たどれた | `fermi_empty_light.png`, `fermi_normal_light.png`（初級・中級・上級 全9ステージ、`ACT 1`〜`ACT 3` 仮説カード群） |
| AC-8 | たどれた | `fermi_running_light.png`, `fermi_perfect_order_light.png`, `fermi_good_range_light.png`, `AC9_解説表示.png`, `fermi_underestimate_light.png` |
| AC-9 | たどれた | `fermi_perfect_order_light.png`, `fermi_good_range_light.png`, `AC9_解説表示.png`（解説3項目＋`✕ 今回選択した罠カード`＋`RESET（選択をクリア）`） |
| AC-10 | たどれた | `diagnostic_normal_light.png`, `diagnostic_normal_dark.png`, `diagnostic_normal_en.png`（5軸整数スコア＋正五角形 SVG チャート＋総合認定ランク `A`） |
| AC-11 | たどれた | `AC11_コピー完了通知.png`（1クリック Clipboard コピー＋`✓ 診断結果をクリップボードにコピーしました...` トースト） |
| AC-12 | たどれた | `AC12_UNRANKED.png`, `diagnostic_unranked_failed_only_light.png`, `diagnostic_unranked_partial_light.png`（`UNRANKED`＋コピー `disabled`＋開始導線） |
| AC-13 | たどれた | `combinator_empty_light.png`, `fermi_empty_light.png`（未配置時の `RUN`/`STEP`/`FIRE` `disabled`＋不足スロット案内1件） |
| AC-14 | たどれた | `offline_play_light.png`（オフライン両モードクリア・カルテ更新・外部通信 `0件`・リロード後復元） |
| AC-15 | たどれた | `lobby_normal_light.png`（既定 `SOUND ON`・操作前自動再生 `0回`、Web Audio シンセ発音、`SOUND OFF` ゲイン `0` 永続化） |
| AC-16 | たどれた | `AC16_ストレージ退避バナー.png`（`localStorage` 例外時のインメモリ退避＋上部警告バナー表示・破損 JSON 安全初期化） |
| AC-17 | たどれた | `verification.md` AC-17（`prefers-reduced-motion: reduce` 時にシェイク変位 `0px`・再生完了 `1.0秒以内`） |
| AC-18 | たどれた | `*_normal_mobile.png`（`320px`）, `*_normal_zoom200.png`（`200%`）, `axe-full-audit.json`（全44状態違反 `0件`、横はみ出し `0px`、押下領域 `>= 24x24px`） |
| AC-19 | たどれた | `verification.md` AC-19（全9ステージ解存在 `1通り以上` かつ `50%以下`・罠カード `1枚以上`） |
| AC-20 | たどれた | `AC20_手動コピー展開.png`（Clipboard 例外時の赤枠通知＋`手動コピー用の診断結果サマリー` `<textarea readOnly>`＋`テキストを全選択する`） |

### 3. 2周目：Nielsen の10原則（エラー予防 #5・エラー回復 #9 必須確認表）
| 画面 | #5 エラーの予防（確認結果） | #9 エラーの認識・診断・回復（確認結果） | その他の原則（#1〜#4, #6〜#8, #10） |
|---|---|---|---|
| 画面1：モード選択（`/`） | 未プレイ時は「STAGE 1 を始める」、片方クリア時は未クリア側 STAGE 1、両方クリア時は診断カルテへと主ボタンが自動誘導し、空のカルテへ迷い込む無駄足を防ぐ（`lobby_empty_light.png`, `lobby_partial_combinator_only_light.png`）。 | `localStorage` 制限時は `AC16_ストレージ退避バナー.png` で「タブを閉じるまで一時保持」と原因・設定確認手順を表示。未定義 URL 直アクセス時は `not_found_404_light.png` でトップ復帰ボタンを提示。 | 現在地 `aria-current="page"` 下線（#1）、進捗バッジ `0 / 10`・`1 / 10` 明示（#6）、装飾排除（#8）すべて適合。 |
| 画面2：『3-ACT COMBINATOR』（`/combinator`） | スロット未充足時は `RUN`/`STEP` を `disabled` にして不足スロット名を案内（`combinator_empty_light.png`）。3スロット満杯時は未配置モジュールを `disabled` にして誤上書きを防止（`combinator_normal_light.png`）。`RUNNING` 中は全操作ボタンを `disabled` にして連打二重加算を防止（`combinator_running_light.png`）。 | `AC6_CRASHED.png`・`AC6_FAILED.png` で発生箇所（`STEP 3` / `FINAL CHECK`）・原因種別・期待値と実測値・回復操作（`RESET` またはスロット差し替え）を提示。`?stage=99` は `combinator_stage_fallback_light.png` で STAGE 1 へ補正し通知。 | ライブ計器 `<dt>` ラベルの属性キー流用のみ軽微な引っかかりとして **要修正**（#2, #6）に記録。それ以外は適合。 |
| 画面3：『FERMI BLASTER』（`/fermi`） | 未選択スロットがある間は `FIRE` を `disabled` にして不足 `ACT` 名を案内（`fermi_empty_light.png`）。`RUNNING` 中はステージ・カード・`FIRE`・`RESET` をすべて `disabled` にして二重発射を防止（`fermi_running_light.png`）。 | `AC9_解説表示.png`（`OVERKILL`）・`fermi_underestimate_light.png`（`UNDERESTIMATE`）で対数誤差 `d`・基準因数分解式・`✕ 今回選択した罠カード` とその理由・再試行案内ボックスを提示。`?stage=99` は `fermi_stage_fallback_light.png` で安全補正。 | リアルタイム推定式プレビュー `ACT 1 × ACT 2 × ACT 3 = ...`（#1, #6）、可逆な `RESET（選択をクリア）`（#3）すべて適合。 |
| 画面4：『思考力診断カルテ』（`/diagnostic`） | 未解放（`UNRANKED`）時はコピーボタンを `disabled` にして空サマリーの誤共有を防止（`AC12_UNRANKED.png`, `diagnostic_unranked_partial_light.png`）。 | 未解放時は解放条件（「あと1モードで認定ランク解放…」等）と未クリア側 STAGE 1 開始ボタンを提示。Clipboard 拒否時は `AC20_手動コピー展開.png` で失敗通知と `<textarea readOnly>`＋全選択ボタンを即座に展開。 | 5軸チャートと `<dl>` 整数値の常時併記（#1, #6）、1クリック共有トースト `AC11_コピー完了通知.png`（#1）すべて適合。 |

### 4. 目視確認した全44枚のスクリーンショット一覧（`docs/verification/001-arcade-core/evidence/`）
- **通常状態 5通り×4画面＝20枚**：
  - 画面1：`lobby_normal_light.png`, `lobby_normal_dark.png`, `lobby_normal_zoom200.png`, `lobby_normal_en.png`, `lobby_normal_mobile.png`
  - 画面2：`combinator_normal_light.png`, `combinator_normal_dark.png`, `combinator_normal_zoom200.png`, `combinator_normal_en.png`, `combinator_normal_mobile.png`
  - 画面3：`fermi_normal_light.png`, `fermi_normal_dark.png`, `fermi_normal_zoom200.png`, `fermi_normal_en.png`, `fermi_normal_mobile.png`
  - 画面4：`diagnostic_normal_light.png`, `diagnostic_normal_dark.png`, `diagnostic_normal_zoom200.png`, `diagnostic_normal_en.png`, `diagnostic_normal_mobile.png`
- **状態別スクリーンショット 24枚**：
  - 画面1（2枚）：`lobby_empty_light.png`, `lobby_partial_combinator_only_light.png`
  - 画面2（7枚）：`combinator_empty_light.png`, `combinator_stepping_light.png`, `combinator_running_light.png`, `AC3_STAGE_CLEAR.png`, `AC6_CRASHED.png`, `AC6_FAILED.png`, `combinator_stage_fallback_light.png`
  - 画面3（7枚）：`fermi_empty_light.png`, `fermi_running_light.png`, `fermi_perfect_order_light.png`, `fermi_good_range_light.png`, `AC9_解説表示.png`, `fermi_underestimate_light.png`, `fermi_stage_fallback_light.png`
  - 画面4・共通シェル・オフライン・404（8枚）：`AC12_UNRANKED.png`, `diagnostic_unranked_failed_only_light.png`, `diagnostic_unranked_partial_light.png`, `AC11_コピー完了通知.png`, `AC20_手動コピー展開.png`, `AC16_ストレージ退避バナー.png`, `offline_play_light.png`, `not_found_404_light.png`

### 5. 実行したコマンドと出力（コントラスト独立計算・トークン検査・監査確認）
1. **調査コミット先行確認**：
   - コマンド：`git log --diff-filter=A --format='%h %ci %s' -- design/001-arcade-core-research.md design/001-arcade-core.md`
   - 出力：`9149ca1 2026-11-12 01:18:33 +0900`（仕様）より `9259081 2026-11-12 00:55:47 +0900`（調査）が先行。
2. **`R-n` 件数・URL/日付欠落・未定義参照確認**：
   - コマンド：`grep -cE '^\| R-[0-9]+' design/001-arcade-core-research.md` → `34`（>= 5）、URL/日付欠落 `0`、仕様側の未定義 `R-n` `0`。
3. **実装コード内の `#HEX` 直書き・`outline: none`・装飾グラデーション/影の検査**：
   - コマンド：`grep -rnE --include='*.css' --include='*.tsx' --include='*.ts' 'outline:\s*(none|0)|#[0-9A-Fa-f]{3,8}\b' web/src/` および `grep -rnE 'box-shadow|gradient' web/src/`
   - 出力：`#HEX` は `web/src/styles/tokens.css` のトークン定義のみ（他ファイル `0件`）、`outline: none/0` は `0件`、`box-shadow`・`gradient` は `0件`。
4. **WCAG 2.2 コントラスト比の独立計算（`python3 -c`）**：
   - `design/tokens.json` と `web/src/styles/tokens.css` の全25色×5モード完全一致（不一致 `0件`）を確認したうえで、`light` / `dark` / `highContrast.light` / `highContrast.dark` の4モード×38組＝全152組＋`app.css` 横断組を WCAG 相対輝度式で再計算：
   - 主な計算結果（違反 `0件`）：
     - 本文 `text.primary` / `surface.canvas`：Light `16.41:1`、Dark `18.30:1`、HC Light `21.00:1`、HC Dark `21.00:1`（基準 `>= 4.5:1`）
     - 補助文字 `text.secondary` / `surface.inset`：Light `7.64:1`、Dark `10.97:1`、HC Light `11.12:1`、HC Dark `17.27:1`（基準 `>= 4.5:1`）
     - プライマリCTA `action.primaryText` / `action.primary`：Light `6.70:1`（`#FFFFFF` / `#0055D4`）、Dark `10.89:1`（`#06131F` / `#22D3EE`）、HC Light `10.70:1`、HC Dark `15.72:1`（基準 `>= 4.5:1`）
     - 意味色テキスト最小値 `status.success` / `status.successBg`：Light **`5.68:1`**、Dark **`6.24:1`**、HC Light **`8.29:1`**、HC Dark **`9.96:1`**（すべて `>= 4.5:1`）
     - 横断組合せ `status.warning` / `surface.panel`：Light `6.80:1`、Dark `10.63:1`；`status.danger` / `surface.panel`：Light `6.08:1`、Dark `6.92:1`；`text.secondary` / `status.dangerBg`：Light `9.10:1`、Dark `11.70:1`（すべて `>= 4.5:1`）
     - 操作部品枠・フォーカス・チャート線最小値 `border.strong` / `surface.canvas`：Light **`4.55:1`**、Dark **`4.81:1`**、HC Light **`10.36:1`**、HC Dark **`12.88:1`**；`border.focus`：Light `6.25:1`、Dark `9.58:1`（すべて `>= 3.0:1`）
5. **自動アクセシビリティ監査・パフォーマンス監査出力確認**：
   - `docs/verification/001-arcade-core/evidence/axe-full-audit.json`：`totalStatesAudited: 44`, `totalViolations: 0`, `totalUncaughtErrors: 0`, `totalConsoleErrors: 0`（タグ：`wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`）。
   - `docs/verification/001-arcade-core/evidence/lighthouse-audit.log`：`/`, `/combinator?stage=1`, `/fermi?stage=1`, `/diagnostic` の全4ルートで Performance `100`, Accessibility `100`, LCP `901〜902ms`, TBT `0ms`, CLS `0`。

### 6. 開いた URL と確認日
- `https://tomorrowcorporation.com/humanresourcemachine`（2026-11-13 疎通・記載内容照合確認、HTTP 200）
- `https://www.quantable.io/pricing`（2026-11-13 疎通確認、HTTP 200）
- `https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html`（2026-11-13 疎通確認、HTTP 200）

### 7. 未検証
- なし（仕様にあるすべての画面・状態・全★項目を実画面スクリーンショット、監査ログ、独立計算で検証済み）

## 記録
- 関門：G3（実画面デザイン判定）
- 判定した役：design-reviewer
- 回：r1
- 対象：`001-arcade-core`（コミット `fdb075606f8a4b2484b0d8da841c8552f0567b9a`）
- 日付：2026-11-13
