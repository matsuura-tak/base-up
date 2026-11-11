# 関門（G0〜G6）

関門は、次に進んでよいかを決める場所です。作った役とは別の役が判定します。
この文書はキット（matsuura-tak/ai-）が管理します。アプリの中では直さず、直したいときは /retro で提案します。

## 共通のルール
- 判定は PASS か FAIL のどちらかです。重大な指摘が1件でもあれば FAIL です。
- 指摘には場所（ファイル:行、スクリーンショットのパス）と根拠（PRD、契約、ADR、ガイドラインの URL、実行したコマンドと出力）を付けます。
- 判定役は自分で直しません。報告は docs/templates/review-report.md の形で返し、指揮役が docs/reviews/ に保存します。
- 作り手と判定役の往復は2回までです。2回目も FAIL なら指揮役が裁定し、それでも決まらなければ Takuma が決めます。
- 証拠のない「できた」「通った」は FAIL と同じに扱います。未検証の項目が残っていれば通りません。
- 成果物の末尾の「確かめ」の印は作り手の自己申告です。判定役は印を信じず、自分で確かめます。
- 判定役には、作り手と別のモデルの役を少なくとも1つ入れます（AI の判定役は同じモデルの作ったものに甘くなりやすいため。モデルは .claude/agents/ の model）。
- 通ったら、指揮役が docs/progress.md に書き足します。Takuma の承認は docs/approvals/ に残します。
- 承認のモード（app.json の approvals）が "final" のときは、G0 の承認と裁定を指揮役が代わりに行い、docs/approvals/ に「委任による承認」として残します。G3 を通った機能は main ではなく ai-org/batch に入り、Takuma はまとめの PR で最後に確認してマージします。合格条件そのものは変わりません。下の「Takuma だけが行うこと」のうち、PRD の承認以外はまかせません。
- スタック（.claude/org/app.json の stacks）にない領域の条件は「非該当」です。iOS だけの条件（HIG、pt、AX5、XCUITest、TestFlight、App Store）は、Web では各役の手引きの web.md の読み替えで判定します。

## 一覧
| 関門 | いつ | 出すもの（作る役） | 判定する役 | Takuma |
|---|---|---|---|---|
| G0 PRD承認 | 着手前 | PRD（pdm） | tech-lead、verifier | 承認する |
| G1 設計 | 実装前 | デザインの調査と仕様（designer）、技術設計メモ、契約と ADR（tech-lead） | design-reviewer、tech-lead。契約と ADR は reviewer | なし |
| G2 マージ | 変更ごと | コードとテストの変更（ios-engineer、web-engineer、backend-engineer、verifier） | CI、reviewer。受け入れテストの変更は tech-lead も | なし |
| G3 機能完了 | 機能ごと | 検証レポートと証拠（verifier） | verifier、design-reviewer | 結果を見てマージする |
| G4 外部に配る前 | iOS は外部 TestFlight、Web はステージングを人に見せる前 | リリース候補のビルド（ios-engineer、web-engineer、backend-engineer）と回帰の検証レポート | verifier（回帰）、reviewer（セキュリティとプライバシー） | 実機かステージングで確かめる |
| G5 公開前 | iOS は審査の提出前、Web は本番公開の前 | メタデータと法務の文書（pdm）、ストアのスクリーンショット（verifier。Web はなし）、審査メモ（iOS） | reviewer（iOS は審査、Web は公開前の監査）、design-reviewer（掲載文、スクリーンショット、アクセシビリティの申告）、tech-lead（プライバシー表記） | 承認して提出する |
| G6 段階リリース | 公開中（Web は機能フラグか一部の利用者への公開） | 止める基準と公開中の数字 | 事前に決めた基準 | 続けるか決める |

