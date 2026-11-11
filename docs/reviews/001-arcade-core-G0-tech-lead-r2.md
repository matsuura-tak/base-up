PASS

## 指摘
なし

## 前回の指摘の追跡
| 前回の指摘 | 直った / 直っていない | 証拠 |
|---|---|---|
| `tech-lead-r1` 指摘1（要修正）：12章「非機能要件」の一部行に具体的な数値基準と測り方の組が不足 | 直った | `docs/prd/001-arcade-core.md:276-280` の全5項目（速さ・オフライン／通信エラー・セキュリティ／プライバシー・アクセシビリティ・言語）すべてに定量基準値と検証手段（Playwright Navigation Timing / `performance.now()` / Lighthouse / 本番 RUM、`context.setOffline(true)`・`page.route` abort、`context.cookies()`・外部オリジン通信 `0件`・G4 `curl -sI`、`@axe-core/playwright` 違反 `0件`・4条件横はみ出し `0px`・キーボード完走率 `100%`、`ja`/`en` 辞書キー差分 `0件`）が明記された |
| `tech-lead-r1` 指摘2（要修正）：15章イベントのプロパティ定義および18章 `Q-2` 選択肢と、13章 KPI・14章撤退基準のクライアント単体（Cookie レス）計測可能性の不整合 | 直った | `docs/prd/001-arcade-core.md:287-290, 303-315` で各イベントに `localStorage`＋セッションメモリから算出する重複排除・コホート用 boolean（`is_first_visit`, `is_first_exec_in_session`, `within_60s`, `is_first_7d_return_play`, `is_first_ever_clear`, `is_first_visit_session`, `is_first_qualified_in_session`, `is_first_copy_in_session`, `is_first_error_in_session`）が追加され、334行 `Q-2` 案1がカスタムイベント対応無料基盤（Umami Cloud Hobby / Cloudflare Workers Analytics Engine Free＋RUM 用 Cloudflare Web Analytics）へ更新され、案2選択時の 13・14章判定手段見直し注記も明記された |
| `tech-lead-r1` 指摘3（要修正）／`verifier-r1` 指摘1（重大）：`AC-10`〜`AC-12` の認定ランク解放条件の空白・矛盾、および5軸スコア算出式・ランク境界閾値の欠落 | 直った | `docs/prd/001-arcade-core.md:123-133` に「思考力診断カルテの算出規則」表が新設され、5軸すべての `Math.round` 算出式・ゼロ除算回避境界条件（$C_1=0$ / $C_2=0$ 時は `0`）・総合認定ランク閾値（$C_1=0$ または $C_2=0$ は `UNRANKED`、両モード各 `1` 以上クリア時は `90〜100`=`S+`, `80〜89`=`S`, `65〜79`=`A`, `50〜64`=`B`, `0〜49`=`C`）が固定され、`AC-10`（198-203行）・`AC-11`（205-210行）・`AC-12`（212-217行：履歴 `0件`・失敗のみ・片モードのみクリアをすべて網羅）が一意に統一された |
| `tech-lead-r1` 指摘4（提案）／`verifier-r1` 指摘4（重大）：`AC-15` の初回起動時既定値（`SOUND ON` / `OFF`）未定義、および `SOUND ON` 実行時の Web Audio シンセ発音検証の欠落 | 直った | `docs/prd/001-arcade-core.md:100, 233-238` で初回未保存時の既定状態を `SOUND ON`（操作前の自動再生 `0回`）と明記し、`SOUND ON` 実行時の Web Audio API シンセ発音 `1回以上`・外部音声リクエスト `0件`・`SOUND OFF` 切替後のマスター出力ゲイン `0`・リロード後の `SOUND OFF` 維持が定義された |
| `tech-lead-r1` 指摘5（提案）：`.claude/org/app.json` の `stacks` にある `"backend"` とブラウザ単体完結方針の整理 | 直った | `docs/prd/001-arcade-core.md:336`（18章 `Q-4`）に、`001-arcade-core` は `web/` のみで進め今後の方針確定時に Takuma が `stacks` を更新するかの確認項目が追加された |
| `verifier-r1` 指摘2（重大）：`AC-9` の主観形容詞「妥当な」の残存、およびモード2全9ステージの正解・罠カード存在保証の欠落 | 直った | `docs/prd/001-arcade-core.md:194` で「ステージ定義の基準因数分解式（`ACT 1 × ACT 2 × ACT 3` の式表記）と解説文（`1文字以上`）」「当該ステージに含まれる罠カード名（`1件以上`）と罠である理由（`1文字以上`）」に改められ、さらに `AC-19`（261-266行）として全 `9ステージ` で `PERFECT ORDER` が `1通り以上` かつ全組み合わせの `50%以下`・罠カード `1枚以上` を網羅検証する条件が追加された |
| `verifier-r1` 指摘3（重大）：`AC-13` の `disabled` と押下後警告の OR 記述、およびモード1 `STEP` ボタンの抑止対象漏れ | 直った | `docs/prd/001-arcade-core.md:219-224` で未配置 `1つ以上` のときにモード1の `RUN`・`STEP` 両ボタンおよびモード2の `FIRE` ボタンがすべて `disabled` 属性で非活性となり、かつ未配置スロット識別子を含む案内文 `1件` 表示・再生開始および試行回数加算 `0回` と単一仕様に確定された |
| `verifier-r1` 指摘5（重大）：`AC-18` の `Then` における文字拡大率 `200%` 時のビューポート幅と合格基準の欠落 | 直った | `docs/prd/001-arcade-core.md:254-259` で幅 `320px`×`100%`、幅 `1280px`×`100%`、幅 `1280px`×`200%`、幅 `320px`×`200%` の4条件すべてで横はみ出し幅 `0px`・全操作要素 `24x24px` 以上・重なり押下不能 `0件` と明記された |
| `verifier-r1` 指摘6（要修正）：`AC-11` に関連するクリップボード書き込み権限拒否・例外時の代替挙動の欠落 | 直った | `docs/prd/001-arcade-core.md:268-273` に `AC-20` が新設され、`navigator.clipboard` 未定義または `writeText` 例外送出時に未捕捉 JS 例外 `0件`・失敗通知 `1件`・認定ランクと5軸名称および整数スコアを含む手動コピー用テキスト領域の表示が定義された |
| `verifier-r1` 指摘7（要修正）：`AC-5` の `RESET` 後スロット維持有無の未記載、および `AC-6` の `CRASHED` / `FAILED` 1対1対応の未明示 | 直った | `docs/prd/001-arcade-core.md:166`（`AC-5`）で `RESET` 後 `0.2秒以内` に3スロット配置済みモジュールを維持したままステップ位置 `0`・初期パラメータ・`IDLE` に戻る旨が明記され、`172-173`行（`AC-6`）で途中エネルギー枯渇／暴走上限超過＝`CRASHED`（該当 `STEP 1`〜`3`）・3手完走後ターゲット未達＝`FAILED`（`FINAL CHECK`）の1対1対応が明記された |
| `verifier-r1` 指摘8（提案）：`AC-16` の `window.localStorage` getter 例外・破損 JSON フォールバックと、18章 `Q-3` の G3 英語検証基準との整合説明 | 直った | `docs/prd/001-arcade-core.md:240-245`（`AC-16`）で `window.localStorage` getter 参照例外・`getItem`/`setItem` 例外時のインメモリ退避＋通知 `1件` および破損 JSON 破棄再記録が明記され、`335`行（`Q-3`）で `docs/org/gates.md` G3 の5通りスクリーンショット基準との適合関係が明記された |

