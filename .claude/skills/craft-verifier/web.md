# verifier の手引き：Web の読み替え

app.json の stacks に web があり、Web の画面を確かめるときに、SKILL.md と合わせて読みます。
原則、技法、G0 の判定、AC 番号の付け方、4章の検査の考え方は SKILL.md のままです。iOS の道具と手順だけを、下の表で読み替えます。
Web はこの環境（Linux）でも本物のブラウザで動かせます。「Mac がないので未検証」は Web には当てはまりません。

## 道具の読み替え
| SKILL.md（iOS） | Web |
|---|---|
| XCUITest | Playwright（@playwright/test）。受け入れテストは paths.acceptance_tests の Web のフォルダ（既定は web/tests/acceptance/）に置き、設定（playwright.config.ts）もそのフォルダの中に置く |
| accessibilityIdentifier で探す | getByRole（役割と名前）を先に使い、design/ の6章に data-testid があればそれを使う。表示の文字だけ、CSS のクラス、XPath、nth() で探さない |
| waitForExistence | expect(...).toBeVisible() などの自動で待つ確かめ。waitForTimeout は使わない |
| app.terminate() と launch() の後に見る | page.reload() と、新しい context（新しいタブ、Cookie を引き継ぐか消すかを AC に合わせる）の後にも結果を見る |
| launch arguments で状態を作る | テストごとに新しい browser context。データは contracts/ のつなぎ口（テスト用の API、シード）で作る。時刻は page.clock で固定する |
| 権限を断る | context の permissions を空にして、通知、位置、カメラを断った状態を作る |
| AX5（大きい文字） | ブラウザの文字を200%（ページの拡大）と、幅 320px（CSS の px）の2つ。横スクロールが出ない、文字が切れない、ボタンが押せる |
| ダーク（simctl） | context の colorScheme: 'dark'。動きを減らす設定は reducedMotion: 'reduce' |
| ja と en（test plan の構成） | context の locale（ja-JP、en-US）と、design/ が決めた言語の切り替え方 |
| performAccessibilityAudit() | @axe-core/playwright で全画面と全状態を調べる（タグは wcag2a、wcag2aa、wcag21a、wcag21aa、wcag22aa）。違反は0件。見送るものは1件ずつ理由。キーボードだけで AC の流れをたどるテストも1本書く |
| シミュレーターの機種と iOS の版 | ADR の対応ブラウザ。最低でも chromium、firefox、webkit の3つの project と、スマホの幅（devices の iPhone か Pixel）と PC の幅 |
| -test-iterations 5 | `--repeat-each=5 --retries=0`。1回でも落ちれば未検証 |
| -retry-tests-on-failure（使わない） | 設定とコマンドの retries は 0。CI でも同じ |
| .xcresult からスクリーンショット | page.screenshot で evidence/ に保存。失敗したときの trace も残す（trace: 'retain-on-failure'）。結果のフォルダはリポジトリの外か .gitignore の中 |
| 前の版からの更新 | 前のタグの版で作ったデータ（保存したもの、Cookie とブラウザの保存領域）が、新しい版で読めるか。古いタブを開いたまま新しい版が出たときの動き（読み込み直しの案内など） |

## 証拠の名前
<画面>_<状態>_<light|dark|zoom200|en|mobile>.png。通常の状態は、ライト、ダーク、200%、英語、スマホの幅の5通り。ほかの状態はライトで PC の幅。

## Web で足すチェック
- [ ] 戻るボタン、再読み込み、URL を直接開く（ログインの前と後）、2つのタブで同じ操作、をリスクに合わせて試した。
- [ ] 送信の二度押しと、送信中のページ移動を試した。
- [ ] オフラインは context.setOffline(true)、サーバーエラーは page.route で 500 と時間切れを返して試した。
- [ ] 性能：ADR の予算を Lighthouse（`npx @lhci/cli autorun` か `npx lighthouse <URL> --output=json`）で測り、LCP、TBT（INP の代わり）、CLS、最初の JS の量を verification.md に書いた。予算を超えたら AC の外でも「重大」にする（ADR の非機能の約束のため）。
- [ ] コンソールのエラーとネットワークの失敗（page.on('console')、page.on('requestfailed')）を集め、0件でないものに理由を書いた。

## 4章の検査に足す型（Web）
- 待ち時間で待つ：`waitForTimeout|setTimeout\(`
- 飛ばす、失敗を許す、再試行：`test\.skip|\.skip\(|test\.fixme|test\.fail\(|\.only\(|retries:\s*[1-9]`
- 壊れやすい探し方：`locator\(['"]\.|xpath=|//|nth\(|first\(\)|last\(\)` の結果を、getByRole と design/ の6章の識別子と突き合わせる。
- 中を覗く：paths.web の実装を import している（`from ['"]\.\./\.\./`、`@/` など）。受け入れテストは外から操作する。

## 参考
- Playwright：https://playwright.dev/docs/best-practices 、https://playwright.dev/docs/locators 、https://playwright.dev/docs/emulation 、https://playwright.dev/docs/clock 、https://playwright.dev/docs/test-retries
- axe と Playwright：https://playwright.dev/docs/accessibility-testing 、axe のタグ：https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags
- WCAG 2.2 のリフローと文字の拡大：https://www.w3.org/WAI/WCAG22/Understanding/reflow.html 、https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- Lighthouse CI：https://github.com/GoogleChrome/lighthouse-ci 、Core Web Vitals：https://web.dev/articles/vitals
