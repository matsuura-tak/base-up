---
name: craft-web-engineer
description: web-engineer 役の詳しい手順と確かめる基準。web-engineer のサブエージェントが起動時に読み込む。指揮役やほかの役は使わない
user-invocable: false
---

# web-engineer の手引き

役のファイル（.claude/agents/web-engineer.md）の判断基準を、手順と確かめる基準にしたものです。
どれも差分か報告に跡が残る形で行います。reviewer（G2）は、差分と報告だけを見て判定します。
フレームワーク、対応ブラウザ、置き場所（ホスティング）、性能の予算は、tech-lead の「Web の土台」の ADR に従います。ADR になければ作業を止めて報告で聞きます。

## 1. 原則
1. 事実で書く。AI が書く Web のコードで多い失敗は、古い書き方、存在しないオプション、対応していないブラウザの機能。MDN と公式の文書で確かめ、ビルドとテストが通るまでは使えたことにしない。
2. 標準の要素を先に使う。button、a、label、dialog なら、キーボード、読み上げ、フォーカスが自動で効く。div で作った部品には効かない（ARIA の第一の決まり：使わずに済むなら ARIA を使わない）。
3. 型とリンターに守らせる。TypeScript の strict と、ADR で決めたリンター（アクセシビリティの規則を含む）を通す。黙らせる書き方で逃げない。
4. 全部の状態を作る。design/ の状態の表のマスは、どれも画面として存在させる。
5. 契約どおりに呼ぶ。項目名、省略できるか、日付の形、エラーの形まで contracts/ に合わせる。
6. 速さは予算で守る。最初の表示に要らない JS は読み込まない。画像と文字の読み込みで画面がずれない。
7. 小さく出し、証拠を付ける。1回の変更は1つの AC か1つの層（型と通信、状態、画面）だけにする。

## 2. 作業の順番
1. **読む**：PRD の AC、design/<機能名>.md の3章（使う部品）、5章（状態）、6章（識別子）、7章（文言）、contracts/、docs/adr/（とくに Web の土台）、test-plan.md。コマンドは CLAUDE.md で確かめる。
2. **範囲を決める**：今回満たす AC と触るファイルを決める。差分の目安は100行前後。数百行を超えそうなら、層ごとに分ける案を報告で出す。
3. **API を確かめる**：新しく使うブラウザの機能とライブラリの API を1つずつ開き、5章の「API の確認」の表に書く。ブラウザの機能は MDN の互換表と Baseline の印で、ADR の対応ブラウザで使えるかを見る。ライブラリは package.json の版の文書を開く（版の違う文書を見ない）。
4. **型と通信**：contracts/openapi.yaml があり、dependencies.md で許されていれば、型を契約から作る（例：openapi-typescript）。手で書くなら、契約の例の JSON を型に通す単体テストを先に書く。
5. **状態**：画面の状態を1つの型で表し、switch では全部の場合を書く（足りなければ型のエラーになる形にする）。読み込み中、エラー、空を真偽値の組で表さない。
6. **画面**：design/ の3章の部品で組む。見出しは順番どおり（h1 は1画面に1つ）、ランドマーク（header、nav、main）を置く。フォームは label と入力をつなぎ、エラーは入力の近くに出して読み上げに知らせる。
7. **文言と識別子**：design/ の7章のキーを文言のファイルに入れる。6章の data-testid と、読み上げの名前を、名前を変えずに付ける。ページのタイトルと html の lang を言語ごとに変える。
8. **単体テスト**：状態の移り変わり、エラーの変換、型の変換を、ADR で決めたテストの道具（例：Vitest）で確かめる。部品のテストは、役割と名前で要素を探す（Testing Library の優先順）。
9. **検査と実行**：4章の検査を実行する。ビルド、単体テスト、受け入れテスト、性能の測定を動かす。
10. **報告**：5章の節を埋め、3章で印を付けられない項目を「未解決」に書く。

## 3. チェックリスト
HTML とアクセシビリティ
- [ ] 押せるものは button、移動するものは a（href あり）。div と span に onClick がない。
- [ ] すべての入力に見える label がある。placeholder を label の代わりにしていない。
- [ ] キーボードだけで AC の流れを最後までたどれる。フォーカスの枠を消していない（outline: none だけの指定がない）。ダイアログを開くとフォーカスが中に入り、閉じると元に戻る。
- [ ] 画像に alt がある（飾りなら alt=""）。アイコンだけのボタンに読み上げの名前がある。
- [ ] 動きは prefers-reduced-motion で止まる。ダークは prefers-color-scheme で切り替わる（design/ が決めていれば）。

レイアウトと見た目
- [ ] 文字の大きさは rem。文字の入る箱に固定の高さがない。ブラウザの文字を200%にしても切れない。
- [ ] 幅 320px（CSS の px）で横にスクロールしない。design/ のブレークポイントどおりに並びが変わる。
- [ ] 色、余白、角丸はトークン（CSS の変数）だけ。画面のコードに色の値を直接書いていない。
- [ ] 押せる範囲は 24x24px 以上（WCAG 2.5.8）。design/ が 44px と決めていればそれに従う。

通信と契約
- [ ] コードに書いたパスと項目名が、すべて contracts/ にある。
- [ ] オフラインと通信の失敗を、エラーの表示とやり直しのボタンに変える。navigator.onLine だけで判断しない。
- [ ] 契約にあるエラーごとに、出す文言の対応表がある。知らない値が来ても落ちない。
- [ ] 二重送信を防ぐ（送信中はボタンを押せない、または同じ要求を1回にまとめる）。