## 証拠
- 対象：`main...HEAD`（`371348a...dd85da9`、r1 からの修正差分 `84f6db5...dd85da9`、ブランチ `feat/001-arcade-core`）、観点：G0 2回目（r2）として前回全13指摘の解消確認・新規追加／更新された `AC-1`〜`AC-20` および5軸算出式／ランク閾値表の技術実現性と数理整合性・新規追加 URL を含む全 URL 実在確認・非機能要件・イベント計測整合性・月額費用・「G0 の前の確認」全項目検証
  - `git diff --name-only main...HEAD` の一覧と読んだ印：
    - [x] `docs/prd/001-arcade-core.md`（全356行を読了・検証）
    - [x] `docs/prd/product.md`（全59行を読了・検証）
    - [x] `docs/progress.md`（全13行を読了・検証）
    - [x] `docs/reviews/001-arcade-core-G0-tech-lead-r1.md`（全51行を読了・照合）
    - [x] `docs/reviews/001-arcade-core-G0-verifier-r1.md`（全49行を読了・照合）

### 1. 前回（r1）全指摘の技術検証サマリー表
| 指摘 ID | 対象箇所（r2 行番号） | 技術・数理面の再検証結果 |
|---|---|---|
| `tech-lead-r1` #1 | `12章`（276-280行） | 全5項目に数値閾値と自動計測手段（Playwright / Lighthouse / RUM / `@axe-core/playwright` / 辞書キー差分テスト）が揃い、測り方のない行 `0件` |
| `tech-lead-r1` #2 | `13〜15章`（285-315行）・`18章 Q-2`（334行） | 13章の全4 KPI と 14章の全4撤退基準（初回カルテ到達率・60秒以内初回実行率・7日再訪率・カルテ表示者コピー率・エラー発生セッション率・CWV 達成率）が、Cookie レスかつクライアント発火イベントの boolean プロパティ集計のみで過不足なく算出可能であることを検算確認 |
| `tech-lead-r1` #3 / `verifier-r1` #1 | `11章 算出規則`（123-133行）・`AC-10〜12`（198-217行） | Node.js v24.22.1 で `Math.round` 実装を検算し、$C_1=0, R_1=0, C_2=0, F_2=0$ でのゼロ除算 `0件`、全5軸の値域 `[0, 100]` 収束、`0..100` 全整数の隙間・重複なきランク被覆、および `UNRANKED` / `C` / `B` / `A` / `S` / `S+` の全6段階が実プレイ履歴から到達可能であることを確認 |
| `tech-lead-r1` #4 / `verifier-r1` #4 | `AC-15`（233-238行） | 初回既定 `SOUND ON`（ユーザー操作前自動再生 `0回`）と操作時の `AudioContext` シンセ発音 `>= 1`・`SOUND OFF` 時のマスターゲイン `0` が Autoplay ポリシーと矛盾なく実装・自動検証可能 |
| `tech-lead-r1` #5 | `18章 Q-4`（336行） | `.claude/` 変更権限（Takuma のみ）を守りつつ `001-arcade-core` を `web/` 単体で進める運用と一致 |
| `verifier-r1` #2 | `AC-9`（191-196行）・`AC-19`（261-266行） | 11章全体の曖昧形容詞スキャン `0件`、Node.js ベンチマークで `AC-19` 全9ステージ最大 `576` 組み合わせ検証が `0.156 ms` で完了することを確認 |
| `verifier-r1` #3 | `AC-13`（219-224行） | `RUN` / `STEP` / `FIRE` の `disabled` 制御＋未配置スロット識別子案内文表示に一本化され、標準 HTML `disabled` 属性で実装可能 |
| `verifier-r1` #5 | `AC-18`（254-259行） | `320px`/`1280px` × `100%`/`200%` の4条件すべてが CSS Grid/Flexbox・`rem` 単位・Canvas/SVG コンテナ幅追従（`max-width: 100%`）で実現可能 |
| `verifier-r1` #6 | `AC-20`（268-273行） | `navigator.clipboard?.writeText` の `try/catch` で `NotAllowedError` / 未定義を捕捉し `<textarea readonly>` 等の手動コピー領域を展開する標準 DOM 実装で実現可能 |
| `verifier-r1` #7 | `AC-5`（163-168行）・`AC-6`（170-175行） | ステートマシン（`IDLE` / `STEPPING` / `RUNNING` / `STAGE_CLEAR` / `CRASHED` / `FAILED`）の純粋関数遷移として一意に実装可能 |
| `verifier-r1` #8 | `AC-16`（240-245行）・`18章 Q-3`（335行） | `window.localStorage` プロパティ参照自体を `try/catch` で包む Storage アダプタ＋`JSON.parse` 例外時の初期化で安全に実装可能 |

