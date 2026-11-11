# design-reviewer の手引き：Web の読み替え

app.json の stacks に web があり、Web の画面を判定するときに、SKILL.md と合わせて読みます。
採点表の形、★、合否の線（★すべて、0点のカテゴリなし、16点のうち13点以上）は SKILL.md のままです。下の表の項目だけを読み替えます。

## 採点表の読み替え
| カテゴリ | SKILL.md（iOS） | Web |
|---|---|---|
| A 根拠 | 原則は HIG の URL か B-n | 原則は WCAG の達成基準、APG の型の URL か B-n |
| B 標準部品 | HIG と標準部品 | 「B HTML の標準と部品集」。★ 標準要素か ADR の部品集で作れる所はそれを使う。★ 外れる所は逸脱の表に「場所、本来の要素か部品、理由、APG の型」がある。ホバーにしかない操作がない |
| E 状態 | 7つの状態 | 同じ7つ。加えて、URL を直接開いたとき、ログインが切れたときの表示がある |
| F アクセシビリティ | 44×44pt、28×28pt 未満は重大、VoiceOver のラベル、AX5 | ★ コントラストは同じ数字（ライトとダーク）。★ 押せる範囲 24×24px 以上（未満は重大）、スマホの幅で 44px を目安。★ アイコンだけの操作に読み上げの名前。キーボードの順番とフォーカスの見え方が書いてある。幅 320px と文字200%での並びが書いてある |
| H 文言 | VoiceOver のラベル | 読み上げの名前に、見える文字がそのまま先頭に入っている（WCAG 2.5.3）。ページのタイトルが画面ごとにある |

## G3（実際の画面）の読み替え
- スクリーンショット：通常の状態はライト、ダーク、200%、英語、スマホの幅の5通り（verifier の手引きの web.md）。
- 自動の監査：検証レポートに、全画面と全状態の axe の結果（wcag2a、wcag2aa、wcag21aa、wcag22aa）がある。違反が残っていれば、見送る理由がなければ FAIL。出力がなければ FAIL。
- キーボード：キーボードだけで AC の流れをたどったテストの結果がある。フォーカスが見えない場所、閉じ込められる場所がない。
- 200% と 320px：横スクロールが出ない。文字が重ならない。主な操作が隠れない。

## G5（公開前）で見ること（App Store の掲載の代わり）
- 公開する画面のタイトル、説明（meta description）、共有されたときの画像とタイトル（OGP）が、実際の画面と機能に合う。ない機能を書いていない。
- アクセシビリティの方針（metadata/accessibility.md）を書くなら、書いたことのすべてに G3 の証拠のパスがある。
- Cookie や外部送信の同意の画面が、「同意しない」を同じ手間で選べる形になっている。

## 使うコマンドに足すもの
- CSS の値の直書きと、フォーカスを消す指定（実装のフォルダ）：`grep -rnE --include='*.css' --include='*.tsx' --include='*.vue' --include='*.svelte' --exclude-dir=node_modules 'outline:\s*(none|0)|#[0-9A-Fa-f]{3,8}\b' web/`

## 参考
- WCAG 2.2：https://www.w3.org/TR/WCAG22/ 、APG：https://www.w3.org/WAI/ARIA/apg/patterns/
- axe のタグ：https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags
- 見える名前と読み上げの名前：https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html
