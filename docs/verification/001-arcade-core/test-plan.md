# テスト計画 001-arcade-core：レトロアーケード型エンジニア思考ゲーム＆思考力診断カルテ

- 書いた役：verifier　日付：2026-11-12
- 実装のコードを見ずに書いた：はい
- 読んだファイル（PRD、design/、contracts/ だけ。読んだものを全部並べる）：
  - docs/prd/product.md
  - docs/prd/001-arcade-core.md
  - design/001-arcade-core.md
  - design/tokens.json
  - design/001-arcade-core/wireframes.md
  - contracts/openapi.yaml
  - contracts/arcade-test-seam.md
  - contracts/dependencies.md
  - （※組織共通の役割定義・手引き・テンプレートとして `.claude/agents/verifier.md`、`.claude/skills/craft-verifier/SKILL.md`、`.claude/skills/craft-verifier/web.md`、`.claude/org/app.json`、`docs/org/gates.md`、`docs/templates/test-plan.md` を参照。実装コード・`docs/adr/`・`CLAUDE.md` は一切読んでいない）

## 1. リスク
影響「大」の例：データが消える、数や金額が間違う、他人のデータが見える、起動で落ちる、主な流れが最後まで進まない。
影響「大」は、自動テスト、3章の行、6章の探索1本。影響「小」は代表のテスト1本。

| # | リスク | 影響（大中小） | 起きやすさ（大中小） | 関わる AC | 試す深さ |
|---|---|---|---|---|---|
| R1 | モード1『3-ACT COMBINATOR』で解が存在しない／高難度ステージが単純加算のみで解けてしまう、または1ステップ評価・`STEP` 非加算・`CRASHED`/`FAILED` 境界判定が誤り主フローが進まない | 大 | 中 | AC-2, AC-3, AC-4, AC-5, AC-6, AC-13 | 自動テスト6本（全10ステージ順列ソルバー＋S8〜S10実画面検証＋状態遷移＋境界値）、3章（初めて起動・データがある）、6章探索チャーター1本 |
| R2 | モード2『FERMI BLASTER』で正解組み合わせ・罠カードが欠落する、または対数誤差 `d` と罠枚数の重なりによる4段階オーダー判定・解説・`RESET` 初期化が間違う | 大 | 中 | AC-7, AC-8, AC-9, AC-13, AC-19 | 自動テスト5本（全9ステージ組み合わせソルバー＋デシジョンテーブル4判定＋解説3項目＋`RESET`）、3章（初めて起動・データがある）、6章探索チャーター1本 |
| R3 | 『思考力診断カルテ』の5軸整数スコア算出式（`Math.round` 四捨五入・初回クリア回数固定・未解放時 `0` 境界）や総合認定ランク（`S+`〜`C` / `UNRANKED`）の数値が間違う、または結果コピー共有が破綻する | 大 | 中 | AC-10, AC-11, AC-12, AC-20 | 自動テスト5本（実プレイ算出＋全ランク境界シード＋未解放3区分デシジョンテーブル＋Clipboard成功／拒否）、3章（初めて起動・データがある・権限を断った）、6章探索チャーター1本 |
| R4 | オフライン切り替え時、`window.localStorage` 例外（`SecurityError` 等）時、または破損 JSON 格納時に未捕捉 JS 例外で画面が落ちる、もしくはクリア履歴データが消失する | 大 | 中 | AC-1, AC-14, AC-16 | 自動テスト3本（オフライン完走＆リロード復元・`localStorage` getter例外退避・破損JSON復旧）、3章（オフライン・権限を断った・容量不足）、6章探索チャーター1本 |
| R5 | スマホ最小幅 `320px` や文字拡大 `200%` で横スクロール発生・24x24px未満・要素重なりによる押下不能が起きる、またはキーボード操作・WCAG 2.2 AA 違反で完走できない | 大 | 中 | AC-1, AC-18 | 自動テスト3本（4表示条件×全4画面リフロー＆ターゲットサイズ計測＋ライト／ダーク axe 監査＋キーボード単独完走）、3章（言語と地域・大きい文字、ダークモード）、6章探索チャーター1本 |
| R6 | 初回表示で自動音声が鳴る、外部音声通信が発生する、または `SOUND OFF` 切替後もゲインが `0` にならずリロードでミュート設定が外れる | 中 | 中 | AC-15 | 自動テスト1本（状態遷移：初回 `SOUND ON` 操作前発音0回 → `RUN` 発音 → `SOUND OFF` ゲイン0＆再実行無音 → リロード維持）、3章（データがある） |
| R7 | `prefers-reduced-motion: reduce` 有効時に画面シェイク変位が `0px` にならず残る、または短縮再生が `1.0秒` を超過する | 小 | 小 | AC-17 | 代表の自動テスト1本（モード1 `CRASHED` ＆モード2 `FIRE` での `maxShakeOffsetPx === 0`・CSS `transform` 変位 `0px`・再生 `<= 1000ms` 検証）、3章（大きい文字、ダークモード） |