### 2. 全受け入れ条件（`AC-1`〜`AC-20`・5軸算出式・ランク閾値表）ごとの実現性の表
| AC 番号 / 規則 | 判定 | 根拠の URL かコマンド |
|---|---|---|
| 11章 5軸算出式・ランク閾値表（123-133行） | 今の構成で作れる | 標準 JS `Math.round` / `Math.max` のみで算出可能。`node -e` による検算（コマンド4）でゼロ除算 `0件`・値域 `0..100`・全6ランク（`UNRANKED`, `C`〜`S+`）到達を確認済み |
| AC-1（初期表示1.0秒以内・迷路クローンでない3導線） | 今の構成で作れる | 静的 HTML/CSS/TS 初期バンドル配信で外部通信なしに即時描画可能。Core Web Vitals 基準：https://web.dev/articles/vitals |
| AC-2（モード1全10ステージ選択・5〜7モジュール・4属性表示） | 今の構成で作れる | クライアント内蔵の型付きステージ定義データ（10件）と標準 DOM レンダリングで実装可能 |
| AC-3（モード1 `RUN` 3.0秒以内アニメーション再生・`STAGE CLEAR` 記録） | 今の構成で作れる | HTML5 Canvas 2D API / `requestAnimationFrame` で実装可能。仕様：https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API |
| AC-4（モード1全10ステージ全順列 `P(n,3)` 解存在・50%以下・ステージ8〜10非自明性保証） | 今の構成で作れる | 最大 `10 × (7×6×5) = 2,100` 通りの全順列網羅検証は Node.js v24.22.1 実測で `2.713 ms` で完了（コマンド4） |
| AC-5（モード1 `STEP` 1手一時停止・試行回数非加算・`RESET` 0.2秒以内スロット維持初期化） | 今の構成で作れる | 1ステップごとの純粋状態遷移関数で `currentStep` とスロット配列を分離保持することで即時（`< 1 ms`）リセット可能 |
| AC-6（モード1 `CRASHED` / `FAILED` 区分とデバッグログ3項目表示） | 今の構成で作れる | 各ステップ評価時に `energy < 0`・暴走上限超過を判定して中断（`CRASHED`）、3手完走後の目標未達を `FAILED`（`FINAL CHECK`）として構造化ログを返す設計で実装可能 |
| AC-7（モード2全9ステージ構成・3スロット各3〜4枚の仮説カード選択） | 今の構成で作れる | 初級3・中級3・上級3の静的ステージ定義データと選択 UI（自由入力欄なし）で実装可能 |
| AC-8（モード2 `FIRE` 3.0秒以内演出・`Math.log10` 4段階オーダー判定・クリア記録） | 今の構成で作れる | 標準 `Math.log10` と Canvas 2D / SVG アニメーションで実装可能。仕様：https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API |
| AC-9（モード2 基準値比較・基準因数分解式解説・罠カード解説・`RESET` 0.2秒以内スロット初期化） | 今の構成で作れる | ステージ定義内の基準式・解説文・罠カード配列の描画と選択状態の空初期化で即時応答可能 |
| AC-10（思考力診断カルテ 5軸整数スコア・5角形レーダーチャート・`S+`〜`C` ランク表示・共有ボタン活性） | 今の構成で作れる | 123-133行の確定算出式とインライン `<svg><polygon>`（または Canvas 2D）による正五角形極座標描画で外部チャートライブラリなしに実装可能 |
| AC-11（診断カルテ結果サマリーテキストのクリップボード書き込み・2.0秒以上完了通知） | 今の構成で作れる | 標準 Clipboard API `navigator.clipboard.writeText()` で実装可能。仕様：https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText |
| AC-12（履歴0件・失敗のみ・片モードクリア時の `UNRANKED`・共有 `disabled`・未クリアモード開始導線） | 今の構成で作れる | $C_1 = 0 \lor C_2 = 0$ 条件分岐により未クリア側軸スコア `0`・クリア済側軸スコア算出・開始ボタン描画を一意に制御可能 |
| AC-13（スロット未充足時の `RUN` / `STEP` / `FIRE` ボタン `disabled` 化と未配置スロット案内文表示） | 今の構成で作れる | スロット配列の未選択要素検出から HTML `disabled` 属性と不足スロット名リストをリアクティブに導出可能 |
| AC-14（初期読み込み後の完全オフライン動作と `localStorage` 永続化） | 今の構成で作れる | 全19ステージと合成音ロジックを初期バンドルに同梱し外部通信 `0件` で完結。仕様：https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage 、テスト API：https://playwright.dev/docs/api/class-browsercontext#browser-context-set-offline |
| AC-15（初回既定 `SOUND ON`・Web Audio API シンセ発音・常設ミュート切替・`localStorage` 保持） | 今の構成で作れる | `AudioContext` + `OscillatorNode` + `GainNode` をユーザー操作イベント内で起動／制御し外部音声アセット `0件` で実装可能。仕様：https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API |
| AC-16（`window.localStorage` getter 例外・`getItem`/`setItem` 例外・破損 JSON 時の安全な退避） | 今の構成で作れる | `window.localStorage` アクセス全体を `try/catch` で包む Storage ラッパーとインメモリ fallback + 警告バナー表示、および `JSON.parse` 失敗時の初期状態リセットで実装可能 |
| AC-17（`prefers-reduced-motion: reduce` 時のシェイク変位 `0px`・1.0秒以内短縮再生） | 今の構成で作れる | CSS `@media (prefers-reduced-motion: reduce)` と `window.matchMedia('(prefers-reduced-motion: reduce)')` による振幅 `0`・再生時間短縮で実装可能。仕様：https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion |
| AC-18（`320px`/`1280px` × 文字拡大 `100%`/`200%` の4条件で横はみ出し `0px`・全操作要素 `24x24px` 以上） | 今の構成で作れる | CSS Grid/Flexbox・`rem` 基準タイポグラフィ・`min-width: 24px; min-height: 24px` で実装可能。基準：https://www.w3.org/WAI/WCAG22/Understanding/reflow.html , https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html |
| AC-19（モード2全9ステージ全組み合わせ網羅検証：`PERFECT ORDER` 1通り以上かつ50%以下・罠カード1枚以上） | 今の構成で作れる | 最大 `9 × (4×4×4) = 576` 通りの網羅検証は Node.js v24.22.1 実測で `0.156 ms` で完了（コマンド4） |
| AC-20（`navigator.clipboard` 未定義・`writeText` 例外時の失敗通知1件と手動コピー用テキスト領域表示） | 今の構成で作れる | `writeText()` の Promise reject / 未定義判定で失敗通知と選択可能な `<textarea readonly>` フォールバック領域を表示する標準 DOM 制御で実装可能 |

