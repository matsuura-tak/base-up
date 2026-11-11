# designer の手引き：Web の読み替え

app.json の stacks に web があり、Web の画面を設計するときに、SKILL.md と合わせて読みます。
調査の手順、ターゲットと方向の決め方、バウハウスの B-1〜B-6、状態と文言の考え方は SKILL.md のままです。土台を HIG から Web の標準に替えます。
iOS と Web の両方があるときは、同じ機能でも画面の仕様をスタックごとに分けて書きます（同じトークンと文言のキーを使う）。

## 土台：Web の標準と、よく知られた型
- Web には HIG のような1つの公式の手引きはありません。土台は次の3つです。
  - HTML の標準要素（button、a、form、label、input、select、dialog、details、table、nav）。キーボード、読み上げ、フォーカスが自動で付いてくる。
  - WAI-ARIA APG の型（タブ、メニュー、ダイアログ、コンボボックスなど）。標準要素にない部品は、この型どおりの動きにする。
  - WCAG 2.2 の AA。Web で守る最低の線。
- 部品集は、tech-lead の「Web の土台」の ADR で決めたものを先に使う。仕様の「使う部品」には、その部品集の名前か HTML の要素の名前を書く。
- 知られた型を使う（Jakob の法則：人はほかのサイトで時間の大半を使う）。ロゴは左上でトップへ戻る、主なナビゲーションは上か左、検索は虫めがね、リンクは見た目でリンクと分かる。
- 仕様の決定表の「原則」には、HIG の URL の代わりに、WCAG の達成基準の番号と URL、APG の型の URL、または B-n を書く。

## 画面と状態の読み替え
| SKILL.md（iOS） | Web |
|---|---|
| NavigationStack、TabView | ヘッダーのナビゲーション、パンくず、サイドバー。URL で画面が決まる（戻るボタン、再読み込み、共有できる URL） |
| sheet、alert、confirmationDialog | dialog 要素（モーダル）と、取り消せる通知（トースト）。取り消せない操作には確認か取り消し |
| ContentUnavailableView | 空とエラーの区画：何が起きたかと、次の一手のボタン |
| redacted、ProgressView | 形を先に出す（スケルトン）。長くかかるときは進み具合 |
| 7つの状態 | 同じ7つ。「権限を断られたとき」は通知、位置、カメラなどのブラウザの許可と、ログインしていないとき、の両方を考える |
| SF Symbols | ADR で決めたアイコン集。アイコンだけのボタンには読み上げの名前を書く |
| Dynamic Type の text style | 文字の段階をトークン（rem）で決める。本文は 16px 相当以上。1行は全角で35〜40字、英字で45〜75字を目安にする |
| 44x44pt | 押せる範囲は 24x24px 以上（WCAG 2.5.8）が最低。スマホの幅では 44x44px を目安にする |
| AX5 で横並びを縦に | ブレークポイント（例：スマホ、タブレット、PC の3つ）ごとの並びを書く。幅 320px と、文字200%の拡大で崩れない並びを書く |
| VoiceOver の読み上げ順 | 見出しの階層（h1 は1画面に1つ）、ランドマーク（header、nav、main、footer）、キーボードでのフォーカスの順番、フォーカスの見え方 |
| accessibilityIdentifier | テストで使う要素の data-testid の名前と、読み上げの名前（ラベル） |
| ライト、ダーク、コントラストを上げる設定 | ライト、ダーク（prefers-color-scheme に合わせるかを決める）、Windows のハイコントラスト（forced-colors）で読めるか |
| 権限を求める画面 | ブラウザの許可は、使うその時に理由を見せてから求める。ページを開いた直後に通知の許可を求めない |

## Web で足すチェック
- [ ] 画面ごとに URL の形、ページのタイトル（「画面の名前 | アプリ名」の形）、ログインが要るかを書いた。
- [ ] ホバーにしかない操作がない（スマホでは使えない）。フォーカスの見え方をトークンで決めた（コントラスト 3:1 以上）。
- [ ] フォームは、ラベルを入力の上に置き、必須を文字で示し、エラーは入力のすぐ下に「何が起きたか、どう直すか」で出す。入力を消さない。
- [ ] Cookie や外部への送信の同意が要るなら（PRD の17章）、その画面を仕様に入れ、「同意しない」も同じ手間で選べる形にした（だます画面にしない）。
- [ ] 共有されたときの見え方（OGP の画像とタイトル）が要る画面を書いた。

## 参考
- WCAG 2.2：https://www.w3.org/TR/WCAG22/ 、WAI-ARIA APG：https://www.w3.org/WAI/ARIA/apg/patterns/
- 押せる範囲：https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html 、フォーカスの見え方：https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- Jakob の法則：https://lawsofux.com/jakobs-law/ 、NN/g フォームの設計：https://www.nngroup.com/articles/web-form-design/
- forced-colors：https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors 、prefers-color-scheme：https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
- 手本の探し方：Awwwards や、ターゲットが毎日使う Web サービスを別カテゴリーの手本に選んでよい（選んだ理由を書く）