## 2. 受け入れ条件とテストの対応
すべての AC に1つ以上のテストを付ける。名前に AC 番号を入れる（`AC-n / ACn_<結果>`）。AC のないテストは作らない。
技法：同値分割と境界値、状態遷移、デシジョンテーブル、ペアワイズ、代表の1例。
確かめる結果は具体的な値で書く。要素があるかだけにしない。

| AC | リスク | 技法 | 試す値（境界、遷移、ルールの列） | 種類（API / 画面） | ファイル::テストの名前 | 確かめる結果（具体的な値） |
|---|---|---|---|---|---|---|
| AC-1 | R4, R5 | 同値分割と境界値・状態遷移 | 初回 `/` 表示時間境界 `<= 1000ms`、言語 `ja` ↔ `en`、未定義パス `/unknown-arcade-route` | 画面 | `web/tests/acceptance/specs/shell-and-lobby.spec.ts::AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証` | HTTP `200` と5種の安全ヘッダーが付与され、ログイン欄 `0件`・`1000ms以内` に3モード導線（`lobby-mode-*` / `nav-mode-*`）が操作可能、進捗 `0 / 10`・`0 / 9`・`UNRANKED`、画面1内の `canvas`・`Coming Soon`・`disabled` ボタンがすべて `0件`、axe 違反 `0件`、`EN` 切替で `<title>` が `Mode Select \| LOGIC ARCADE`、未知パスで `not-found-section` から `/` へ復帰できる |
| AC-2 | R1 | 同値分割と境界値 | ステージ `1..10` 全10件、モジュール数境界 `5`（S1〜S3）・`6`（S4〜S7）・`7`（S8〜S10）、範囲外 `?stage=99` | 画面 | `web/tests/acceptance/specs/combinator.spec.ts::AC-2 / AC2_モード1全10ステージ選択と5から7個のユニークモジュール4属性・目標・暴走上限表示` | `combinator-stage-1`〜`10` 全10ステージに切替でき、各ステージで確定数（`5`〜`7`個）のユニーク `data-module-id` カードと4属性（基本性能・エネルギーコスト・副作用・発動条件）すべてが非空表示され、`combinator-target-condition` と `combinator-overheat-limit` に各ステージの目標値・上限値が表示され、`?stage=99` は STAGE 1 に補正され `stage-fallback-notice` が `1件` 表示、axe 違反 `0件` |
| AC-3 | R1 | 状態遷移・境界値 | STAGE 1 正解順列 `["s1-seed","s1-amp2","s1-amp2b"]`、再生時間上限 `<= 3000ms`、リロード永続化 | 画面 | `web/tests/acceptance/specs/combinator.spec.ts::AC-3 / AC3_モード1の3ステップ配置とRUN3秒以内シミュレーション再生・STAGE_CLEARスコア算出・クリア記録` | 3枠配置時に残り未配置カード2枚が `disabled`、`RUN` 押下から `3000ms以内` に `data-status="STAGE CLEAR"`、最終値 `energy=0, output=24, sideEffect=9`、獲得スコア `1105`、`combinator-stage-1` が `data-cleared="true"`（`S1 CLEAR`）となり、`page.reload()` 後も `cleared=true, bestScore=1105, runAttemptsBeforeFirstClear=1` が保持される |
| AC-4 | R1 | 同値分割と境界値 | 全10ステージの全順列 `P(n,3)`（`60` / `120` / `210` 通り）、正解比率 `(0, 0.5]`、S8〜S10 の単純クリア数 `0` | 画面 | `web/tests/acceptance/specs/combinator.spec.ts::AC-4 / AC4_モード1全10ステージの全順列解存在・50パーセント以下・ステージ8から10非自明性の保証` | `auditAllStages().combinatorStages` 全10件で `clearCount >= 1` かつ `clearRatio <= 0.5`、ステージ8・9・10で `clearsWithoutSideEffectOrIf === 0` であり、実画面でも S8（スコア `1525`）・S9（`1555`）・S10（`1930`）の正解順列 `RUN` で `STAGE CLEAR` に到達する |
| AC-5 | R1 | 状態遷移・境界値 | `IDLE (step=0)` → `STEP` 1回 `STEPPING (step=1)` → `RESET` のページ内 `click` 発火（capture）から `IDLE` 到達時間 `<= 200ms` | 画面 | `web/tests/acceptance/specs/combinator.spec.ts::AC-5 / AC5_モード1のSTEP1手検証による試行回数非加算とRESET0.2秒以内スロット維持初期化` | STAGE 1 で `STEP` 1回押下後に `data-status="STEPPING"`（`1/3`）、パラメータが1手分 `energy=7, output=6, sideEffect=2` のみ更新され公式試行回数 `officialAttemptCount === 0`・`combinatorTotalRuns === 0`、続く `RESET` のページ内 `click` 発火時点から `200ms以内` に3スロット `["s1-seed","s1-amp2","s1-amp2b"]` を維持したまま `stepIndex=0`・初期値 `(10, 0, 0)`・`IDLE` に戻る |
| AC-6 | R1 | デシジョンテーブル | (a-1) エネルギー枯渇 `ENERGY=-1 < 0`、(a-2) 暴走上限超過 `HEAT=14 > 12`、(a-3) `STEP 1` 即時中断、(b) 完走目標未達 `OUTPUT=17 < 24` | 画面 | `web/tests/acceptance/specs/combinator.spec.ts::AC-6 / AC6_モード1途中制約違反時のCRASHED中断と完走未達時のFAILED判定およびデバッグログ3項目表示` | エネルギー枯渇・暴走超過では違反ステップ（`STEP 3` / `STEP 1`）で即時中断して `data-status="CRASHED"`、完走未達では `stepIndex=3` 後に `data-status="FAILED"`・発生箇所 `FINAL CHECK` となり、全ケースで `combinator-debug-log` に発生箇所・原因種別・期待値と実測値（`0` vs `-1`、`12` vs `14`、`24` vs `17`）の3項目が表示される |
| AC-7 | R2 | 同値分割と境界値 | 全9ステージ（初級 `1..3`・中級 `4..6`・上級 `7..9`）、各スロット選択肢数 `3..4` 枚、自由入力欄 `0件` | 画面 | `web/tests/acceptance/specs/fermi.spec.ts::AC-7 / AC7_モード2全9ステージ（初級3・中級3・上級3）と3スロット各3から4枚の仮説カード選択・自由入力欄0件` | `fermi-stage-1`〜`9` 全9ステージが選択可能で `data-tier` が `beginner`/`intermediate`/`advanced` に一致し、`input` 要素が `0件`、各ステージの `ACT 1`〜`3` スロットに `3`〜`4` 枚の仮説カードがあり、3枚選択で式プレビューから `?` が消え `FIRE` が活性になり、axe 違反 `0件` |
| AC-8 | R2 | デシジョンテーブル・境界値 | 再生時間 `<= 3000ms`、(1) `\|d\|<=0.5` & 罠0、`PERFECT ORDER`、(2a) `\|d\|<=0.5` & 罠1、`GOOD RANGE`、(2b) `0.5<\|d\|<=1.0` & 罠0、`GOOD RANGE`、(3) `d>1.0`、`OVERKILL`、(4) `d<-1.0`、`UNDERESTIMATE` | 画面 | `web/tests/acceptance/specs/fermi.spec.ts::AC-8 / AC8_モード2のFIRE3秒以内視覚シミュレーションと対数誤差・罠有無による4段階オーダー判定・クリア記録` | `FIRE` から `3000ms以内` に再生完了し、上記4条件に応じて `PERFECT ORDER` / `GOOD RANGE` / `OVERKILL` / `UNDERESTIMATE` が正確に表示され、上位2判定時のみ `data-cleared="true"`（`S1 CLEAR`, S3 クリア）となり、`OVERKILL`（S4）・`UNDERESTIMATE`（S5）では `data-cleared="false"` が維持される |
| AC-9 | R2 | 状態遷移・境界値 | `FIRE`（`OVERKILL`）後の解説3項目（比較・基準式・罠理由>=1文字）＋再試行案内 `showRetryHint=true` と `RESET` のページ内 `click` 発火（capture）から `IDLE` 到達時間 `<= 200ms` | 画面 | `web/tests/acceptance/specs/fermi.spec.ts::AC-9 / AC9_モード2の基準因数分解式・罠カード解説3項目表示とRESET0.2秒以内全スロット未選択初期化` | `fermi-explanation-panel` に推定値と基準値の比較（`fermi-comparison-values`）、`ACT 1 × ACT 2 × ACT 3` 式と解説文1文字以上（`fermi-baseline-breakdown`）、罠カード名1件以上と理由1文字以上（`fermi-trap-notes`）および `OVERKILL` 時の `fermi-retry-hint`（`showRetryHint === true`）が表示され、`RESET` のページ内 `click` 発火時点から `200ms以内` に全カードの `aria-pressed="false"`・未選択式 `?`・`FIRE` ボタン `disabled`・`IDLE` に戻る |
| AC-10 | R3 | 同値分割と境界値 | (1) 両モード各1ステージ1発クリア＋再プレイ非上書き、(2) 総合スコア境界 `100`(`S+`), `85`(`S`), `71`(`A`), `56`(`B`), `18`(`C`) | 画面 | `web/tests/acceptance/specs/diagnostic.spec.ts::AC-10 / AC10_両モードクリア後の5軸整数スコア算出・正五角形レーダーチャート描画・総合認定ランク表示` / `web/tests/acceptance/specs/diagnostic.spec.ts::AC-10 / AC10_思考力診断カルテのSプラス・S・B・Cランク境界値と5軸算出式の網羅検証` | 実プレイ後に5軸スコアが `64, 73, 73, 73, 73`・総合スコア `71`・ランク `A`、SVG `diagnostic-radar-polygon` が `data-vertex-count="5"` かつ5頂点座標を持ち、`diagnostic-copy-button` が活性、axe 違反 `0件`。またシード検証で `S+`(`100`), `S`(`85`), `B`(`56`), `C`(`18`：5軸 `4, 3, 17, 45, 21`) が PRD 11章の式と完全一致する |
| AC-11 | R3 | 状態遷移・境界値 | ランク `A` 解放＋Clipboard 許可状態、通知表示継続境界 `>= 2000ms`（`page.clock.fastForward(2100)`） | 画面 | `web/tests/acceptance/specs/diagnostic.spec.ts::AC-11 / AC11_思考力診断カルテの結果サマリーテキストのクリップボード書き込みと2秒以上の完了通知表示` | `diagnostic-copy-button` 押下で総合ランク `A`・総合スコア `71`・5軸すべての名称（仕様読解力・順序構築力・リソース制御力・フェルミ概算センス・仮説精度）と整数スコア（`64`, `73`）を含むテキストが `clipboard.writeText` に渡され、`diagnostic-copy-toast` が `2100ms`（2.0秒以上）経過時点でも可視表示され続ける |
| AC-12 | R3 | デシジョンテーブル | (1) 履歴 `0件`、(2) 失敗履歴のみ（$R_1=3, K_1=2, F_2=2, T_2=1, C_1=C_2=0$）、(3a) モード1のみクリア（$C_1=2, C_2=0$）、(3b) モード2のみクリア（$C_1=0, C_2=3$） | 画面 | `web/tests/acceptance/specs/diagnostic.spec.ts::AC-12 / AC12_認定ランク未解放3パターン（履歴0件・失敗のみ・片モードのみクリア）のUNRANKED表示と開始導線` | 全4ケースで未捕捉 JS 例外 `0件`・`data-rank="UNRANKED"`・`diagnostic-copy-button` が `disabled`。クリア `0` 側の軸はすべて `0`、片側クリア時のみ該当軸が算出整数値（モード1のみ：`68, 76, 76, 0, 0`／モード2のみ：`0, 0, 0, 80, 80`）となり、クリア `0` 側の第1ステージ開始リンクのみが表示される |
| AC-13 | R1, R2 | 同値分割と境界値・状態遷移 | モード1：0枠・2枠・3枠→`STEP 2` 解除、モード2：0枠・`ACT 1,3` のみ選択（`ACT 2` 未選択） | 画面 | `web/tests/acceptance/specs/resilience-and-media.spec.ts::AC-13 / AC13_モード1およびモード2のスロット未充足時の実行ボタンdisabled化・未配置スロット案内文・試行回数0回保証` | 未配置スロットが1つ以上ある全状態で、モード1は `RUN` と `STEP` の両方、モード2は `FIRE` が `disabled` となり、未配置スロット識別子（`STEP 1`〜`3` / `ACT 1`〜`3`）を含む案内文が `1件` 表示され、`status="IDLE"`・`officialAttemptCount === 0` が保たれる |
| AC-14 | R4 | 状態遷移 | 初期読込 → `context.setOffline(true)` → 両モードクリア＆カルテ確認 → `setOffline(false)`＆`page.reload()` | 画面 | `web/tests/acceptance/specs/resilience-and-media.spec.ts::AC-14 / AC14_初期読み込み後の完全オフライン両モードクリア・外部通信0件・リロード後のlocalStorage履歴復元` | オフライン中の未捕捉 JS 例外 `0件`・外部通信 `0件`・音声ファイル通信 `0件`・通信失敗 `0件`・Cookie `0件` で両モードクリアと認定ランク `A`（スコア `71`）算出が完了し、リロード後も進捗 `1 / 10`・`1 / 9` と5軸スコア・ランク `A` が一致して復元される |
| AC-15 | R6 | 状態遷移 | 初回起動（既定 `SOUND ON`・操作前発音 `0回`）→ `RUN` 発音 → `SOUND OFF` 切替 → 再 `RUN` → `page.reload()` | 画面 | `web/tests/acceptance/specs/resilience-and-media.spec.ts::AC-15 / AC15_Web_Audioシンセ効果音発音・外部音声通信0件・SOUND_OFFゲイン0抑止とリロード後永続化` | 外部音声リクエスト `0件`、操作前 `autoPlayBeforeGestureCount === 0`、`SOUND ON` 実行で `synthTriggerCount >= 1` かつ `masterGainValue > 0`、`SOUND OFF` 切替で `masterGainValue === 0` となり再実行しても `synthTriggerCount` が増加せず、リロード後も `SOUND OFF`（`aria-pressed="false"`, `masterGainValue === 0`）が維持される |
| AC-16 | R4 | デシジョンテーブル | (a) `window.localStorage` getter が `SecurityError` を送出、(b) `logic_arcade_state_v1` に破損 JSON `'{corrupted_json: [unclosed'` | 画面 | `web/tests/acceptance/specs/resilience-and-media.spec.ts::AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録` | (a)・(b) いずれも未捕捉 JS 例外 `0件` で両モードクリアと認定ランク `A` 算出が完了し、(a) はインメモリ退避して `storage-fallback-banner` が `1件` 表示され、(b) は破損データを破棄（`recoveredFromCorruption === true`）して `0 / 10` から再記録しリロード後もランク `A` が復元される |
| AC-17 | R7 | 代表の1例（境界値） | `emulateMedia({ reducedMotion: 'reduce' })` 有効時のモード1 `CRASHED` 再生・モード2 `FIRE` 再生 | 画面 | `web/tests/acceptance/specs/resilience-and-media.spec.ts::AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了` | 両モードとも `maxShakeOffsetPx === 0`・`currentShakeOffsetPx === 0`・画面コンテナ CSS `transform` 変位 `0px` に抑止され、押下から結果表示までの再生時間が `1000ms以内` に完了する |
| AC-18 | R5 | ペアワイズ・境界値・状態遷移 | (1) `320px×100%`, `1280px×100%`, `1280px×200%`, `320px×200%` × 全4画面 ＋ ライト／ダーク axe、(2) `Tab`/`Shift+Tab`（macOS WebKit は `Alt+Tab`/`Alt+Shift+Tab`）と `Enter` のみでの全モード完走 | 画面 | `web/tests/acceptance/specs/responsive-and-a11y.spec.ts::AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件` / `web/tests/acceptance/specs/responsive-and-a11y.spec.ts::AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走` | 全16条件で横はみ出し幅 `scrollWidth - innerWidth <= 0px`、全可視操作要素が `>= 24x24px` かつ `elementFromPoint` 重なり押下不能 `0件`、ライト／ダーク全4画面の axe 違反 `0件`。またマウスクリック `0回`・キーボード操作のみで両モードクリアと診断結果コピーまで完走し全フォーカス要素に `>= 2px` のフォーカス枠が表示される |
| AC-19 | R2 | 同値分割と境界値 | 全9ステージの全カード組み合わせ（`27`〜`64` 通り）、`PERFECT ORDER` 比率 `(0, 0.5]`、罠カード枚数 `>= 1` | 画面 | `web/tests/acceptance/specs/fermi.spec.ts::AC-19 / AC19_モード2全9ステージの全組み合わせPERFECT_ORDER解存在・50パーセント以下・罠カード1枚以上配置の保証` | `auditAllStages().fermiStages` 全9件で `perfectOrderCount >= 1`・`perfectOrderRatio <= 0.5`・`trapCardCount >= 1`・`passesAc19 === true` であり、実画面でも初級（S1）・中級（S6）・上級（S9）の正解組 `FIRE` で `PERFECT ORDER` に到達する |
| AC-20 | R3 | デシジョンテーブル | (a) `navigator.clipboard.writeText` が `NotAllowedError` 送出、(b) `navigator.clipboard` が `undefined` | 画面 | `web/tests/acceptance/specs/diagnostic.spec.ts::AC-20 / AC20_クリップボード書き込み拒否および未定義時の失敗通知と手動コピー用テキスト領域展開` | (a)・(b) いずれも未捕捉 JS 例外 `0件` で偽の成功トーストを出さず失敗通知 `diagnostic-copy-error` が `1件` 表示され、`<label>` 紐付きの `<textarea readonly>`（`diagnostic-manual-copy-textarea`）に総合ランク `A`・総合スコア `71`・全5軸名称と整数スコアが表示される |