- **「未確認」の件数**：`0件`

### 3. 第1部（1〜8章）および末尾「G0 の前の確認」全12項目の検証表
| # | 確認項目 | 判定 | 証拠（`docs/prd/001-arcade-core.md` の行と検証結果） |
|---|---|---|---|
| 0 | 第1部の分量が約120行以内、1章紹介文が3〜5文で数値比較がある | 満たす | 第1部は 10〜86行の **77行**（<= 120行）。1章（13行）は **3文**で、時間（15〜30分→約2〜3分＝5〜10倍）・価格（¥1,625/月・$34.99/月・¥800→¥0）・登録0秒の数値比較あり（コマンド3） |
| 1 | 3 にアプリが3件以上と、アプリ以外の代替が1つ以上。アプリ全行に URL と不満引用（URL つき） | 満たす | 28〜35行にアプリ・Web サービス **5件**（Brilliant, CodinGame, Human Resource Machine, Quantable, Guesstimate）＋非デジタル代替 **1件**（対策書籍＋紙と手計算）。全5件の URL と引用原文計10箇所を実ページ取得で実在確認済み（コマンド2）。37〜40行に上位3件との1文差別化あり |
| 2 | 根拠のすべてに印があり、［推測］だけで支えた結論がない。出典 URL が3つ以上 | 満たす | 全文で［実データ］［公開情報 URL］［推測］が付与され、ユニーク出典 URL は **19件**（`product.md` 含め **20件**、すべて HTTP 200 確認済み）。8章推奨も公開情報と初期要件に支えられている |
| 3 | Job ストーリーが1つで、2 の文に画面名や機能名が入っていない | 満たす | 16行に Job ストーリー1文のみ。モード名・画面名・UI 部品名の混入 `0件` をスクリプトで確認済み（コマンド5） |
| 4 | 機会と解決案がそれぞれ3つ以上あり、選んだ理由と捨てた理由がある | 満たす | 51〜55行に機会 **3件**（`O-1`〜`O-3`）と選択理由、57〜62行に解決案 **4件**（`S-1` 採る、`S-2`〜`S-4` 捨てる）と各理由あり |
| 5 | 6 の全行と 7 の5行が埋まり、7 の各行に結び付けた先がある | 満たす | 65〜71行（価値・使いやすさ・実現性・事業性・害の全5行、69行は全19ステージへ更新済み）がすべて埋まり、73〜80行の事前検死 **5行**すべてが `AC-4`, `AC-8`, `AC-9`, `AC-11`, `AC-15`, `AC-17`, `AC-18`, `AC-19`, `AC-20`, 10章, 14章撤退基準に結び付いている |
| 6 | 8 に推奨、いちばん強い反論、作らない場合が書いてある | 満たす | 83〜85行に3項目すべて明記 |
| 7 | 9 のやることのすべてに Kano 分類と効く機会があり、無関心と逆効果がない | 満たす | 92〜101行の全 **8行**に Kano 分類（当たり前／性能／魅力［推測］）と `O-1`〜`O-3` があり、無関心・逆効果 `0件`（コマンド5）。103〜106行に RICE で削った3候補と理由あり |
| 8 | 10 のやらないことが1つ以上あり、すべてに理由がある | 満たす | 110〜114行に非目標 **5件**があり、すべて1行ずつ理由が明記されている |
| 9 | すべての AC に Given, When, Then, 確かめ方, 効く機会があり、数字のない形容詞がない | 満たす | 135〜273行の全 **20件**（`AC-1`〜`AC-20`）に5要素すべてが存在し、曖昧形容詞スキャン検出 **0件**（コマンド3） |
| 10 | 13 にガードレールが1つ以上あり、主の指標が見かけの指標でない。全行に基準値の出典と判定日がある | 満たす | 285〜290行に主指標2件（初回訪問での診断カルテ到達率、7日以内再訪プレイ率：いずれも PV 等の見かけ指標でない）＋ガードレール **2件**（エラー発生セッション率、CWV 達成率）。全4行に基準値・出典 URL・判定日あり |
| 11 | 14 の全行に、数値、日付、取る行動、判定する役（pdm 以外）がある | 満たす | 295〜300行の全 **4行**に数値閾値、判定日、行動、判定役（`tech-lead`, `verifier`, `reviewer`：すべて `pdm` 以外）が明記されている |
| 12 | 15 のイベントのすべてにプライバシー表示の区分がある | 満たす | 305〜315行の全 **9イベント**すべてにデータ種別・Cookie 不使用・開発時送信0件・本番匿名解析時の扱い・同意不要・外部送信公表記載の区分が明記され、すべてブラウザ側（クライアント）で取得可能 |

