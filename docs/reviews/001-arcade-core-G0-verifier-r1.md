FAIL

## 指摘
- **重大**、`docs/prd/001-arcade-core.md:186-205`、`AC-10`・`AC-11`・`AC-12`、『思考力診断カルテ』の認定ランク算出条件に空白地帯と食い違いがあり、さらに5軸スコアと認定ランク（`S+`〜`C`）の具体的な算出基準・閾値がないため、実装を見る前にテストの期待値を一意に決められない。具体的には、(1) `AC-12` は「プレイ履歴 `0件`」を `UNRANKED`、`AC-10` は「両モードをそれぞれ `1ステージ以上` クリア」を `S+`〜`C` としている一方、`AC-11`（194行）は「`1ステージ以上` のプレイ履歴があり認定ランクが算出されている」としており、「片方のモードのみクリアした状態」および「ステージを実行したが未クリア（失敗履歴のみ）の状態」で `UNRANKED` になるのか `C`〜`S+` になるのかが矛盾・欠落している（主 KPI の6行目・261行目とも整合確認が必要）。(2) `AC-10`（189行）は「`0` 以上 `100` 以下の整数」「`S+`・`S`・`A`・`B`・`C` のいずれか1つ」とあるだけで総合スコアから各ランクへの境界値やプレイ実績との対応規則がなく、固定値を返すだけのダミー実装でも合否を区別できない。根拠：`docs/org/gates.md:31-36` G0 合格条件（「どの受け入れ条件も、テストか画面の確認で合否を決められる」「Then に具体的な値がない AC は重大」）、`.claude/skills/craft-verifier/SKILL.md:16-26` 1章・2章。直す方向：(1) 認定ランク解放条件を一意に定義し（例：両モード各 `1ステージ以上` クリア達成で `S+`〜`C` を算出し、それ未満の片モードのみクリア・失敗のみの状態は `UNRANKED` かつ未クリアモードへの誘導ボタンを表示する等）、`AC-10`・`AC-11`・`AC-12` の Given/Then を揃える。(2) `AC-10` に総合スコアから `S+` / `S` / `A` / `B` / `C` への数値閾値（例：`90 / 80 / 65 / 50` 等）および5軸スコアがどのプレイ指標（クリア進捗・一発クリア・制約違反有無・対数誤差・罠回避）から算出されるかの基準を明記する。
- **重大**、`docs/prd/001-arcade-core.md:179-184` および `165-177`、`AC-9`（関連：`AC-7`・`AC-8`）、`AC-9` の `Then`（182行）に「**妥当な**因数分解式の解説文」という数値や客観条件で測れない主観形容詞が含まれている。また、モード1には `AC-4`（全10ステージの解存在・非自明性の保証）があるのに対し、モード2の全 `9ステージ` には「各ステージで `PERFECT ORDER`（`|d| <= 0.5` かつ罠カード `0枚`）となる組み合わせが `1通り以上` 存在し、かつ罠カードが `1枚以上` 含まれること」の保証がなく、罠カード `0枚` のステージがあると `AC-9`（「当該ステージに含まれる罠カード名と罠である理由」の表示）が成立しない。根拠：`docs/org/gates.md:36` G0 合格条件、`.claude/skills/craft-verifier/SKILL.md:26` 2章 G0-2、および PRD 326行（「数字のない形容詞がない」）。直す方向：`AC-9` の「妥当な因数分解式の解説文」を「ステージ定義の基準因数分解式（`ACT 1 × ACT 2 × ACT 3`）と解説文（`1文字以上`）」等の客観的項目に改め、`AC-7` または `AC-8` に「全 `9ステージ` すべてにおいて `PERFECT ORDER` となるカード組み合わせが `1通り以上` かつ全組み合わせ数の `50%以下` 存在し、各ステージに罠カードが `1枚以上` 存在する」旨を追加する。
- **重大**、`docs/prd/001-arcade-core.md:207-212`、`AC-13`、`When` が「実行領域を確認**または**押下を試みる」、`Then` が「実行ボタン（`RUN` / `FIRE`）が **`disabled` 属性で非活性であるか**未選択スロット番号を示す警告文を表示し」と2通りの異なる UI 仕様の OR 記述になっており、実装を見る前に Playwright の操作と期待結果（`toBeDisabled()` なのかクリック後の警告文表示なのか）を一意に書けない。さらにモード1の1ステップ検証ボタン（`STEP`、`AC-5`）がスロット未充足時の抑止対象から漏れている。根拠：`docs/org/gates.md:31` G0 合格条件、`.claude/skills/craft-verifier/SKILL.md:16` 1章1。直す方向：未充足時の仕様を1つに確定し（例：「`RUN`・`STEP`・`FIRE` ボタンがすべて `disabled` 属性で非活性となり、かつ未選択スロット番号を示す案内文が表示され、再生開始および試行回数加算が `0回` である」）、モード1の `STEP` も対象に含める。
- **重大**、`docs/prd/001-arcade-core.md:221-226`、`AC-15`、(1) 初回起動時の既定状態（`SOUND ON` か `SOUND OFF` か）が `Given` に定義されていないため、ミュート切替ボタン押下で `SOUND OFF` に切り替わる操作手順が一意に定まらない。(2) `Then` が「外部音声リクエスト `0件`」と「`SOUND OFF` 時の出力ゲイン `0`」のみを検証しており、`SOUND ON` 状態でステージ実行等のユーザー操作を行った際に Web Audio API のシンセ効果音が `1回以上` 発音されることが含まれていないため、音声未実装（常時無音）でも PASS してしまう。根拠：`docs/org/gates.md:31-36` G0 合格条件。直す方向：初回起動時（`localStorage` 未保存時）の既定状態（例：`SOUND ON` だがユーザー操作前は自動再生しない）を明記し、`SOUND ON` での実行操作時に外部音声リクエスト `0件` で Web Audio シンセ発音が `1回以上` 行われること、および `SOUND OFF` 切替後は出力ゲイン `0`（または発音 `0回`）となりリロード後も `SOUND OFF` が保持されることを明記する。
- **重大**、`docs/prd/001-arcade-core.md:242-247`、`AC-18`、`Given`（243行）に「ビューポート幅 `320px` および `1280px`、**ならびに文字拡大率 `200%` の各表示条件**」とあるにもかかわらず、`Then`（245行）が「**幅 `320px` と `1280px` で**ページ全体の横はみ出し幅が `0px` であり…」となっており、文字拡大率 `200%` 時のビューポート幅と合格基準（横はみ出し `0px`・文字切れや重なりなく全操作要素 `24x24px` 以上で押下可能）が `Then` から欠落している。根拠：`docs/org/gates.md:31-36` G0 合格条件、`.claude/skills/craft-verifier/web.md:16` 道具の読み替え（200%拡大と幅320px）。直す方向：`Then` に「幅 `320px`（拡大率 `100%`）、幅 `1280px`（拡大率 `100%`）、および幅 `1280px`・文字拡大／ページズーム `200%` の3条件すべてにおいて横はみ出し幅が `0px` であり、操作可能な全ボタン・スロット・カードが `24x24px` 以上で重ならず押下可能である」と明記する。
- **要修正**、`docs/prd/001-arcade-core.md:193-198`、`AC-11`、クリップボード書き込み権限が拒否された環境や `navigator.clipboard.writeText` が例外（`NotAllowedError` 等）を送出したときの振る舞い（または「なし」の理由）が 11章にない。根拠：`.claude/skills/craft-verifier/SKILL.md:27` 2章 G0-3（「空、エラー、オフライン、権限を断ったときの AC が PRD の11章にあるかを見る。なく、『なし』の理由もなければ『要修正』」）。直す方向：クリップボード書き込み失敗時に未捕捉例外 `0件` で代替表示（手動コピー可能なテキスト選択領域または失敗通知 `1件`）を行う条件を追加する。
- **要修正**、`docs/prd/001-arcade-core.md:151-L163`、`AC-5`・`AC-6`、(1) `AC-5`（154行）の `RESET` 操作時に、モード2の `AC-9`（182行：「3スロットが未選択の初期状態に戻る」）と異なり、配置済みスロットが維持されたままステップ位置 `0` に戻るのかスロットごと未配置に戻るのかが未記載。(2) `AC-6`（159-161行）で「暴走上限超過またはターゲット未達」と「`CRASHED` または `FAILED`」の1対1の対応関係（途中制約違反＝`CRASHED`／完走後目標未達＝`FAILED`、およびエネルギーコスト不足が発生し得る場合の扱い）が明示されていない。根拠：`.claude/skills/craft-verifier/SKILL.md:16` 1章1。直す方向：`AC-5` で `RESET` 後の3スロットの状態を明記し、`AC-6` で `CRASHED` になる条件（暴走上限超過・リソース枯渇等、発生箇所 `STEP 1`〜`STEP 3`）と `FAILED` になる条件（3手完了時のターゲット未達、発生箇所 `FINAL CHECK`）を対応づけて記述する。
- **提案**、`docs/prd/001-arcade-core.md:228-233, 309`、`AC-16`・18章 `Q-3`、(1) ブラウザのストレージ完全ブロック設定では `getItem`/`setItem` 呼び出し時だけでなく `window.localStorage` プロパティ参照（getter）時点で `SecurityError` が発生するため、`AC-16` の `Given` に `window.localStorage` 参照時の例外も含めておくと安全。また `localStorage` に破損 JSON が残っていた場合の初期化フォールバックも G1 契約に含めると堅牢になる。(2) 18章 `Q-3` で案2（英語 UI なし）を選ぶと `docs/org/gates.md:75` G3 の5通りスクリーンショット（英語 `en` 必須）と衝突するため、G0 承認記録で推奨の案1（日英切替あり）を確定しておくことを推奨する。根拠：`.claude/skills/craft-verifier/web.md:18-27`。