## 3. 試す状態
全行で「自動」「G4 の人」「範囲外」のどれかを選ぶ。範囲外には理由を書く。空欄は不可。

| 状態 | 選んだもの | 作り方 | どのテストで、または理由 |
|---|---|---|---|
| 初めて起動 | 自動 | 新しい Playwright `BrowserContext`（`localStorage` 空状態）で `/`・`/combinator`・`/diagnostic` を開く | `AC-1`（3導線即時提示・進捗 `0/10, 0/9`）、`AC-12`（初期 `UNRANKED`）、`AC-15`（既定 `SOUND ON`・操作前自動再生 `0回`）で検証 |
| データがある | 自動 | 実画面プレイでのクリア保存＋`page.reload()`、および `page.addInitScript` による `logic_arcade_state_v1` シード投入 | `AC-3`（クリア記録保持）、`AC-10`（5軸スコア・全5ランク `S+`〜`C` シード）、`AC-12`（失敗のみ・片モードクリア）、`AC-14`（リロード復元）で検証 |
| 前の版からの更新（版を飛ばす更新も） | 範囲外 | 前のタグのビルドでデータを作り、上から入れる | 初回機能 `001-arcade-core` であり公開済みの前の版（過去タグ）がまだ存在しないため範囲外（なお、`schemaVersion: 1` の保存と破損 JSON からの安全復旧は `AC-16` で自動検証済み。次の機能以降で v1 シード互換検証を追加する） |
| オフライン、サーバーエラー（500、タイムアウト） | 自動 | 初期ロード完了後に `context.setOffline(true)` でネットワークを完全遮断してプレイ（バックエンド HTTP API は `0件` のため 500 スタブは非該当） | `AC-14`（完全オフラインでの両モードクリア・診断カルテ更新・外部通信 `0件`・未捕捉例外 `0件`・リロード復元）で検証 |
| 権限を断った（その場で、あとから設定で） | 自動 | `addInitScript` で `navigator.clipboard.writeText` の `NotAllowedError` / `undefined`、および `window.localStorage` getter の `SecurityError` を注入（通知・位置・カメラ等は一切要求しない仕様） | `AC-20`（Clipboard 拒否時の失敗通知＋手動コピー `<textarea readonly>` 展開）および `AC-16`（`localStorage` 拒否時のインメモリ退避＋バナー表示）で検証 |
| バックグラウンドから復帰 | G4 の人 | モバイル／PC 実機ブラウザでシミュレーション途中・入力途中に別タブ切替・OS バックグラウンド遷移後にタブへ復帰する | ブラウザ最小化・OS バックグラウンド復帰時の Web Audio コンテキスト復帰や画面手触りは実機ブラウザ固有のため G4 の人が確認する（ページ再読み込みによる状態復元は `AC-3`・`AC-14`・`AC-15` で自動検証） |
| 言語と地域（ja、en） | 自動 | `playwright.config.ts` の既定 `locale: 'ja-JP'` と、共通ヘッダーの `header-lang-en` / `header-lang-ja` 切替操作 | `AC-1`（`ja` 既定表示 → `EN` 切替での `<title>`・ナビ文言切替 → `JA` 復帰）で自動検証し、G3 で英語状態のスクリーンショットも撮影する |
| 大きい文字、ダークモード | 自動 | ビューポート `320px` / `1280px` × ルート文字サイズ `100%` / `200%`、`emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })` | `AC-18`（4表示条件×全4画面の横はみ出し `0px`・`>= 24x24px`・ライト／ダーク両方の axe 違反 `0件`）および `AC-17`（動き軽減時シェイク `0px`・`<= 1.0s`）で検証 |
| 容量不足、電話などの割り込み | 自動 | `window.localStorage` アクセス例外注入によるストレージ保存不能状態の再現（実機電話着信は iOS ネイティブ非該当のためモバイル Web 実機は G4 補完） | `AC-16`（ストレージ例外時の未捕捉例外 `0件`・インメモリ状態保持退避・`storage-fallback-banner` 1件表示）で自動検証 |