### 4. Web 公開・権限・ブラウザ制約で気になる点（G1 設計への引き継ぎ事項）
1. **Web Audio API の Autoplay 制限とテスト観測口（`AC-15`）**：ブラウザ仕様によりユーザー操作前の自動発音は不可のため、初回クリック／キー操作ハンドラ内で `AudioContext` の生成または `resume()` を行い、G1 の契約でヘッドレス検証用の音声状態読み取り口（`soundEnabled`, `masterGainValue`, `synthTriggerCount`）を定義する。
2. **`localStorage` 例外・破損耐性（`AC-14`, `AC-16`）**：`window.localStorage` getter 参照自体を `try/catch` で包むアダプタを設け、`SecurityError` / `QuotaExceededError` 時はインメモリ保持＋画面通知1件、`JSON.parse` 失敗時は初期スキーマへフォールバックする。
3. **Clipboard API の権限拒否フォールバック（`AC-11`, `AC-20`）**：クロスブラウザ（Chromium / Firefox / WebKit）および非許可コンテキストでも確実に検証できるよう、`writeText()` 成功時の通知と reject / 未定義時の手動コピー領域表示の両方を G1 の画面状態・識別子契約に含める。
4. **完全オフライン動作（`AC-14`）**：初期ロード後の動的 `import()` チャンク分割や外部 Web フォント／音声 URL 参照を禁止し、単一バンドル内に全19ステージ定義・日英辞書・合成音ロジックを完結させる方針を G1 の「Web の土台」ADR に明記する。
5. **電気通信事業法の外部送信規律（15章・17章・18章 `Q-2`）**：`001-arcade-core` 実装・G3 時点では外部送信 `0件` とし、G5 本番公開で匿名解析を接続する場合は `docs/support/` に送信先・送信項目・利用目的を公表する。