## 証拠
- 対象：`main...HEAD`（`371348a...84f6db5`、ブランチ `feat/001-arcade-core`）、観点：G0 受け入れ条件のテスト可能性・具体値・状態網羅・つなぎ口洗い出し
  - `git diff --name-only main...HEAD` の一覧と読んだ印：
    - [x] `docs/prd/001-arcade-core.md`（全329行読了）
    - [x] `docs/prd/product.md`（全59行読了）
    - [x] `docs/progress.md`（全13行読了）

### G1 で `tech-lead`・`designer` が `contracts/` と技術設計メモに入れるべき「テストに要るつなぎ口の一覧」
1. **DOM 識別子（`data-testid`）とアクセシブルな役割・名前の一覧**
   - トップ・共通ヘッダー：3モード切替導線、常設ミュート切替ボタン（`aria-pressed` / `data-sound-state="on|off"`）、言語切替コントロール（`ja` / `en`）。
   - モード1：全10ステージ選択要素（`data-cleared="true|false"`）、提示モジュールカード（4属性要素）、ステージ目標値・暴走上限値表示、3スロット（`STEP 1`〜`3`）、`RUN` / `STEP` / `RESET` ボタン、結果ステータス表示（`STAGE CLEAR` / `CRASHED` / `FAILED`）、獲得スコア、デバッグログの3項目（失敗発生箇所・原因種別・期待条件値と実測値）。
   - モード2：全9ステージ選択要素（初級1〜3・中級4〜6・上級7〜9、`data-cleared` 付き）、3スロット（`ACT 1`〜`3`）と仮説カード選択肢、`FIRE` / `RESET` ボタン、4段階オーダー判定表示、解説領域の3項目（最終推定値と基準値・基準因数分解式と解説・罠カード名と理由）。
   - 思考力診断カルテ・環境通知：5軸それぞれの整数スコア要素、5角形レーダーチャート要素、総合認定ランク表示（`UNRANKED` / `C` / `B` / `A` / `S` / `S+`）、コピー共有ボタン、コピー完了ステータス通知、未プレイ時のモード開始ボタン、ストレージ保存無効通知バナー。