## 4. テストのつなぎ口と接続先
テストが状態を作るために使うもの。すべて `contracts/` に定義済みであり、不足は `0件`。

| 何（初期化、データの投入、接続先、時刻の固定） | 名前（launch argument、環境変数、API） | contracts/ の場所 |
|---|---|---|
| ローカル配信接続先とヘルスチェック | `PLAYWRIGHT_BASE_URL`（既定 `http://127.0.0.1:4173`）、`GET /__health`（常時 `200 "ok"`）、未ビルド時他パス `404`、ビルド済時 SPA フォールバック＋安全ヘッダー5種 | `contracts/arcade-test-seam.md` 第8章 |
| URL ルーティングと全154 DOM 識別子 | `/`, `/combinator?stage=1..10`, `/fermi?stage=1..9`, `/diagnostic`、および `data-testid` 全60項目（展開154識別子） | `contracts/arcade-test-seam.md` 第1章、`design/001-arcade-core.md` 第6章 |
| 公開読み取り専用テスト API | `window.__ARCADE_TEST_API__`（`getSimulationSnapshot`, `auditAllStages`, `getAudioState`, `getPersistedState`, `getStorageStatus`, `getDiagnosticProfile`, `getEmittedEvents`） | `contracts/arcade-test-seam.md` 第2章、`contracts/openapi.yaml` `ArcadeTestApiContract` |
| 全19ステージ確定カタログと数理規則 | モード1全10ステージ順列・パラメータ・スコア確定値、モード2全9ステージ仮説カード・基準値・4判定確定値 | `contracts/arcade-test-seam.md` 第3章、`contracts/openapi.yaml` `CombinatorStageDefinition` / `FermiStageDefinition` |
| Web Audio 状態読み取りとミュート制御 | `window.__ARCADE_TEST_API__.getAudioState()`、`header-sound-toggle`（`data-sound-state="on\|off"`） | `contracts/arcade-test-seam.md` 第4章、`contracts/openapi.yaml` `AudioStateSnapshot` |
| 履歴シード投入・ストレージ例外／破損注入 | `window.localStorage['logic_arcade_state_v1']`、`addInitScript` による `SecurityError` 注入・破損 JSON 注入 | `contracts/arcade-test-seam.md` 第5章、`contracts/openapi.yaml` `PersistedArcadeStateV1` / `StorageStatus` |
| Clipboard 成功捕捉・書き込み拒否注入 | `navigator.clipboard.writeText` スパイラッパーおよび `NotAllowedError` / `undefined` 注入 | `contracts/arcade-test-seam.md` 第6章、`contracts/openapi.yaml` `ShareResultState` |
| アニメーション・トースト時間制御 | Playwright `page.clock.install()` / `page.clock.fastForward()` 互換タイマー、モーション時間定数 | `contracts/arcade-test-seam.md` 第7章、`design/tokens.json` `motion.*` |