### 5. 利用者 1,000 人あたりの月額費用の見積もり
- **利用者 1,000 人あたり月額 $0（約 ¥0/月）**
  - ホスティング：Cloudflare Pages Free プラン **$0/月**（静的アセット配信リクエスト無制限・帯域幅無料：https://developers.cloudflare.com/pages/functions/pricing/ ）
  - バックエンド API・DB・外部生成 AI / 音声 API：**$0/月**（不使用・ブラウザ内完結）
  - 匿名イベント解析・RUM（G5 で 18章 `Q-2` 案1採用時）：**$0/月**（利用者1,000人 × 月3セッション × 約15イベント ≒ 月45,000イベントに対し、Cloudflare Workers Analytics Engine Free 枠 100,000 データポイント/日 https://developers.cloudflare.com/analytics/analytics-engine/pricing/ 、Umami Cloud Hobby 無料枠 100,000 イベント/月 https://umami.is/pricing 、Cloudflare Web Analytics RUM 無料枠 https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/ のいずれも無料枠内で完結）

- 読んだファイル：
  - `.claude/skills/craft-tech-lead/SKILL.md`
  - `.claude/skills/craft-tech-lead/web.md`
  - `.claude/org/app.json`
  - `CLAUDE.md`
  - `docs/idea-seed.md`
  - `docs/prd/product.md`
  - `docs/prd/001-arcade-core.md`
  - `docs/reviews/001-arcade-core-G0-tech-lead-r1.md`
  - `docs/reviews/001-arcade-core-G0-verifier-r1.md`
  - `docs/org/gates.md`
  - `docs/templates/review-report.md`
  - `docs/templates/prd.md`
  - `docs/progress.md`
  - `contracts/dependencies.md`
