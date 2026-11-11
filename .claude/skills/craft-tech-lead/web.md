# tech-lead の手引き：Web の読み替え

app.json の stacks に web があるときに、SKILL.md と合わせて読みます。契約、ADR の書き方、DB の変え方、G0 と判定の手順は SKILL.md のままです。
以下、Web のフォルダ（paths.web）を web/ と書きます。

## G1：「Web の土台」の ADR（docs/adr/ になければ、最初の機能の前に書く）
決めることと、決め方。どれも検討した案2つ以上と、いちばん強い反論を書きます。
- フレームワークと描き方：画面だけ（SPA）、サーバーで描く（SSR、静的な書き出し）のどれか。検索に出したい画面、ログインの後だけの画面、で分けて決める。web-engineer が迷わないよう、1つに決める。
- 対応ブラウザ：例「主なブラウザの最新2版と、iOS の Safari の最新2版」。Baseline の「広く使える」を基準にし、それより新しい機能を使うときの決まりも書く。
- 部品集とアイコン集：HTML の標準要素を先に使う前提で、足りない部品をどこから取るか。アクセシビリティ（APG の型どおり）を満たすものを選ぶ。designer と design-reviewer はこの ADR を読む。
- 性能の予算：LCP 2.5秒、INP 200ms、CLS 0.1 以下（Core Web Vitals の「良い」）を最低の線にし、最初に読む JS の量（圧縮後）の上限を数字で決める。測り方（Lighthouse CI の設定の場所）も書く。
- ログインと保存：ログインの状態は HttpOnly の Cookie などで持ち、トークンを localStorage に置かない。CSRF の対策を決める。
- 置き場所とデプロイ：ホスティングの事業者、PR ごとのプレビューの URL、ステージング、本番。戻し方（前のデプロイに1回の操作で戻せるか）。費用（利用者1,000人あたりの月の額）。秘密の値の置き場所（ホスティングの設定。リポジトリに置かない）。
- 安全のヘッダー：CSP、HSTS などをどこで付けるか（ホスティングの設定か、アプリのミドルウェアか）。
- テストの道具：単体（例：Vitest）、受け入れ（Playwright。設定は受け入れテストのフォルダの中）、アクセシビリティ（@axe-core/playwright）。dependencies.md に入れる。
- 計測と同意：解析の道具、Cookie の同意が要るか、電気通信事業法の外部送信規律の公表をどこに置くか（pdm と相談して PRD の17章に合わせる）。
- 古いタブ：新しい版を出したとき、開いたままの古い画面が API とずれたらどうするか（読み込み直しの案内、API の版を残す期間）。

## 契約とつなぎ口
- Web の型は contracts/openapi.yaml から作る形にする（例：openapi-typescript）。手で書いた型と契約がずれたら、ビルドか単体テストが落ちる形にする。
- 同じオリジンで API を出すか、別のドメインか（CORS と Cookie の扱いが変わる）を ADR に書く。
- verifier が G0 で挙げたつなぎ口（テスト用のデータの投入、時刻の固定、接続先）を、Web からも使える形で contracts/ に書く。

## CLAUDE.md と app.json のコマンド
- commands.web_build（例：`cd web && npm ci && npm run build`）と commands.web_test（例：`cd web && npx playwright install --with-deps && npm test && npx playwright test -c tests/acceptance`）を、実際に動かしてから CLAUDE.md に書き、app.json の更新を Takuma に頼む。
- ルートの .nvmrc か .node-version で Node の版を固定する（書けるのは tech-lead）。package-lock.json などのロックファイルはコミットする。

## 見つけ方に足すもの
| 失敗 | 見つけ方 |
|---|---|
| Web とバックエンドで契約がずれる | 生成した型でビルドが落ちる。バックエンドの契約テストが落ちる |
| 予算が決まっていない、測っていない | ADR に数字がない。Lighthouse の出力が検証レポートにない |
| 秘密がブラウザに届く | ブラウザに届く環境変数の名前の決まりが ADR にない |

## 参考
- 描き方の選び方：https://web.dev/articles/rendering-on-the-web 、Baseline：https://web.dev/baseline
- Core Web Vitals：https://web.dev/articles/vitals 、性能の予算：https://web.dev/articles/performance-budgets-101
- Cookie：https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies 、CSP：https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
- openapi-typescript：https://openapi-ts.dev/ 、Lighthouse CI：https://github.com/GoogleChrome/lighthouse-ci