## 5. 動かすコマンドと設定
受け入れテストは、受け入れテストのフォルダ（`web/tests/acceptance/`）の中の設定だけで動かす。
- iOS：非該当（`.claude/org/app.json` の `stacks` に `ios` がない Web 専用アプリ）
- Web：`cd web/tests/acceptance && npx playwright test`（設定は `web/tests/acceptance/playwright.config.ts`。`retries: 0`、project は `chromium`、`firefox`、`webkit` の3エンジン、`trace: 'retain-on-failure'`、出力先は `../../test-results` と `../../playwright-report`）
- バックエンド：非該当（`001-arcade-core` はブラウザ単体完結であり、`contracts/openapi.yaml` の `paths` は空オブジェクト `0件`）
- 静的型検査：`cd web/tests/acceptance && npx tsc --noEmit`
- 判定の実行では再試行を付けない（`--retries=0` 固定）。
- 揺れの確認：Web は `cd web/tests/acceptance && npx playwright test --repeat-each=5 --retries=0`。

## 6. 探索のチャーター
影響「大」のリスク（R1〜R5）ごとに1本。G3 で行い、結果は `verification.md` の8章に書く。

| リスク | チャーター（<対象> を <手段や条件> で探り、<知りたいこと> を見つける） | 区切り（30分か40操作） |
|---|---|---|
| R1 | モード1『3-ACT COMBINATOR』の `STEP` 一時停止・スロット差し替え・`RUN` 実行・ステージ切り替えを、再生中連打や `STEP 2/3` 途中でのモジュール解除／別ステージ移動を交えて探り、古いパラメータの残留や試行回数（$R_1, K_1$）の二重加算・不整合が起きないかを見つける | 30分か40操作 |
| R2 | モード2『FERMI BLASTER』の仮説カード選択解除・同スロット別カード切り替え・`FIRE` 連打・`RESET` 直後の再選択を、罠カード複数選択や境界付近の組み合わせで探り、式プレビュー・対数誤差判定・罠解説ハイライトの食い違いが起きないかを見つける | 30分か40操作 |
| R3 | 『思考力診断カルテ』の5軸スコア・認定ランク・共有コピーを、初回1発クリア後の同ステージ再失敗／再クリアや `JA`/`EN` 言語切替直後のコピー実行で探り、初回クリア効率（$a_s$）の上書きバグや共有サマリー文字列の言語・数値ズレが起きないかを見つける | 30分か40操作 |
| R4 | オフライン状態・ブラウザの「戻る／進む」・URL 直接書き換え（`?stage=0`, `?stage=abc`, `/unknown`）・複数タブ同時プレイを組み合わせて探り、履歴の巻き戻りや未捕捉 JS 例外・コンソールエラーが発生しないかを見つける | 30分か40操作 |
| R5 | 幅 `320px × 文字拡大 200%`・ダークモード・英語（`EN`）表示の組み合わせで全4画面とエラー／解説展開時の長文折り返しをキーボード操作で探り、文字切れ・フォーカス見失い・押下不能要素が生じないかを見つける | 30分か40操作 |