## 合格条件
### G0 PRD承認
- 受け入れ条件のすべてに AC-1 のような番号があり、Given / When / Then と確かめ方が書いてある。
- どの受け入れ条件も、テストか画面の確認で合否を決められる（verifier）。
- 非目標、KPI と計測するイベント、撤退基準が書いてある。
- PRD 末尾の「G0 の前の確認」をすべて満たす。とくに：競合と代替にアプリ3件以上（URL と不満の引用つき）とアプリ以外の代替1つ以上。根拠のすべてに印（［実データ］［公開情報 URL］［推測］）。推奨といちばん強い反論。全 AC に効く機会。KPI にガードレール1つ以上で、主の指標がダウンロード数のような見かけの指標でない。撤退基準の全行に数値、日付、取る行動、判定する役。全イベントにプライバシー表示の区分。（tech-lead。印を信じず全項目を自分で確かめる。pdm と verifier は同じモデルのため）
- 競合の URL を1件以上開き、引用した不満がページにあるかを確かめる（tech-lead）。
- Then に具体的な値（件数、文言のキー、状態の名前、秒数）がない AC と、「適切に」「すばやく」のような測れない言葉は重大（verifier）。
- 実現でき、非機能要件（速さ、セキュリティ、プライバシー、アクセシビリティ）と費用に無理がない（tech-lead）。報告の「## 証拠」に、AC ごとの実現性の表、審査と権限で気になる点、利用者1,000人あたりの月の費用がある。「未確認」には spike の出力か Takuma への質問がある。
- Takuma に決めてほしいことが残っていないか、Takuma が決めた。
- Takuma が承認し、docs/approvals/<機能名>-G0.md に、日付と Takuma の返事をそのまま引用した記録がある（条件付きの返事は承認ではない）。

### G1 設計
- すべての受け入れ条件に、対応する画面と操作がある。全画面に7つの状態（通常、空、読み込み中、エラー、オフライン、権限を断られたとき、一部だけ読めたとき）がある。該当しない状態には「なし」と理由。
- 調査 design/<機能名>-research.md が、仕様 design/<機能名>.md より前のコミットにある（`git log` で確かめる）。R が5つ以上で、どれにも出典 URL と確認日がある。競合2つ以上と別カテゴリーの手本1つを調べた（design-reviewer）。
- 仕様の決定表の全行に、調査に実在する R-n と、原則（HIG の URL か B-n）がある。全画面に仕事1文、主操作1つ、使う標準部品がある。標準から外れる所には、本来の部品、理由、アクセシビリティの対応がある。ターゲットの仮説、性格語、差をつける点が、仕様のどの画面に表れるか書いてある（design-reviewer）。
- 独自の色の組に、ライト、ダーク、コントラストを上げる設定の3通りのコントラスト比がある。押せる範囲が 44x44pt 以上。AX5 で並びを変える場所が書いてある（design-reviewer）。
- Web の画面：決定表の原則が WCAG、APG の URL か B-n。押せる範囲が 24x24px 以上。ブレークポイントごとの並びと、幅 320px と文字200%での並びがある。キーボードの順番、フォーカスの見え方、ページのタイトルがある（design-reviewer）。
- design-reviewer の採点表が合否の線を満たす：★をすべて満たし、0点のカテゴリがなく、16点のうち13点以上。
- HIG、アクセシビリティ（大きい文字、VoiceOver、コントラスト）、日英の文言に重大な指摘がない（design-reviewer）。
- テストで使う要素に accessibilityIdentifier（Web は data-testid か役割と名前）の名前がある。
- 今の構成でこのデザインを作れる（tech-lead。デザインの判定のときは、まだ契約はない）。
- デザインの判定の後に tech-lead が書いた API 契約と ADR で、受け入れ条件をすべて満たせる。元に戻しにくい判断には、検討した案といちばん強い反論が ADR に書いてある（reviewer）。
- 技術設計メモ docs/adr/features/<機能名>.md があり、末尾の「確かめ（A）」を満たす：spectral と oasdiff の出力、互換性を壊すなら ADR と大きな版の上げ、脅威モデル（STRIDE か「新しい境界なし」）、非機能の全行に数字と測り方。新しい ADR は「確かめ（B）」を満たす（reviewer）。
- reviewer のエンドポイントの表に、認可の空欄がない。verifier が G0 で挙げたテストのつなぎ口が contracts/ にある。
- 使う依存ライブラリが contracts/dependencies.md にあり、ビルドとテストのコマンドが CLAUDE.md にある。
- Web があれば、「Web の土台」の ADR（描き方、対応ブラウザ、部品集、性能の予算の数字、置き場所とデプロイと戻し方、安全のヘッダー）がある（reviewer）。