- 実行したコマンドと結果：
  1. `git status --short && git log --oneline -n 6 && git diff --name-only main...HEAD && git diff --name-only 84f6db5...dd85da9` → HEAD は `dd85da9`、r1（`84f6db5`）からの PRD 更新差分は `docs/prd/001-arcade-core.md` のみであることを確認。
  2. `python3` + `curl -sL` による全 URL 疎通および引用照合検査 → `docs/prd/001-arcade-core.md`・`docs/prd/product.md` 内の全20 URL（新規追加の `https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/` を含む）および料金根拠3 URL・Web 標準仕様8 URL の **計31 URL すべてが HTTP 200** で応答。競合5件の引用原文10箇所すべてが実ページ内に `FOUND`、Cloudflare Web Analytics Dimensions 公式ページでも固定ディメンションのみでカスタムイベント記載がないことを確認。
  3. `python3` による PRD 構造・曖昧語・AC 網羅検査 → 第1部は `77行`（<= 120行）、1章紹介文 `3文`、`AC-1`〜`AC-20` 連番欠落なし・全20件に `Given`/`When`/`Then`/`確かめ方`/`効く機会` 完備、曖昧形容詞検出 `0件` を確認。
  4. `node -e`（Node.js `v24.22.1`）によるソルバー計算量ベンチマークおよび5軸算出式検算 → `AC-4`（全10ステージ最大 `2,100` 順列）実測 `2.713 ms`、`AC-19`（全9ステージ最大 `576` 組み合わせ）実測 `0.156 ms`。5軸 `Math.round` 式のゼロ除算 `0件`・値域 `0..100`・ランク閾値 `0..100` 完全1対1被覆・全6ランク（`UNRANKED`, `C`, `B`, `A`, `S`, `S+`）到達を確認。
  5. `python3` による「G0 の前の確認」全12項目自動検査 → 2章 Job ストーリーの機能名・画面名混入 `0件`、機会 `3件`・解決案 `4件`、6章 `5行`・7章 `5行`、9章 `8行`（無関心・逆効果 `0件`）、10章非目標 `5件`、13章 KPI `4行`（主2・ガードレール2）、14章撤退基準 `4行`（全行 `pdm` 以外の役）、15章イベント `9行`（全行プライバシー区分あり）を確認。