## 7. 画面で確かめるもの
自動のテストとあわせて G3 でスクリーンショットを `docs/verification/001-arcade-core/evidence/` に撮り、視覚品質と5通り表示を確かめる。

| AC | 手順 | 撮るスクリーンショットのファイル名 |
|---|---|---|
| AC-1, AC-18 | 画面1（`/`）通常状態をライト・ダーク・文字拡大200%・英語・スマホ幅320pxの5通りで表示して撮影する | `lobby_normal_light.png`, `lobby_normal_dark.png`, `lobby_normal_zoom200.png`, `lobby_normal_en.png`, `lobby_normal_mobile.png` |
| AC-2, AC-3, AC-18 | 画面2（`/combinator`）通常状態および `STAGE CLEAR` 状態を5通り＋クリア状態で撮影する | `combinator_normal_light.png`, `combinator_normal_dark.png`, `combinator_normal_zoom200.png`, `combinator_normal_en.png`, `combinator_normal_mobile.png`, `AC3_STAGE_CLEAR.png` |
| AC-6 | 画面2で途中制約違反（`CRASHED`）と完走未達（`FAILED`）を発生させ、デバッグログ3項目の表示を撮影する | `AC6_CRASHED.png`, `AC6_FAILED.png` |
| AC-7, AC-8, AC-9, AC-18 | 画面3（`/fermi`）通常状態5通り、および `FIRE` 後のオーダー判定＋因数分解・罠解説パネルを撮影する | `fermi_normal_light.png`, `fermi_normal_dark.png`, `fermi_normal_zoom200.png`, `fermi_normal_en.png`, `fermi_normal_mobile.png`, `AC9_解説表示.png` |
| AC-10, AC-11, AC-18 | 画面4（`/diagnostic`）ランク解放状態を5通り＋コピー完了トースト表示で撮影する | `diagnostic_normal_light.png`, `diagnostic_normal_dark.png`, `diagnostic_normal_zoom200.png`, `diagnostic_normal_en.png`, `diagnostic_normal_mobile.png`, `AC11_コピー完了通知.png` |
| AC-12 | 画面4の認定ランク未解放（`UNRANKED`）状態を開いて撮影する | `AC12_UNRANKED.png` |
| AC-16 | `localStorage` 例外注入状態で起動し、`storage-fallback-banner` 表示を撮影する | `AC16_ストレージ退避バナー.png` |
| AC-20 | Clipboard 拒否注入状態でコピー共有ボタンを押し、失敗通知と手動コピー `<textarea readonly>` 展開を撮影する | `AC20_手動コピー展開.png` |