安全とプライバシー
- [ ] 利用者の入力を HTML として差し込んでいない（innerHTML、dangerouslySetInnerHTML、v-html）。どうしても要るなら、ADR で決めた無害化の道具を通した。
- [ ] トークンを localStorage と sessionStorage に置いていない。ログイン状態は ADR の方式（例：HttpOnly の Cookie）に従う。
- [ ] ブラウザに届く環境変数（NEXT_PUBLIC_ や VITE_ で始まるもの）に秘密がない。console.log が残っていない。
- [ ] 外のサイトへのリンクに rel="noopener" がある。外のスクリプトは ADR と dependencies.md にあるものだけ。

性能（数字は ADR の予算。なければ LCP 2.5秒、INP 200ms、CLS 0.1 以下）
- [ ] 最初の画面に要らない部分は遅れて読み込む。大きいライブラリを丸ごと読み込んでいない。
- [ ] 画像に幅と高さ（か aspect-ratio）があり、画面の外の画像は loading="lazy"。文字の読み込みでずれない。
- [ ] 一覧が多いとき（目安100件以上）は、ページ分けか見える所だけ描く形にした。
- [ ] ビルドの出力で、最初に読む JS の量を測り、予算と比べた。

テスト
- [ ] 単体テストは並列で動いても互いに影響しない。通信は差し替え（例：MSW）で止め、本物のサーバーにつながない。
- [ ] 受け入れテスト（paths.acceptance_tests の中）には触っていない。受け入れテストを動かすコマンドは、そのフォルダの中の設定を使う形（例：`npx playwright test -c tests/acceptance`）。
- [ ] 新しい警告は0件（型、リンター、ビルド）。

## 4. よくある失敗と見つけ方
数え方：`grep -rnE --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.vue' --include='*.svelte' --exclude-dir=node_modules --exclude-dir=tests '<型>' web/`（paths.web が違えば読み替える。CSS は --include='*.css'）。件数を報告に書き、0件でないものは1件ずつ理由を書く。
- 型を黙らせる：`: any\b|as any|as unknown as|@ts-ignore|@ts-expect-error|eslint-disable`
- 押せない div：`<div[^>]*onClick|<span[^>]*onClick`
- 中身を HTML として差し込む：`innerHTML|dangerouslySetInnerHTML|v-html|insertAdjacentHTML|eval\(|new Function\(`
- トークンの置き場所と漏れ：`localStorage|sessionStorage|console\.log|apiKey|secret`
- フォーカスの枠を消す（CSS）：`outline:\s*(none|0)`
- 値の直書き（CSS と style）：`#[0-9A-Fa-f]{3,8}\b|font-size:\s*[0-9.]+px`
- テストを弱める：`\.skip\(|\.only\(|test\.fixme|waitForTimeout|retries:`
- 動いたふり：`-i` を付けて `TODO|FIXME|mock|dummy|sample|lorem`。仮の値が画面に出ていないかも見る。
- 存在しない API、古い API：ビルドの失敗と非推奨の警告。「API の確認」の表で URL がない行。
- 状態の抜け：design/ の5章の列と、状態の型の場合分け、data-testid を突き合わせる。
- 大きすぎる差分、範囲の外の変更：`git diff --stat`
- 証拠のない「通った」：報告にコマンドと出力がなければ、gates.md の共通ルールで FAIL になる。

## 5. 報告に足す節
役のファイルの「報告の形」の節に、次を足す。reviewer は同じ表で確かめる。
- API の確認：| API | URL | Baseline（広く使える / 新しく使える / まだ限られる） | ADR の対応ブラウザで使えるか（使えなければ代わりの場所） |
- 画面の状態と識別子：| 画面 | 状態（design/ の5章の列） | 実装の場所（ファイル:行） |。空欄は不可。「なし」の状態は design/ の理由を写す。続けて、6章の識別子の一致数（例：12/12）、ja と en がそろったキーの数と、そろっていないキーの数（0であること）。
- 実行したコマンドと結果：コマンド、終了コード、警告の数（うち新しいもの）、テストの件数（成功、失敗、飛ばした数）、4章の検査の件数、性能（LCP、INP か TBT、CLS、最初に読む JS の量と予算）。測れなければ「未検証」と理由。

## 6. 参考
- MDN：https://developer.mozilla.org/ 、Baseline：https://web.dev/baseline
- ARIA を使う前に（第一の決まり）：https://www.w3.org/TR/using-aria/ 、WAI-ARIA APG：https://www.w3.org/WAI/ARIA/apg/
- WCAG 2.2：https://www.w3.org/TR/WCAG22/ 、押せる範囲：https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html 、リフロー：https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- Core Web Vitals：https://web.dev/articles/vitals 、INP：https://web.dev/articles/inp 、CLS：https://web.dev/articles/optimize-cls
- TypeScript strict：https://www.typescriptlang.org/tsconfig/#strict 、openapi-typescript：https://openapi-ts.dev/
- Testing Library の探し方の優先順：https://testing-library.com/docs/queries/about/#priority 、Playwright の決まり：https://playwright.dev/docs/best-practices
- OWASP XSS 対策：https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html 、HTML5 の安全（localStorage）：https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
- Lighthouse CI：https://github.com/GoogleChrome/lighthouse-ci
- 小さい変更：https://google.github.io/eng-practices/review/developer/small-cls.html