### G2 マージ（変更ごと）
- その変更の領域の CI、org-check、org-guard が緑。「飛ばしました」で終わったワークフローは緑に数えない。app.json の commands のうち、その領域のものが空でない。
- 例外：受け入れテストを実装より先に入れた変更（verifier）は、テストが落ちるのが正しいので、org-check が緑で reviewer と tech-lead が PASS なら通す（verifier と reviewer は同じモデルのため tech-lead を足す）。test-plan 末尾の「確かめ」を満たし、PRD の全 AC 番号がテストの名前にあり、evidence/red.log がある。
- .claude/ と .github/ を変えていない（変える必要があれば Takuma に頼む）。
- 作り手が実行したビルドとテストのコマンドと出力がある。
- reviewer が PASS：PRD、契約、ADR に合っている。範囲の外の変更がない。作り手が受け入れテストを変えていない。テストを弱めていない。秘密情報がない。報告の「## 証拠」に、テストを弱める変更を探すコマンドとその出力があり、未検証が「なし」。
- ios-engineer の変更：報告に、API の確認の表と、画面の状態と識別子の表（空欄なし）と、craft-ios-engineer の検査の件数（0件でないものに1件ずつ理由）がある。新しい警告が0件。ja と en のそろっていないキーが0件。
- web-engineer の変更：報告に、API の確認の表（Baseline と対応ブラウザ）と、画面の状態と識別子の表（空欄なし）と、craft-web-engineer の検査の件数（0件でないものに1件ずつ理由）と、性能の数字（予算以内）がある。新しい警告（型、リンター、ビルド）が0件。ja と en のそろっていないキーが0件。
- backend-engineer の変更：実装ノート backend/docs/<機能名>.md の全節とチェックリストがある。交差テストの数が、ID を受け取るエンドポイントの数以上。結合テストを本物の DB で動かした。oasdiff breaking が空か、ADR と最低対応版の計画がある。報告に自己点検（API1〜API10）がある。
- 関係する文書（CLAUDE.md、契約、ADR）が更新されている。
- 機能の PR を main にマージするのは、すべての変更が G2 を通り、G3 も通ってから（main をいつでも出せる状態に保つため）。

### G3 機能完了
- すべての受け入れ条件が PASS で、条件ごとに証拠（テストの名前と出力、スクリーンショットかログのパス）がある。
- シミュレーターか実機（Web は ADR の対応ブラウザの本物のエンジン：chromium、firefox、webkit 以上）で実際に動かした。モックだけの合格は認めない。前の機能の受け入れテストも通る。
- 受け入れテストが1つも飛ばされていない。受け入れ条件ごとに、動いたテストと飛ばしたテストの数が検証レポートにある。
- 判定の実行に再試行を使っていない。影響「大」の AC のテストと一度でも落ちたテストを5回繰り返し、1回も落ちない。受け入れテストの変更すべてに PRD の根拠がある。
- 検証レポートの状態の表、画面ごとのアクセシビリティ監査（performAccessibilityAudit）、探索のセッションが埋まり、書いた証拠のファイルがすべてある。sleep、飛ばす、再試行、@testable import の検査が0件。Web は、全画面と全状態の axe の違反が0件（見送りは理由つき）、キーボードだけで AC の流れをたどったテストがあり、性能の数字が ADR の予算以内。
- 実際の画面が design/ の仕様どおり。全画面と全状態のスクリーンショットがあり、通常の状態はライト、ダーク、AX5、英語の4通り（Web はライト、ダーク、200%、英語、スマホの幅の5通り）。採点表が G1 と同じ合否の線を満たす（design-reviewer）。
- CI がすべて緑。PR が .claude/ と .github/ を変えていない（`git diff --name-only origin/main...HEAD -- .claude .github` が空）。
- 通ったら指揮役が PR を ready にし、Takuma がマージする。指揮役はマージしない。

### G4 外部に配る前（iOS は外部 TestFlight、Web はステージング）
- 入れる機能すべての受け入れテストが、回帰として通る（verifier）。
- セキュリティとプライバシーの重大な指摘が0件：OWASP MASVS、OWASP API Security Top 10、秘密情報、依存ライブラリ、PrivacyInfo.xcprivacy とプライバシー表記の一致、第三者の AI に送る場合の同意（reviewer）。報告に、MASVS v2 の24項目の表、エンドポイントの認可の表、コードから作ったデータの流れの表がある。LLM の機能があれば OWASP Top 10 for LLM も見た。
- 前の版が公開されていれば、前の版からの更新を試した（verifier）。
- Takuma が実機で確認リストを通した。
- Web：セキュリティの表が MASVS の代わりに OWASP ASVS の L1 の章ごとの表で、ステージングの安全のヘッダーと Cookie の属性を `curl -sI` の出力で確かめた（reviewer）。ステージングは本番と同じ設定で、検索に出ない。Takuma がスマホと PC のブラウザで確認リストを通した。