## 8. 赤の証拠（実装の前に落ちたこと）
- ログ：`docs/verification/001-arcade-core/evidence/red.log`
- 実行したコマンドと終了コード：`cd web/tests/acceptance && FORCE_COLOR=0 CI=1 npx playwright test`（終了コード：`1`、全66件実行＝22テスト × 3プロジェクト、成功 `0件`、失敗 `66件`、スキップ `0件`）
- 落ちた理由（1行）：Web 本体（`web/dist/index.html`）が未実装のためローカル配信サーバーが全画面パスに HTTP `404`（`Expected: 200, Received: 404`）を返して失敗した（なお macOS 実行サンドボックス環境では `chromium` 22件・`webkit` 22件が本物ブラウザで HTTP `404` を確認し、`firefox` 22件はサンドボックスのプロファイル作成制限 `Could not find profile folder` で停止）。

## 9. 範囲の外
- バックエンド HTTP API の受け入れテストおよび Schemathesis ファジング：`001-arcade-core` はサーバー通信 `0件` のブラウザ単体完結構成（PRD 10章、`contracts/openapi.yaml` の `paths: {}`）のため対象外。
- 前の版からのデータ移行テスト：初回機能であり前のリリース版が存在しないため対象外（将来の v2 スキーマ変更時に実施）。
- 本番ホスティング環境での実測 RUM・OGP クローラ表示・外部送信公表文面監査：G4 / G5（`/release`）関門の対象。

## 確かめ（提出前に verifier が印を付ける。reviewer はこれを信じずに確かめる）
- [x] 読んだファイルが PRD、design/、contracts/ だけで、冒頭に全部並んでいる。
- [x] PRD のすべての AC 番号が、2章とテストの名前にある。AC のないテストがない。
- [x] 2章の全行に、技法、試す値、具体的な値の結果がある。「正しく」「適切に」だけの結果がない。
- [x] 影響「大」のリスクのすべてに、自動テスト、3章の行、6章のチャーターがある。
- [x] 3章の9行すべてに選んだものがあり、範囲外には理由がある。
- [x] 4章のつなぎ口がすべて contracts/ にあるか、「未解決」に依頼として書いた。
- [x] 受け入れテストのフォルダで、sleep、skip、xfail、XCTExpectFailure、retry、@testable import が0件（grep のコマンドと件数を報告に書いた）。
- [x] 8章の赤の証拠があり、落ちた理由が書き間違いではなく「機能がまだない」こと。
