---
name: fix
description: 不具合の直しや文言の手直しなど、小さい変更を軽い手順で進める指揮役の手順。PRD とデザインの調査は省き、再現テスト、G2（CI とレビュー）、軽い G3 は残す。Takuma が /fix で始める
---

# /fix：小さい変更を軽い手順で進める

依頼：Takuma の依頼内容

あなた（メインセッション）は指揮役。自分ではコード、テスト、デザインを書かない。任せ方（委任指示書、1体ずつ、BASE の確かめ、範囲の中だけを `git add <パス>`、往復は2回まで）は .claude/skills/feature/SKILL.md の「任せ方」と同じ。
省くのは G0（PRD と承認）と G1（デザインの調査と仕様、設計メモ）だけ。テストを先に書くこと、G2 の CI とレビュー、動かして確かめることは省かない。

## 1. /fix で進めてよいか決める
次のすべてに当てはまるときだけ /fix で進める。1つでも外れたら、理由を1行で書いて「/feature やりたいこと」を勧め、止まる。
- 次のどれか：今の PRD の AC、design/ の仕様、contracts/ の契約とずれている不具合。文言、色、余白の手直し（design/ のトークンと文言の表の中で済むもの）。依存ライブラリの修正版（パッチ）への更新。揺れるテストの原因の直し。文書の直し。
- 新しい画面、新しい AC、新しい API の入口、契約を壊す変更、DB の形の変更、新しい依存ライブラリがない。
- 権限、ログイン、課金、個人データの集め方を変えない（安全の不具合を直すのはよいが、reviewer の観点に「セキュリティ」を足す）。
- 変えるのは1つの領域（ios、web、backend のどれか）が目安。差分の目安は200行まで。

## 2. 始める
1. CLAUDE.md、.claude/org/app.json、docs/progress.md、docs/org/gates.md を読む。
2. 名前を「fix-<年月日>-<英小文字とハイフンの短い名前>」にする（例：fix-20261104-login-crash）。以下、この名前を X と書く。
3. main を最新にして `git switch -c fix/X` を作る。approvals が "final" なら main の代わりに ai-org/batch から作る。
4. docs/reviews/X-triage.md に、指揮役が次を書く：何が起きているか（再現の手順）、どの AC か仕様か契約とずれているか（ファイル:行）、1 の条件を1つずつ満たすと言える理由、触る領域と呼ぶ役。docs/progress.md に開始を書き足し、2つをコミットする。

## 3. 直す
5. **仕様が先**（文言や見た目の手直しで、design/ の値を変えるときだけ）：designer に design/ の文言の表かトークンだけを直させる。調査は要らない。design-reviewer に、その差分が今の画面の原則（B-n、コントラスト、日英の長さ）を壊さないかを判定させる。
6. **再現テストが先**（ふるまいの不具合のときだけ）：verifier に、triage.md と、ずれている AC、design/、contracts/ だけを渡し、実装を見ずに再現する受け入れテストを書かせる。名前に AC 番号を入れる（例：test_AC3_パスワード違いで落ちない）。落ちるのが正しく、そのログを docs/verification/X/evidence/red.log に残させる。
7. **作り手**：その領域の役（ios-engineer、web-engineer、backend-engineer のうち stacks にある1体）に、triage.md、関係する PRD と design/ と contracts/、6 のテストを渡して直させる。完了条件は、app.json の commands のビルドとテストが通り、6 のテストも通ること。実行したコマンドと出力を返させる。
   依存の更新なら、作り手は版を上げ、ビルドとテストの出力に加えて、変更履歴（リリースノート）で壊れる変更がないことを確かめた URL を返す。
8. 作り手から「思ったより大きい」「1 の条件から外れる」と返ってきたら、作業を止めて /feature に切り替える案を Takuma に出す。

## 4. G2 と軽い G3
9. コミットして push し、`gh pr create --draft` で PR を作る（approvals が "final" なら `--base ai-org/batch`）。本文の最初に「/fix の手順。省いた関門：G0、G1」と書く。`gh pr checks --watch` で CI を待つ。飛ばした CI は緑に数えない。
10. reviewer（観点はコード。安全に関わる直しなら「コードとセキュリティ」）に BASE、triage.md、作り手の報告を渡し、差分を判定させる。1 の条件を守っているか（`git diff --stat BASE...HEAD` と、contracts/ と依存のファイルの差分）も判定させる。6 でテストを足したときは、並列で tech-lead にもそのテストを判定させる（verifier と reviewer は同じモデルのため）。
11. verifier：PR の最新のコミットで、6 のテストと、触った領域の受け入れテストすべてを再試行なしで動かす。6 のテストは5回繰り返す。画面が変わったなら、変わった画面のスクリーンショット（通常の状態の4通り、Web は5通り）を docs/verification/X/evidence/ に撮る。結果は docs/verification/X/verification.md に短く書く（環境、コマンド、件数、証拠のパス）。
12. 画面が変わったときだけ、design-reviewer にスクリーンショットを design/ の仕様と比べさせる（採点表の F アクセシビリティと H 文言だけでよい）。
13. CI がすべて緑で、10〜12 が PASS で、`git diff --name-only origin/main...HEAD -- .claude .github` が空なら通過。docs/progress.md に「X、/fix、PASS、根拠のファイル」を書き足してコミットし、push する。

## 5. 渡す
14. approvals が "each" なら、`gh pr ready` のあと、Takuma に1通で知らせてマージを頼む：何を直したか、再現テストの名前と結果、証拠の場所、PR の URL。指揮役はマージしない。
15. approvals が "final" なら、/feature の「まかせるモード」と同じく ai-org/batch に入れ、まとめの PR の本文に1行足す。
16. 同じ所で2回目の /fix になったら、`/retro X` を勧める（直しが続くのは、前の関門の見逃しのしるしのため）。

## 止まるとき
- /feature の「止まるとき」と同じ。加えて、再現できない不具合は直さない。再現の手順と、試したことを Takuma に返して止まる。