### G5 公開前（iOS は審査の提出前、Web は本番公開の前）
- reviewer が最新の審査ガイドラインを Web で開いたうえで監査し、PASS。項目ごとに、ガイドラインの番号、引用した文、URL と開いた日付、証拠がある。
- ストアのスクリーンショット、説明文、Accessibility Nutrition Labels の申告（metadata/accessibility.md）が、実際の画面と対応に合う（design-reviewer）。プライバシー表記の下書きが、G4 のデータの流れの表と PRD のイベントの表に合う（tech-lead）。掲載文を書く pdm と reviewer は同じモデルのため、別のモデルの2役を足す。
- デモアカウントと審査メモがあり、本番のバックエンドが動いている。
- プライバシーポリシーと利用規約を Takuma が承認した。提出は Takuma が行う。
- Web：審査の代わりに、reviewer が craft-reviewer の web.md の「公開前」の項目を、根拠の URL と開いた日付つきで監査し、PASS。ページのタイトル、説明、OGP が実物どおり（design-reviewer）。外部送信の公表と特定商取引法の表示が要るかを Takuma が決めた。戻し方（前のデプロイに戻す手順）を試した記録がある。本番公開は Takuma が行う。

### G6 段階リリース
- 止める基準（クラッシュしない割合、PRD の撤退基準など。Web はエラーの割合、500 の割合、Core Web Vitals）を公開の前に決めて、docs/approvals/ に記録してある。
- 基準を下回ったら一時停止を推奨する。続けるか止めるかは Takuma が決める。

## 小さい変更（/fix）
不具合の直しや文言の手直しは、/fix で G0 と G1 を省いて進めます。省けるのは、新しい画面、新しい AC、新しい API の入口、契約を壊す変更、DB の形の変更、新しい依存ライブラリ、権限、ログイン、課金、個人データの集め方の変更のどれもないときだけです（.claude/skills/fix/SKILL.md の 1）。
- 指揮役が docs/reviews/<X>-triage.md に、ずれている AC か仕様か契約（ファイル:行）と、条件を満たす理由を書いてある。X は「fix-<年月日>-<短い名前>」。
- ふるまいの不具合は、直す前に verifier が書いた再現テスト（AC 番号つき）と evidence/red.log がある。見た目と文言は、先に designer が design/ を直し、design-reviewer が PASS。
- G2 はそのまま：CI が緑、reviewer が PASS（条件を守っているかも見る）。足した受け入れテストは tech-lead も PASS。
- 軽い G3：verifier が再現テストを5回と、触った領域の受け入れテストすべてを再試行なしで動かし、docs/verification/<X>/verification.md に書いた。画面が変わったら、そのスクリーンショットと design-reviewer の PASS がある。
- 途中で条件から外れたら /feature に切り替えます。Takuma の役目は、each ではマージ、final ではまとめの PR での確認です。

## 記録の置き場所
機能名は「3桁の番号-英語の短い名前」（例：003-photo-upload）。リリースでは機能名の代わりに release-<版> を使います。

| 何 | どこ |
|---|---|
| PRD、アプリ全体の Job と指標 | docs/prd/<機能名>.md、docs/prd/product.md |
| デザインの調査と仕様 | design/<機能名>-research.md、design/<機能名>.md |
| 技術設計メモ、ADR | docs/adr/features/<機能名>.md、docs/adr/<番号>-<題名>.md |
| 実装ノート、運用手順書 | backend/docs/<機能名>.md、backend/RUNBOOK.md、Web の公開と戻し方は web/RUNBOOK.md |
| 判定の報告 | docs/reviews/<機能名>-<関門>-<役>-r<回>.md |
| 指揮役の裁定 | docs/reviews/<機能名>-<関門>-ruling.md |
| Takuma の承認 | docs/approvals/<機能名>-<関門>.md |
| テスト計画、検証レポート、証拠 | docs/verification/<機能名>/test-plan.md、verification.md、evidence/ |
| 振り返り | docs/reviews/retro-<機能名>.md |

## Takuma だけが行うこと
PRD の承認、main へのマージ、実機での確認、プライバシーポリシーと利用規約の承認、App Store への提出、Web の本番公開、段階リリースの操作、本番デプロイ、課金、データの削除、.claude/ と .github/ の変更。
