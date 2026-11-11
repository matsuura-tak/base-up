# reviewer の手引き：Web の読み替え

app.json の stacks に web があり、Web の変更やリリースを判定するときに、SKILL.md と合わせて読みます。
原則、重大度、報告の形、設計（G1）と受け入れテストの見方、API Top 10、LLM、秘密情報の探し方は SKILL.md のままです。iOS だけの項目を下で読み替えます。

## コード（G2）の読み替え
- 1 の AC 対応表：Web のテストは Linux でも動かせるので、自分で app.json の commands.web_test を動かす。CI のログだけで済ませない。
- 2 のテストを弱める変更の探し方に、Web の型を足す：
  - `git diff --name-only BASE...HEAD | grep -E '(^|/)tests/acceptance/|playwright\.config|vitest\.config|jest\.config|package\.json$|tsconfig.*\.json$|eslint'`（出たものは全部読む。テストが外れる、飛ばされる、型やリンターの検査が弱まるなら重大）
  - `git diff -U0 BASE...HEAD | grep -E '^\+.*(\.skip\(|\.only\(|test\.fixme|test\.fail\(|retries:\s*[1-9]|waitForTimeout|@ts-ignore|@ts-expect-error|eslint-disable|: any\b|as any)'`
  - `git diff -U0 BASE...HEAD -- web ':!*tests*' ':!*.test.*' ':!*.spec.*' | grep -E '^\+.*(NODE_ENV.*test|PLAYWRIGHT|navigator\.webdriver|isTest)'`（テスト中だけ答えを変える分岐は重大）
- 3 の境界値に、戻るボタン、再読み込み、URL を直接開く、2つのタブ、送信の二度押し、ログインの切れ、を足す。
- 4 と 5（Swift のエラー処理と並行処理）の代わり：足した行の any と型の決めつけ、空の catch、await を忘れた Promise（eslint の no-floating-promises）、捨てたエラー。
- 7 の依存：`git diff BASE...HEAD -- '*package.json' '*package-lock.json' '*pnpm-lock.yaml' '*yarn.lock'` を読む。新しい依存ごとに SKILL.md と同じ確かめ（dependencies.md、公式のリポジトリ、版の固定、既知の脆弱性）。インストール時に動くスクリプト（postinstall）を持つ依存は理由を確かめる。

## セキュリティとプライバシー（G4）の読み替え
1. MASVS の24項目の代わりに、OWASP ASVS（最新版を開いて版を書く）の L1 を章ごとに見る。章ごとに、該当するか、結果、根拠を書く。L2 以上は PRD が求めるときだけ。
2. ブラウザの安全（ステージングの URL に対して `curl -sI <URL>` の出力を貼る）：
   - Content-Security-Policy（unsafe-inline と unsafe-eval のない script-src、frame-ancestors）、Strict-Transport-Security、X-Content-Type-Options: nosniff、Referrer-Policy、Permissions-Policy がある。
   - ログインの Cookie に Secure、HttpOnly、SameSite がある。トークンを localStorage に置いていない。状態を変える要求に CSRF の対策がある（SameSite だけに頼るなら理由）。
   - 利用者の入力を HTML として出す所がない（innerHTML、dangerouslySetInnerHTML、v-html）。リダイレクトの行き先を入力から決めていない。
   - CORS が必要な相手だけを許している（* と認証情報の組み合わせがない）。
3. 秘密情報に足す：ブラウザに届く環境変数（NEXT_PUBLIC_、VITE_、PUBLIC_ で始まるもの）とビルドの出力（`grep -rnE 'sk-|sk_live_|AKIA|AIza|BEGIN .*PRIVATE KEY' <ビルドの出力のフォルダ>`）に秘密がない。ソースマップを本番で公開するなら理由。
4. 外部 API の鍵（とくに AI）をブラウザのコードに置いていない（`git grep -nE 'api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com' -- web` が出たら重大）。呼ぶならサーバーを通す。
5. データの流れ表の列を、項目、集める場所、送り先（自社、解析、広告、AI 事業者）、保存期間、Cookie かブラウザの保存領域か、本人と結び付くか、外部送信の公表に載っているか、同意の画面、にする。
6. 日本の法律：Cookie やタグで利用者の情報を外に送るなら、電気通信事業法の外部送信規律による公表か通知が要るか（総務省の「外部送信規律」のページを開いて確かめる）。海外の事業者への個人データの送信（個人情報保護法28条）。有料で売るなら特定商取引法の表示。どれも「要確認」として Takuma に上げる。

## 公開前（G5）の読み替え（App Store の審査の代わり）
Web には審査はありません。代わりに次を、項目ごとに「根拠の URL と開いた日付、証拠、結果」の表で見ます。
- 仮の文言、空のリンク、開発用の画面とログがない。404 と 500 のページがある。
- プライバシーポリシー、利用規約、外部送信の公表（要るとき）、特定商取引法の表示（有料のとき）が、フッターなどから1回で開ける。集めるデータ、使い道、保存期間、削除と同意の取り消し方が書いてある。
- アカウントを作れるなら、利用者が自分で削除を申し込める。
- 第三者の AI に個人データを送るなら、送る前に送り先を示して明示の同意を取る。利用者の投稿があれば、通報と削除の手段がある。
- robots.txt と sitemap が意図どおり（ステージングは検索に出ない、本番は出す）。ページのタイトル、説明、OGP が実物どおり。
- ADR の性能の予算と、上の2のヘッダーを、本番と同じ設定のステージングで満たす。

## 参考
- OWASP ASVS：https://owasp.org/www-project-application-security-verification-standard/ 、https://github.com/OWASP/ASVS
- HTTP ヘッダー：https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html 、CSP：https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- CSRF：https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html 、XSS：https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- HTTP Observatory（MDN）：https://developer.mozilla.org/en-US/observatory 、OWASP Top 10：https://owasp.org/Top10/