- 開いた URL と確認した日付（すべて 2026-11-12 に HTTP 200 実在・内容確認済み）：
  - 新規追加 URL：`https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/`
  - 競合・代替・市場出典（19件）：`https://brilliant.org/`, `https://brilliant.org/premium/`, `https://apps.apple.com/jp/app/brilliant-learn-math-coding/id913335252?see-all=reviews`, `https://apps.apple.com/us/app/brilliant-learn-math-coding/id913335252?see-all=reviews`, `https://news.ycombinator.com/item?id=39050606`, `https://www.codingame.com/start/`, `https://news.ycombinator.com/item?id=13784590`, `https://news.ycombinator.com/item?id=11899981`, `https://news.ycombinator.com/item?id=26470452`, `https://apps.apple.com/jp/app/human-resource-machine/id1005098334?see-all=reviews`, `https://apps.apple.com/us/app/human-resource-machine/id1005098334?see-all=reviews`, `https://itunes.apple.com/search?term=Human+Resource+Machine&entity=software&country=JP&limit=3`, `https://www.quantable.io/games`, `https://www.quantable.io/pricing`, `https://www.getguesstimate.com/`, `https://news.ycombinator.com/item?id=18785371`, `https://amplitude.com/blog/7-percent-retention-rule`, `https://mixpanel.com/blog/mobile-gaming-benchmarks-2026/`, `https://web.dev/articles/vitals`
  - 料金・技術仕様根拠（11件）：`https://developers.cloudflare.com/pages/functions/pricing/`, `https://developers.cloudflare.com/analytics/analytics-engine/pricing/`, `https://umami.is/pricing`, `https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API`, `https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API`, `https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage`, `https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText`, `https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion`, `https://www.w3.org/WAI/WCAG22/Understanding/reflow.html`, `https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html`, `https://playwright.dev/docs/api/class-browsercontext#browser-context-set-offline`
- 未検証：なし（0件）

## 記録
- 関門：G0
- 判定した役：tech-lead
- 回：r2
- 対象：`docs/prd/001-arcade-core.md`、`feat/001-arcade-core`、`371348a...dd85da9`（r1 差分 `84f6db5...dd85da9`）
- 日付：2026-11-12