2. **Canvas / シミュレーション内部状態の公開読み取りインターフェースと DOM 同期属性**
   - `window.__ARCADE_TEST_API__.getSimulationSnapshot()`：`phase`, `currentStep`, `executedSteps`, `parameters`, `initialParameters`, `attemptCount`, `currentShakeOffsetPx`, `maxShakeOffsetPx`
3. **ステージ全順列ソルバー公開インターフェースとテスト用代表フィクスチャ契約**
   - `window.__ARCADE_TEST_API__.auditAllStages()`：モード1全10ステージの `{ stageId, totalPermutations, clearCount, clearWithoutSideEffectOrIfCount }`、モード2全9ステージの `{ stageId, totalCombinations, perfectOrderCount, trapCardCount }`。および検証対象ステージの代表順列・カード組の契約記載。
4. **Web Audio API 状態の公開読み取りインターフェース**
   - `window.__ARCADE_TEST_API__.getAudioState()`：`{ soundEnabled, masterGainValue, synthTriggerCount, externalMediaRequestCount }`
5. **ブラウザ保存領域（`localStorage`）のスキーマ契約とシード投入・初期化手順**
6. **アニメーション時間・タイマー制御の `page.clock` 互換性**
7. **受け入れテスト用の固定ローカルサーバー起動仕様**

- 読んだファイル：`.claude/skills/craft-verifier/SKILL.md`, `.claude/skills/craft-verifier/web.md`, `.claude/org/app.json`, `CLAUDE.md`, `docs/idea-seed.md`, `docs/prd/product.md`, `docs/prd/001-arcade-core.md`, `docs/org/gates.md`, `docs/templates/review-report.md`, `docs/templates/test-plan.md`, `docs/progress.md`
- 実行したコマンドと結果：
  1. `git rev-parse HEAD && git status --short && grep -nE '^- AC-[0-9]+' docs/prd/001-arcade-core.md && sed -n '120,248p' docs/prd/001-arcade-core.md | grep -nE '適切|すばや|素早|わかりやす|分かりやす|十分|スムーズ|直感的|心地よ|妥当|自然|きれい|快適|ちゃんと|しっかり' || true` → 182行「妥当な因数分解式の解説文」を検出
  2. `git branch -a && git log -n 5 --oneline && git diff --name-only main...HEAD` → 変更3件のみ
  3. `nl -ba docs/prd/001-arcade-core.md | sed -n '120,256p'` → 行番号照合完了
- 開いた URL と確認した日付：なし
- 未検証：なし

## 記録
- 関門：G0
- 判定した役：verifier
- 回：r1
- 対象：`docs/prd/001-arcade-core.md`、`feat/001-arcade-core`、`371348a...84f6db5`
- 日付：2026-11-11
