# デザイン調査 001-arcade-core：レトロアーケード型エンジニア思考ゲーム＆思考力診断カルテ

- 対象の PRD：docs/prd/001-arcade-core.md
- 書いた役：designer　日付：2026-11-12
- この文書は仕様（design/001-arcade-core.md）より先に書く。仕様の決定は、8 の R 番号を根拠に引く。
- 見られなかったもの、開けなかったページは「見ていない」と書く。推測で埋めない。

## 1. 問いと範囲
- この調査で決めたいこと：
  1. **初回開始から2モード完走・診断共有までの画面構成と操作負荷の最小化**：開発業務の合間や移動中の5〜15分に開いたエンジニアが、アカウント登録0秒・長文説明なしで『3-ACT COMBINATOR』（3手組み合わせ設計パズル）と『FERMI BLASTER』（3スロット因数分解推定ゲーム）の両方を各1ステージ以上クリアし、『思考力診断カルテ』の認定ランク確認・共有コピーまで迷わず進めるナビゲーションと操作手順はどうあるべきか（G0 決定のアプリ名 `LOGIC ARCADE` およびヘッダー `JA / EN` 切替を含む）。
  2. **80〜90年代レトロアーケードの手触りと「迷路ドットイート型クローン NG」の両立**：ネオンカラー、ピクセル／ベクター風の軽快な視覚変化、スコアポップアップ、コンボ／ゲージ演出、Web Audio API によるチップチューン合成効果音というアーケードの高揚感を出しつつ、パックマン等の十字キー移動型迷路ドットイートゲームの模倣にならず、かつエンジニアの思考を邪魔しないシミュレーション表現はどう設計すべきか。
  3. **レトロネオン表現と Web アクセシビリティ・レスポンシブ要件の両立**：蛍光ネオン調の世界観を保ったまま、ライト／ダーク（`prefers-color-scheme`）および強制配色・高コントラスト（`forced-colors`）対応、WCAG 2.2 レベル AA のコントラスト比（通常文字 `4.5:1` 以上、大文字・UI部品・図形 `3:1` 以上）、最小幅 `320px` × 文字拡大率 `200%` での横はみ出し `0px` と最小押下領域 `24x24px` 以上、`prefers-reduced-motion: reduce` 時の画面シェイク `0px` 化と `1.0秒以内` 短縮再生、職場・移動中で事故を起こさない常設ミュート切替をどう同時に満たすか。
- 関係する受け入れ条件（AC 番号）：
  - 全受け入れ条件 `AC-1`〜`AC-20`
    - 初期3導線の `1.0秒以内` 提示・迷路クローンおよび未実装要素排除：`AC-1`
    - モード1『3-ACT COMBINATOR』全10ステージ選択・4属性／条件表示・`RUN` 再生（`3.0秒以内`）・解存在・`STEP` 1手検証とスロット維持 `RESET`（`0.2秒以内`）・`CRASHED` / `FAILED` デバッグログ：`AC-2`, `AC-3`, `AC-4`, `AC-5`, `AC-6`
    - モード2『FERMI BLASTER』全9ステージ構成・3スロット仮説カード選択・`FIRE` 再生（`3.0秒以内`）と4段階オーダー判定・基準因数分解式／罠カード解説とスロット初期化 `RESET`（`0.2秒以内`）・解と罠カード存在：`AC-7`, `AC-8`, `AC-9`, `AC-19`
    - 『思考力診断カルテ』5軸スコア＆5角形レーダーチャート・総合認定ランク（`S+`〜`C` / 未解放時 `UNRANKED` と未クリア側第1ステージ開始導線）・結果テキスト共有コピーと権限拒否時の手動コピー領域フォールバック：`AC-10`, `AC-11`, `AC-12`, `AC-20`
    - スロット未充足時の実行ボタン `disabled` 化と不足スロット名案内：`AC-13`
    - オフライン完走・`localStorage` 永続化・アクセス拒否／破損 JSON 時のインメモリ退避と画面内通知：`AC-14`, `AC-16`
    - Web Audio API 合成効果音（初期自動発音 `0回`・外部音声通信 `0件`）と常設 `SOUND ON / OFF` 切替保持：`AC-15`
    - `prefers-reduced-motion` 時の画面シェイク `0px` 化・`1.0秒以内` 再生、および幅 `320px` / `1280px` × 文字拡大 `100%` / `200%` での横はみ出し `0px`・押下領域 `24x24px` 以上：`AC-17`, `AC-18`

## 2. ターゲット（仮説）
人に聞いた調査ではなく、PRD とレビューなどから立てた仮説として書く。
- 誰が：
  - **仮説（主対象）**：日本のソフトウェアエンジニア（実務経験1〜10年前後の Web・バックエンド・インフラ開発者、および技術面接・システム設計面接・フェルミ推定面接を控えた層）。英語専用の対話型教材や年額一括・高額月額サブスクに心理的ハードルを感じており（R-1, R-2, R-12）、また単純なアルゴリズム記述パズルよりも実務に近い「設計・アーキテクチャのトレードオフ判断」や「桁の概算センス」を短時間で試したい層（R-8）。
  - **仮説（副対象）**：論理パズルや概算診断を好む情報系学生・PdM・テックリード層。自分の思考特性ランクやスコアを X（旧Twitter）や社内 Slack に貼って同僚と比較したい層（R-16）。
- 使う場面（片手か、移動中か、何秒か）：
  - **仮説**：(1) 平日の CI/ビルド待ち・昼休み・終業後の PC ブラウザ（幅 `1280px` 前後、キーボード／マウス操作、約5〜15分）、および (2) 通勤電車内や外出先のスマートフォン縦持ち（最小幅 `320px`〜`390px`、**片手親指タップ・周囲に音を出せない環境**、トップ表示から初回実行まで `60秒以内`・1ステージあたり約 `120〜180秒`）の2場面で使われる（スマホでの長コード視認性悪化への不満：R-10、意図しない自動音声再生への不快感：R-28）。
- 起こしたい感情：
  - **仮説**：(1) 開いた瞬間に「面倒な会員登録や英語長文テストではなく、80〜90年代のアーケード計器盤に触れるようなワクワク感」が起きる、(2) 失敗した瞬間に「叱られたり理由を隠されたりする理不尽さ（R-11, R-12）ではなく、『STEP 2 の発熱上限／二重計上の罠カードか！』と膝を打って即リトライしたくなる納得感」が起きる、(3) 両モードクリア後に「自分の設計・概算バランスが5軸と認定ランクで可視化された達成感と、知的な話題として共有したい気持ち（R-16）」が起きる。
- 見た目の好み（色の量、情報の密度）と根拠（R 番号）：
  - **仮説（色の量：抑制された単一系統ベース＋意味に紐づく3〜4色のネオンアクセント）**：約4万人を対象とした視覚的嗜好研究（Reinecke & Gajos 2014）では、教育水準が高い層および男性比率が高い層ほど過剰にカラフルな画面への好感度が下がり、色数を絞った秩序ある配色が好まれることが示されている（R-17）。したがって画面全体を虹色の蛍光グラデーションで埋めるのではなく、落ち着いた計器ベース面の上に「主操作（シアン／ブルー系）」「達成／安全（エメラルド／ティール系）」「警告／副作用（アンバー系）」「クラッシュ／罠（マゼンタ／レッド系）」の意味を持つネオン色だけを限定使用する（R-17, R-20）。
  - **仮説（情報の密度：中密度・1画面集約グリッド）**：CodinGame のような過剰な RPG 風装飾や遅い演出はエンジニアの集中を削ぎ（R-6）、逆に Human Resource Machine 後半のように長い命令列を小画面に詰め込むとスマホで見づらくなる（R-10）。選択肢を「5〜7モジュール」または「各スロット3〜4カード」に絞り、Monkeytype のように余計な広告・装飾を排して盤面とリアルタイム数値フィードバックを1画面で見渡せる中密度構成が好まれる（R-15）。
- アクセシビリティで必要なこと（例：大きい文字）：
  - **明暗テーマと強制配色への適応**：ライト固定の学習アプリでは「目が疲れるため端末の色反転を使わざるを得ない」という強い不満が出ており（R-1）、OS の `prefers-color-scheme` に合わせたライト／ダーク両対応（R-24）と Windows ハイコントラスト等の `forced-colors: active` 対応（R-25）が必要である。
  - **コントラスト比と色覚多様性**：ネオン表現であっても通常文字 `4.5:1` 以上（R-18）、大文字・UI部品枠・ゲージやレーダーチャート図形 `3:1` 以上（R-19）を守り、赤緑の色相だけで正誤や罠を区別せずラベル文字・記号・数値差分を併記する（R-16, R-20, R-29）。
  - **大きい文字（200%拡大）と小画面（幅320px）でのリフロー・押下サイズ**：本文は読みやすい標準サイズ（`16px = 1rem` 以上）とし極小ドットフォントを避け（R-29）、文字拡大 `200%`（R-22）および幅 `320px`（R-21）で横スクロール `0px` で縦積みリフローし、すべてのボタン・スロット・カードが最低 `24x24px` 以上（スマホ片手操作の主ボタン・スロットは高さ `44px` 目安）を確保する（R-23, R-29）。
  - **動きの軽減・点滅防止・音声制御・キーボード完走**：前庭障害や画面酔いを防ぐため `prefers-reduced-motion: reduce` 時は画面シェイクを `0px` に止め再生を `1.0秒以内` に短縮し（R-26）、点滅は秒間3回以下に抑える（R-27）。初期表示時の自動発音は行わず常設ミュート切替を置き、音だけで情報を伝えない（R-28, R-29）。PC 利用者がキーボード（Tab / 矢印キー / Enter / Space）のみで全操作を完走でき、`2px` 以上・`3:1` 以上の明瞭なフォーカス枠を表示する（R-31, R-32）。

## 3. 競合
直接の競合を2から4本。
PRD 第3章の競合候補5件（Brilliant、CodinGame、Human Resource Machine、Quantable、Guesstimate）のうち、課題提示と正誤・スコア判定を備えた直接競合4本（競合A〜D）を下表で比較する。残る1件の **Guesstimate**（`https://www.getguesstimate.com/`）は確率分布スプレッドシート型の代替ツールであり、公開トップ HTML はタイトルのみの空シェルで動的アプリ実画面は見ていないが、Hacker News 上で開発者から積極開発の停止（「We're keeping it running, but it's not getting much more active development at this time.」）と相関指定の制約が報告されており（R-14）、白紙表計算ではなく「出題・3スロット分解・罠カード解説つきゲーム」にする根拠として第8章 R-14 に統合した。

| 項目 | 競合A：Brilliant | 競合B：CodinGame | 競合C：Human Resource Machine | 競合D：Quantable（Fermi Estimation） |
|---|---|---|---|---|
| 名前、URL、選んだ理由 | **Brilliant**（`https://brilliant.org/`、`https://brilliant.org/premium/`）<br>CS・論理思考を対話型ビジュアル操作で学ぶ最大手サービスのため選定。 | **CodinGame**（`https://www.codingame.com/start/`）<br>エンジニア向けにゲーム画面シミュレーションと客観スコアで課題を遊ばせる代表例のため選定。 | **Human Resource Machine**（`https://tomorrowcorporation.com/humanresourcemachine`、App Store）<br>命令ブロックの組み合わせとステップ実行アニメーションで論理パズルを解かせる直接の先駆例のため選定。 | **Quantable**（`https://www.quantable.io/games`、`https://www.quantable.io/games/fermiestimation`）<br>ブラウザ上で面接向け Fermi Estimation ゲームを提供する直接競合のため選定。 |
| 良い点（取り入れる考え、R 番号） | 対話型キャンバス上で段階的な視覚フィードバックと簡潔な解説を即座に返す構成（R-3）。→ 実行直後の視覚変化と端的な解説表示に取り入れる。 | 抽象的な問題文だけでなく、ゲーム画面上の挙動と客観スコア（`Real games, objective scores.`）で結果を見せる点（R-5）。→ シミュレーション盤面と数値スコア表示に取り入れる。 | コード構文（`1's and 0's and scary squiggly brackets`）を剥ぎ取り、少数のコマンド配置とデータの流れの視覚化だけで計算機論理を体験させる点（R-9）。→ 3スロットのモジュール配置方式に取り入れる。 | `/games/fermiestimation` で設定3項目（モード・形式・時間）に既定値が入っており、`Start Game` ボタン1つですぐゲームに入れる点（R-13）。→ 複雑な事前設定なしの即時プレイ導線に取り入れる。 |
| 主な作業のタップ数 | 公開トップから `I’m a learner` 選択で1タップだが、その先はオンボーディング・サインイン導線に入る。ログイン後のレッスン内解答タップ数は要アカウントのため**見ていない**。 | `/start/` から `Explore the arena` または `Connect your agent` 以降、アカウント認証と複数行のコード記述・提出が必要。ログイン後の IDE 内操作タップ数は要アカウントのため**見ていない**。 | 有料ネイティブアプリのため実機での正確なタップ数は**見ていない**（公式説明では最大11種のコマンドをドラッグ＆ドロップで並べて実行する方式：R-9）。 | トップ `/` → `Games`（1タップ）→ `Fermi Estimation`（2タップ）→ `Start Game`（3タップ）。直接 `/games/fermiestimation` からは `Start Game` の1タップ。開始後の動的出題画面内タップ数は JS 動的描画のため**見ていない**。 |
| ナビゲーションの構成 | トップは左上ロゴ＋右上 `Sign in` の最小ヘッダーと中央の属性選択2ボタン。`/premium/` では `Math` / `CS` / `Science` / `Data` の4分野タブ切替。 | 上部 `<header><nav>` に `Login`・`Sign up`・`Connect your agent`・`Visit CoderPad`。本文は `01 Connect` → `02 Run` → `03 Improve` の段階案内。 | 公式説明・レビューからはオフィスビルの階層（レベル）昇進型ステージ選択と、1画面内の INBOX / フロア枠 / OUTBOX＋命令列構成（実機メニュー階層は**見ていない**）。 | 上部 `<header>` に6項目（`Questions`・`Courses`・`Games ✨`・`Blogs ✨`・`Job Board`・`Pricing`）の水平ナビゲーション。ゲーム画面上部に `📊 View Stats` リンク。 |
| 最初の価値までの画面数 | 3画面以上（トップ → 属性選択・レベル診断／アカウント登録 → コース／レッスン画面。登録後の実画面は**見ていない**）。 | 3画面以上（`/start/` → アカウント作成／エージェント接続承認 `click Accept` → パズル選択／実行画面：R-5。ログイン後画面は**見ていない**）。 | ブラウザ即時プレイ不可（App Store 等での決済購入 → インストール → アプリ起動が必要。起動後の画面遷移は**見ていない**）。 | トップから3画面（`/` → `/games` → `/games/fermiestimation` で `Start Game`）。ゲーム個別 URL 直訪時は1画面目から開始可能。 |
| 空の状態 | ログイン後の学習履歴0件画面は要アカウントのため**見ていない**。 | ログイン後の未提出エディタ・戦績0件画面は要アカウントのため**見ていない**。 | 有料アプリ内の初期セーブ枠・未クリア画面は未購入のため**見ていない**。 | `/games/fermiestimation` 初期状態では設定パネル下にルール・採点説明文を表示。`📊 View Stats` の履歴0件表示は JS 動的画面のため**見ていない**。 |
| 権限の求め方 | 公開ページ表示時のブラウザ権限要求なし。学習継続・保存にアカウント登録（`Sign in`）と有料購読を求める。 | 公開ページ表示時のブラウザ権限要求なし。プレイ提出・ランキング参加にアカウント作成またはエージェント認可を求める（R-5）。 | 買い切り有料（¥800）。公開情報上に特別な端末権限要求の記載なし（実機起動時ダイアログは**見ていない**）。 | 公開ページ表示時のブラウザ権限要求なし（フッターに `Cookies` 表記あり）。解説閲覧・全設定解放にアカウント登録と有料購読を求める（R-12）。 |
| 色、文字、情報の密度 | オフホワイト背景（`#faf9f8`, `#DCDAD8`）にブルー〜パープル強調（`#375CDF`, `#9C62FF`）のライト基調（ダークモードなし：R-1）。サンセリフ体中心で余白が広い低〜中密度。 | ダークグレー背景（`#131517`, `#26272a`）にアンバー強調（`#F2BB13`）と白系文字（`#f9f9f9`）。等幅コマンドログとスコア指標が並ぶ高密度ダーク UI。 | 公式サイトはダークブラウン（`#332e2b`）＋アンバー／オレンジ（`#fcb900`, `#ff6900`）。アプリ内後半は命令コードが長くなりスマホ画面で高密度・視認性低下が起きる（R-10）。App Store 画面写真は**見ていない**。 | ニアブラック背景（`#0a0a0a`, `#121212`）にパープル強調（`#6F2DA8`, `#874DBA`）、成否に緑（`#34d399`）・赤（`#f87171`）。設定フォーム＋解説見出しの中密度ダーク UI（ライト切替は公開 HTML 上になし）。 |
| 文言の調子 | 英語のみ。親しみやすく導く家庭教師調（「Your personal tutor for math and coding」「He gets you to the answer without giving it to you.」）。 | 英語。競技的・挑戦的なエンジニアアリーナ調（「Build agents that can actually solve things.」「Compete on score and climb the leaderboard.」）。 | 英語公式はシニカルなユーモア調（「Be a good employee!」「Management is watching.」）。日本語訳は不自然で意図が伝わりにくい（R-10）。 | 英語のみ。面接突破を煽るエリート＆スラング調（「Ready to Conquer Your Next Quant Interview?」「Aura: Auraless / Can Flex Premium Constantly」：R-12）。 |
| App Store の評価（Web は口コミ、料金と無料の範囲） | JP App Store ★4.7（605件）、US ★4.7（33K件）。無料は冒頭・日次制限のみ、Premium は年額一括払いで月額換算 ¥1,625/月（Family ¥3,250/月）（R-2, R-3）。 | 公式に単一評価件数なし（G2 等外部レビューサイトは 403 のため**見ていない**、HN 口コミを調査）。個人パズルは無料（要登録：R-5）。 | JP App Store ★4.6（140件）、US ★4.5（416件）。買い切り ¥800、無料体験枠なし（R-10, R-11）。 | 公式に評価件数表記なし。無料枠は基礎設定のみ・解説ヒント一切なし。Premium 月額 $34.99/月（年払い換算 $19.99/月）（R-12）。 |
| 悪い点（レビューの不満の上位3つ、R 番号） | 1. ダークモードがなく目が疲れ、英語以外の言語で学べない（R-1）<br>2. 割引が年額一括払い限定で初期支払いが重い（R-2）<br>3. 単元順序が前後し未習事項が突然出る（R-4） | 1. アニメーションによる実行の遅さとゲーム装飾が学習・思考の集中を削ぐ（R-6）<br>2. ブラウザ上に IntelliSense 等の入力支援がない（R-7）<br>3. パズル解答に偏り、設計・アーキテクチャ力を測れない（R-8） | 1. 日本語翻訳が雑で問題の意図が分からず断念する（R-10）<br>2. 後半ステージでコードが長くなりスマホ画面で見づらい（R-10）<br>3. 失敗時に結果例が出るか叱られるだけで原因ヒントが乏しい（R-11） | 1. 無料枠は `No Solutions`・`No Hints` で外れた理由を学べない（R-12）<br>2. 無料は `Basic Settings Only` かつ英語専用・有料 $34.99/月と高額（R-12）<br>3. 最終数値スコア判定中心で因数分解や罠の構造解説がない（R-13） |

## 4. 手本（別カテゴリー）
- 名前と選んだ理由：
  1. **Monkeytype**（`https://github.com/monkeytypegame/monkeytype` / `https://monkeytype.com/`）：タイピング速度計測 Web アプリ（思考パズルとは別カテゴリー）。ターゲットであるソフトウェアエンジニアが日常の隙間時間に愛用しており、「登録不要で開いた瞬間にメイン操作ができるノイズレス画面」「リアルタイムの数値・エラーフィードバック」「ダークなネオン系からライトまで切り替えられるテーマ設計」の手本として選定（※`monkeytype.com` の JS 動的描画後の実画面は静的取得では CSS 読込前のため見ていない。公式 GitHub リポジトリの説明・仕様を確認）。
  2. **Wordle（The New York Times Games）**（`https://www.nytimes.com/games/wordle/index.html` / 構造記録：`https://en.wikipedia.org/wiki/Wordle`）：日替わり英単語推測ゲーム（別カテゴリーの一般向け語彙パズル）。「ログインや画像生成サーバーなしに、1タップの記号テキストコピーだけで SNS バイラルを生んだ結果共有 UX」および「ダークテーマ＋赤緑色覚異常に配慮したハイコントラスト配色（オレンジ／ブルー置換）」の業界手本として選定（※NYT 本番ページの JS 動的描画後ゲーム盤面は見ていない。査読済み解説文書で仕様を確認）。
- 取り入れる考え方（R 番号）：
  - **即時開始・ノイズ排除・リアルタイム計測表示（Monkeytype：R-15）**：「Minimalistic design」「unobtrusively presenting the text prompts and displaying typed characters in place, providing straightforward, real-time feedback on typos, speed, and accuracy.」（R-15）に学び、トップ画面から `1.0秒以内` に3導線を出し、プレイ画面では過剰な飾り枠を排して「シミュレーション盤面・3スロット・リアルタイム数値変化・構造化ログ」だけに視線を集める。
  - **1タップ整形テキスト共有と色覚・明暗配慮（Wordle：R-16）**：「introduction of a shareable emoji-based results format, which led to viral discussion on social media」および「offers both a dark theme and a high-contrast mode for colourblind accessibility, replacing the standard green and yellow colour scheme with orange and blue」（R-16）に学び、『思考力診断カルテ』の共有（`AC-11`）は認定ランクと5軸スコアをテキスト記号で整形したクリップボードコピーとし、配色は赤緑の対比だけに頼らないライト／ダーク／高コントラスト対応トークンにする。

## 5. ブランドの性格語と文言の調子
性格語は3から5語。

| 性格語 | 意味すること | 意味しないこと |
|---|---|---|
| **明快（Crisp）** | 目標条件・コスト・副作用・失敗ステップ・桁のズレが1画面の数値と構造化ログで一目で追え、日本語としても英語としても曖昧さがないこと（R-10, R-15）。 | 無機質な業務フォームや白紙の表計算シートになること（R-14）、または説明不足のまま専門用語だけを並べて突き放すこと。 |
| **軽快（Snappy）** | 登録0秒で始まり、3スロットを選んで押せば `3.0秒以内`（動き軽減時は `1.0秒以内`）にパルス／レーザー演出とチップチューン音が返り、`0.2秒以内` のリセットですぐ次の仮説を試せること（R-6, R-26）。 | スキップできない長い演出アニメーションで待たせること（R-6）、反射神経や十字キー操作を競う迷路アクションにすること、画面を常時揺らし続けること。 |
| **論理的（Analytical）** | 勘や統計丸暗記ではなく「順序・副作用・境界値の制御」と「母集団×絞り込み×単価の因数分解」で解け、失敗原因と罠カードの理由を無料でフェアに開示すること（R-8, R-11, R-12）。 | 重苦しい学術試験のようになること、または失敗時にプレイヤーを皮肉ったり課金壁で解説を隠したりすること（R-11, R-12）。 |
| **鮮烈（Neon-Tactile）** | 80〜90年代のベクター計器・アーケード筐体を思わせる高コントラストなネオンアクセントと等幅デジタル数値で、実行・クリア・ランク認定の瞬間を鮮やかに際立たせること（R-17, R-18, R-19）。 | 背景や本文まで蛍光色で塗りつぶしてコントラスト比を壊すこと（R-18）、走査線ノイズや極小ドット文字で可読性を犠牲にすること（R-29）。 |

文言の調子（どちら寄りかを書く）（NN/g の4軸に基づく：R-34）
- かしこまる ⇔ くだける：**ややくだける寄りの中央**。冗長な敬語（「〜してくださいませ」）は使わず、アーケード計器らしい簡潔な動詞・名詞表現（「3つのモジュールを配置」「STEP 2 で発熱上限を超過」）と自然な解説文で統一する。
- まじめ ⇔ おどける：**ややまじめ寄り**。モード名や判定バッジ（`FERMI BLASTER`、`PERFECT ORDER`）にはアーケードの高揚感を持たせるが、ステージ条件・デバッグログ・因数分解解説では比喩や冗談を排し、誤読ゼロの正確な条件文にする（R-10）。
- ていねい ⇔ ちゃかす：**ていねい（利用者への敬意を保つ）**。競合のように失敗時に叱ったり（`being chided`：R-11）無料利用者を煽ったり（`Auraless`：R-12）せず、未達時も「どのステップでどの閾値を何ポイント超えたか／どの罠カードが二重計上か」を客観的・建設的に伝える。
- 淡々 ⇔ 熱っぽい：**思考中・失敗ログは淡々、達成とランク認定の瞬間だけ熱っぽい**。問題検討中やエラー案内は冷静なテレメトリ調に徹し、`STAGE CLEAR`・`PERFECT ORDER`・総合認定ランク `S+`〜`C` 表示の瞬間のみ力強い称号表現で達成感を高める。

## 6. 合わせる当たり前と、差をつける点
- 合わせる当たり前（利用者がほかのアプリで覚えた型）と R 番号：
  1. **一貫した上部ヘッダーナビゲーションと常設ユーティリティ（Jakob の法則・APG Tabs：R-29, R-30, R-31）**：左上にアプリ名 `LOGIC ARCADE`（トップ／モード選択へ戻る）、上部に3つの主要ビュー（『3-ACT COMBINATOR』『FERMI BLASTER』『思考力診断カルテ』）の切替導線を置き、右上に常設の音声ミュート切替（`SOUND ON / OFF`）と言語切替（`JA / EN`）を配置する。
  2. **登録0秒の即時操作と、入力不足を防ぐ事前ガイド（R-5, R-13, R-15）**：初回表示でログイン画面や通知許可ダイアログを出さず `1.0秒以内` に操作可能とし（`AC-1`）、3スロット未充足時は `RUN` / `STEP` / `FIRE` ボタンを `disabled` にして不足スロット名（`STEP 1`〜`STEP 3` / `ACT 1`〜`ACT 3`）をボタン近傍に明示する（`AC-13`）。
  3. **ドラッグ必須を避けたタップ／クリック＆キーボード両対応スロット操作と OS 設定追従（R-24, R-25, R-26, R-29, R-32）**：スマホ片手でも PC キーボードだけでも同じ手数で組めるよう、ドラッグ＆ドロップ専用にせず「カード／モジュールを押して空きスロットへ配置（または対象スロットを選択して差し替え）」できる標準 `<button>` ベース操作とし、`prefers-color-scheme`・`forced-colors`・`prefers-reduced-motion` に自動追従する。
- 差をつける点（1から2個。どの画面のどの瞬間か）と R 番号：
  1. **【モード1・モード2 プレイ画面：`RUN` / `STEP` / `FIRE` 押下直後のシミュレーション再生（最大3.0秒）から結果ログ点灯までの瞬間】「なぜ破綻・桁ズレしたか」がその場で目と数値で腑に落ちるベクター計器再生＆無料デバッグ／罠カード解剖ログ**
     - 競合ではアニメーションが遅すぎて邪魔になるか（R-6）、失敗時に叱られるだけ・解説が有料壁の向こうに隠される（R-11, R-12）。`LOGIC ARCADE` では、モード1で `RUN`（または試行回数加算なしの `STEP` 1手検証）を押した瞬間に3ステージ回路上の信号パルスとエネルギー・副作用ゲージが軽快に動き、破綻したそのステップでピタリと止まって `STEP 2 / OVERHEAT / 実測値 vs 上限値` のデバッグログが即座に開く（`AC-3`, `AC-5`, `AC-6`）。モード2でも `FIRE` で母集団オブジェクトの増殖→フィルタ収束→対数ターゲット帯へのレーザー着弾が再生された直後に、「基準因数分解式（`ACT 1 × ACT 2 × ACT 3`）」と「罠カード名・二重計上／単位ズレの理由」を全ステージ無料で即時開示する（`AC-8`, `AC-9`, R-12, R-13）。
  2. **【思考力診断カルテ画面：両モード各1ステージ以上クリア後にカルテを開いた瞬間＆共有コピーボタンを押した瞬間】2つの思考モードの履歴が1枚のアーケード認定証（`S+`〜`C` ＆ 5軸レーダーチャート）に統合され、1タップでテキスト共有できる体験**
     - 単発問題のやりっぱなしや白紙スプレッドシート（R-14）と異なり、設計パズル3軸（仕様読解力・順序構築力・リソース制御力）とフェルミ推定2軸（フェルミ概算センス・仮説精度）が5角形レーダーチャートと総合認定ランク `S+`〜`C` として結実し（`AC-10`）、Wordle 型の整形サマリーテキストを1タップでクリップボードへコピーして X や Slack にそのまま貼れる（`AC-11`, `AC-20`, R-16）。未解放時（`UNRANKED`）も行き止まりにせず、未クリア側モードの第1ステージへ直行する開始ボタンを提示して2モード完走を自然に促す（`AC-12`, R-33）。

## 7. 方向性の2案

| | 案A：純黒CRTブラウン管＆全面ドット絵筐体再現案 | 案B：ベクター・テレメトリ＆適応型ネオン計器盤案 |
|---|---|---|
| ひとことで | 画面全体をブラウン管ベゼル・走査線ノイズ・全面8bitピクセル文字・常時純黒背景＋強発光ネオンで覆い、80年代ゲームセンター筐体の外観をそのまま模倣する案。 | 80〜90年代のベクタースキャン計器・シンセラックをモチーフに、シミュレーション盤面とスコア／ランク演出にネオン波形・等幅数値・合成音を集中させ、操作UIと本文は明暗／高コントラスト適応トークンと流体グリッドDOMで組む案。 |
| 性格語との合い方 | 「鮮烈」は強く出るが、走査線エフェクトと極小ピクセル書体が問題条件や罠カード解説の可読性を下げ、「明快」「論理的」と衝突する。 | 飾り枠や走査線ノイズを削ぎ（B-2）、状態変化・ゲージ推移・レーザー着弾の瞬間だけにネオンとチップチューン音を効かせるため、「明快」「軽快」「論理的」「鮮烈」の4語すべてと一致する。 |
| ターゲットとの合い方 | 初見の懐かしさはあるが、日中の明るい環境やライトモード派には純黒＋蛍光色のハレーションが負担になり（R-1, R-24）、幅 `320px`・文字 `200%` で筐体飾り枠とドット文字が潰れてスマホ視認性不満（R-10）を再発させる。また迷路型レトロクローンの印象に近づきやすい。 | 技術職層が好む抑制された色数と秩序ある中密度レイアウトに合致し（R-17）、ライト（筐体インストラクションカード調）／ダーク（ナイト計器盤調）／`forced-colors` の全モードで高い可読性を保てる（R-18, R-24, R-25）。スマホ片手 `320px` でも PC キーボードでも破綻しない（R-21, R-23）。 |
| 選んだか、その理由 | **選ばない**。レトロの「表面的な古さ（走査線・ドット本文・黒背景固定・筐体額縁）」を持ち込むと、WCAG 2.2 AA コントラスト、幅 `320px` × 文字拡大 `200%` での横はみ出し `0px`、および条件文・デバッグログの瞬時の読みやすさと両立しないため（R-10, R-18, R-21, R-22, R-29）。 | **選ぶ**。80〜90年代アーケードの本質的な手触り（即時シミュレーション動作、ネオンアクセント、スコアポップアップ、チップチューン合成音）を生かしつつ、迷路クローン NG 要件と Web アクセシビリティ全基準を無理なく同時に達成できるため。 |

### 案Bにおける「レトロアーケードの手触り × 非クローン × アクセシビリティ要件」の両立方針（仕様への引き渡し整理）

| 設計論点 | 案Bでの具体的な解き方 | 根拠（R 番号） |
|---|---|---|
| **80〜90年代レトロ手触りと迷路クローン NG の両立** | 十字キー移動や迷路ドットイート盤面・既存キャラは一切作らない（`AC-1`）。モード1は「3段モジュール回路パイプライン（信号パルス移動＋エネルギー／副作用ゲージ波形＋`+SCORE` ポップアップ）」、モード2は「クラスター増殖→フィルタリング収束→対数オーダー帯へのレーザー発射メーター」として Canvas/SVG で視覚化する。効果音は Web Audio API の矩形波・三角波・ノイズ合成で実装し、イベントごとに音色を分けつつ視覚表示を必ず併記する。 | R-5, R-6, R-28, R-29 |
| **ネオンカラーとライト／ダーク／高コントラスト・WCAG 2.2 AA の両立** | CSS カスタムプロパティでセマンティック色トークンを定義し、`prefers-color-scheme: dark` では深紺スレート面（`#0B1020` 系）＋高輝度シアン／アンバー／マゼンタ／エメラルド、`prefers-color-scheme: light` では明るい計器カード面（`#F6F8FC` 系）＋深明度・高彩度のディープティール／コバルト／バーントアンバー／ディープマゼンタへ自動切替し、両テーマで通常文字 `4.5:1` 以上・大文字および UI 枠線／ゲージ／レーダーチャート線 `3:1` 以上を確保する。`forced-colors: active` 時は発光シャドウに頼らず `2px` 実線ボーダーとシステム色（`CanvasText`, `Highlight` 等）で構造を維持し、成否・罠・ランクは色だけでなく文字ラベル＋記号形状を併記する。 | R-1, R-16, R-17, R-18, R-19, R-20, R-24, R-25, R-29 |
| **ピクセル／ベクター感と幅320px × 文字拡大200%・押下サイズの両立** | 本文・条件・解説には拡大しても潰れない標準サンセリフ体（本文 `1rem = 16px` 以上）を使い、ステップ番号・数値・ランク記号（`STEP 1`, `10^8`, `S+`）に等幅フォントと角張ったベクター枠（面取り／2px枠線）を用いてレトロ計器感を出す。全ボタン・スロット・カードは Canvas 外の標準 HTML 要素（`<button>` 等）で組み、`1280px` の2ペインから `320px` および `200%` 拡大時は1カラム縦積み（スロットも横幅不足時は縦3段スタック）へ自動折り返しして横はみ出し `0px`・全押下要素 `24x24px` 以上（スマホ主操作は高さ `44px` 目安）を守る。 | R-10, R-21, R-22, R-23, R-29 |
| **スコア／シェイク演出と `prefers-reduced-motion`・ミュート保持の両立** | 通常時も再生は `3.0秒以内` とし、1秒あたり3回を超える点滅は作らない。`prefers-reduced-motion: reduce` 時は画面シェイク変位を `0px` に完全抑止し、ステップ状態遷移を `1.0秒以内` で完了させる（`AC-17`）。音声はページ読込時の自動再生 `0回` とし、ヘッダーの常設 `SOUND ON / OFF` ボタンと `localStorage`（不可時はメモリ）で状態を保持する（`AC-15`, `AC-16`）。 | R-6, R-26, R-27, R-28, R-29 |

## 8. 発見の一覧

| R | 発見（引用は「」で） | 出典 URL | 確認日 |
|---|---|---|---|
| R-1 | Brilliant の JP App Store レビューで「I have to invert the colors on my device to do the lessons without straining my eyes, because there’s no dark mode. It’s also more than a bit disappointing to see there’s no options to learn through any other language than English.」と指摘されており、思考・学習系画面ではライト／ダーク両対応と日本語 UI 対応が目の負担軽減と継続に直結する。 | https://apps.apple.com/jp/app/brilliant-learn-math-coding/id913335252?see-all=reviews | 2026-11-12 |
| R-2 | Brilliant の US App Store レビューで「The special price for the subscription to sign up right away is only if you pay for it annually, meaning a pretty big chunk of change all at once」と不満が出ており、習慣化前の高額課金・登録壁をなくし登録0秒・¥0で全ステージを試せる導線が有効である。 | https://apps.apple.com/us/app/brilliant-learn-math-coding/id913335252?see-all=reviews | 2026-11-12 |
| R-3 | Brilliant 公式 Premium ページ（年額一括 Individual ¥1,625/月換算）では「Unlimited access to 40+ interactive courses with real-time feedback and simple explanations to make learning efficient.」と対話型即時フィードバックと簡潔な解説を中核価値として提示している。 | https://brilliant.org/premium/ | 2026-11-12 |
| R-4 | Brilliant に対する Hacker News の議論で「I found the lesson structure to be out of sequence, often referring to things that haven't been covered yet.」と単元順序の飛躍が批判されており、ステージ1から段階的に制約概念（順序→副作用→if境界値）を導入する設計が必要である。 | https://news.ycombinator.com/item?id=39050606 | 2026-11-12 |
| R-5 | CodinGame `/start/` は「Real games, objective scores.」とゲーム盤面・客観スコアの魅力を持つ一方、開始手順で「Open it, create your CodinGame account or sign in, and click Accept.」とアカウント作成・認証を必須としており、隙間時間利用では登録不要の即時開始で差をつけられる。 | https://www.codingame.com/start/ | 2026-11-12 |
| R-6 | CodinGame に対する Hacker News コメントで「the (sometimes slow) execution of the code because of the animation, and the gaming references (descriptions) distracted me from actual coding and learning.」と指摘されており、レトロ演出は `3.0秒以内` の軽快な再生に留め、課題理解を妨げる過剰な装飾文を省く必要がある。 | https://news.ycombinator.com/item?id=13784590 | 2026-11-12 |
| R-7 | CodinGame に対する Hacker News コメントで「It's too bad that there's nothing like IntelliSense there」とブラウザ上でのコード記述のやりづらさが指摘されており、コード入力を不要にして3スロットの選択操作だけで論理を試せる UI が短時間プレイに適する。 | https://news.ycombinator.com/item?id=11899981 | 2026-11-12 |
| R-8 | Hacker News の開発者議論で「Design, architecture, UI/UX and communication are a lot more valuable than being able to write your own Sudoku Solver.」と指摘されており、文法パズルではなくリソース制約・副作用・境界値のシステム設計トレードオフを題材にする意義が裏付けられる。 | https://news.ycombinator.com/item?id=26470452 | 2026-11-12 |
| R-9 | Human Resource Machine 公式サイトでは「Automate it by programming your little office worker with simple drag n' drop commands.」と構文記号を排した少数コマンドの組み合わせと実行の視覚化によって論理の本質を楽しませている。 | https://tomorrowcorporation.com/humanresourcemachine | 2026-11-12 |
| R-10 | Human Resource Machine（買い切り ¥800）の JP App Store レビューで「日本語への翻訳が雑であり、問題の意図がところどころ分かりません」「後半の問題はコードが長い割にスマホで見ずらかったりする」と指摘されており、誤読のない自然な日本語文言とスマホでも溢れない「3ステップ固定スロット」が不可欠である。 | https://apps.apple.com/jp/app/human-resource-machine/id1005098334?see-all=reviews | 2026-11-12 |
| R-11 | Human Resource Machine の US App Store レビューで「The only help you are given is in the form of either an example of the result or being chided when you get something wrong.」と失敗時のフィードバック不足が批判されており、失敗時は叱らずに「失敗発生ステップ・原因種別・期待値と実測値」のデバッグログを明示すべきである。 | https://apps.apple.com/us/app/human-resource-machine/id1005098334?see-all=reviews | 2026-11-12 |
| R-12 | Quantable `/pricing`（Monthly `$34.99 /month`）では無料枠が「Solutions No Solutions」「Hints No Hints」「Games Basic Settings Only」「Learning Experience Get Stuck Frequently」と制限されており、基準因数分解式と罠カード解説を無料で毎回開示することが強い差別化になる。 | https://www.quantable.io/pricing | 2026-11-12 |
| R-13 | Quantable `/games/fermiestimation` は既定値つきフォームと `Start Game` で素早く始められる一方、採点説明は「If your answer is perfectly correct, you'll get 1 point.」と最終数値の正誤中心であり、3段階の分解スロットと対数オーダー4段階判定によってフェルミ推定本来の納得感を作れる。 | https://www.quantable.io/games/fermiestimation | 2026-11-12 |
| R-14 | フェルミ推定用の確率分布表計算ツール Guesstimate について、Hacker News 上で開発者から「We're keeping it running, but it's not getting much more active development at this time.」と積極開発の停止が述べられ、白紙シートゆえに出題や二重計上の罠指摘もないため、課題内蔵型のアーケード形式が求められる。 | https://news.ycombinator.com/item?id=18785371 | 2026-11-12 |
| R-15 | 別カテゴリー手本 Monkeytype の公式リポジトリでは「Minimalistic design, with optional advertisements and focus mode while typing」「providing straightforward, real-time feedback on typos, speed, and accuracy.」と定義されており、不要な装飾を削いでメイン盤面とリアルタイム数値フィードバックに集中させる構成の手本となる。 | https://github.com/monkeytypegame/monkeytype | 2026-11-12 |
| R-16 | 別カテゴリー手本 Wordle の解説（Wikipedia 査読済み版）では「It gained widespread popularity in late 2021 after the introduction of a shareable emoji-based results format, which led to viral discussion on social media.」および「offers both a dark theme and a high-contrast mode for colourblind accessibility, replacing the standard green and yellow colour scheme with orange and blue.」と記録されており、1タップの記号テキスト共有と色覚・明暗対応の手本となる。 | https://en.wikipedia.org/wiki/Wordle | 2026-11-12 |
| R-17 | Reinecke & Gajos (2014) の視覚的嗜好調査では「Females, for example, liked colorful websites more than males. A high education level generally lowers this preference for colorfulness.」と報告されており、エンジニア層には多色過多を避け、落ち着いたベース面＋意味を限定したネオンアクセントの中密度設計が適する。 | https://eecs.harvard.edu/~kgajos/papers/2014/reinecke14visual.shtml | 2026-11-12 |
| R-18 | WCAG 2.2 達成基準 1.4.3 Contrast (Minimum)（AA）は「The visual presentation of text and images of text has a contrast ratio of at least 4.5:1」（大文字は `3:1`）を求めており、ネオン配色でもライト・ダーク双方で背景との輝度差を数値で保証する必要がある。 | https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html | 2026-11-12 |
| R-19 | WCAG 2.2 達成基準 1.4.11 Non-text Contrast（AA）は UI 部品の枠・状態および意味を持つ図形要素に対し「have a contrast ratio of at least 3:1 against adjacent color(s)」を求めており、スロット枠・エネルギーゲージ・5角形レーダーチャートの線にも `3:1` 以上を適用する必要がある。 | https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html | 2026-11-12 |
| R-20 | WCAG 2.2 達成基準 1.4.1 Use of Color（A）は「Color is not used as the only visual means of conveying information」と定めており、クリア・クラッシュ・罠カード・認定ランクはネオン色だけでなくテキストバッジとアイコン記号を必ず併記する。 | https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html | 2026-11-12 |
| R-21 | WCAG 2.2 達成基準 1.4.10 Reflow（AA）は「Vertical scrolling content at a width equivalent to 320 CSS pixels」での2次元スクロール不要を求めており、幅 `320px` では2ペインや横3列スロットが溢れないよう1カラム縦積みへリフローさせる必要がある。 | https://www.w3.org/WAI/WCAG22/Understanding/reflow.html | 2026-11-12 |
| R-22 | WCAG 2.2 達成基準 1.4.4 Resize Text（AA）は「text can be resized without assistive technology up to 200 percent without loss of content or functionality.」を求めており、全操作 UI と文字サイズを `rem` 基準の流体 DOM で組み、`200%` 拡大時も文字切れ・重なり `0件` にする。 | https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html | 2026-11-12 |
| R-23 | WCAG 2.2 達成基準 2.5.8 Target Size (Minimum)（AA）は「The size of the target for pointer inputs is at least 24 by 24 CSS pixels」を求めており、ステージ選択・モジュール／仮説カード・スロット・ヘッダー切替ボタンすべてを `24x24px` 以上（スマホ主操作は高さ `44px` 目安）に設計する。 | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | 2026-11-12 |
| R-24 | MDN `prefers-color-scheme` 文書では「The prefers-color-scheme CSS media feature is used to detect if a user has requested light or dark color themes.」と定義されており、OS 設定に追従してダーク（ナイト計器盤）とライト（インストラクションカード調）の配色トークンを切り替える根拠となる。 | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme | 2026-11-12 |
| R-25 | MDN `forced-colors` 文書では「The forced-colors CSS media feature is used to detect if the user agent has enabled a forced colors mode」と定義されており、Windows ハイコントラスト等で背景装飾や box-shadow 発光が消えても `2px` 実線枠とシステム色で選択状態と境界が判別できるようにする。 | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors | 2026-11-12 |
| R-26 | MDN `prefers-reduced-motion` 文書では「The prefers-reduced-motion CSS media feature is used to detect if a user has enabled a setting on their device to minimize the amount of non-essential motion.」「Such animations can trigger discomfort for those with vestibular motion disorders」と説明されており、有効時は画面シェイク変位 `0px`・再生 `1.0秒以内` に切り替える。 | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion | 2026-11-12 |
| R-27 | WCAG 2.2 達成基準 2.3.1 Three Flashes or Below Threshold（A）は「Web pages do not contain anything that flashes more than three times in any one second period」と定めており、レトロなクラッシュ演出やレーザー発射演出でも秒間3回を超える点滅を禁止する。 | https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html | 2026-11-12 |
| R-28 | MDN Autoplay guide では「Automatically starting the playback of audio (or videos with audio tracks) immediately upon page load can be an unwelcome surprise to users.」と明記されており、ページ初期表示時の自動音声再生を `0回` とし、明示的なユーザー操作時のみ Web Audio 合成音を鳴らす根拠となる。 | https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide | 2026-11-12 |
| R-29 | Game Accessibility Guidelines では「Use an easily readable default font size」「Allow the font size to be adjusted」「Provide high contrast between text/UI and background」「Ensure no essential information is conveyed by sounds alone」「Provide separate volume controls or mutes for effects, speech and background / music」と定めており、本文への極小ドット書体不使用・常設ミュート切替・音と視覚ログの併用を支える。 | https://gameaccessibilityguidelines.com/full-list/ | 2026-11-12 |
| R-30 | Laws of UX（Jakob's Law）は「Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know.」と述べており、左上ロゴ・上部モード切替・右上設定ボタンの定石配置に従う根拠となる。 | https://lawsofux.com/jakobs-law/ | 2026-11-12 |
| R-31 | WAI-ARIA APG Tabs Pattern は「Tabs are a set of layered sections of content, known as tab panels, that display one panel of content at a time.」と定義しており、上部ナビゲーションおよびステージ難易度帯切替におけるキーボード矢印移動・選択状態明示の標準型となる。 | https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ | 2026-11-12 |
| R-32 | WCAG 2.2 達成基準 2.4.13 Focus Appearance はキーボードフォーカス枠に「is at least as large as the area of a 2 CSS pixel thick」の外周面積と `3:1` 以上のコントラストを求めており、全ボタン・スロット・カードに `2px` 以上の高コントラストフォーカスリングを設ける根拠となる。 | https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html | 2026-11-12 |
| R-33 | NN/g の Empty States 指針は「Empty states provide opportunities for designers to communicate system status, increase learnability of the system, and deliver direct pathways for key tasks.」と述べており、『思考力診断カルテ』の未解放状態（`UNRANKED`）で解放条件の説明と未クリア側モード第1ステージへの開始ボタンを並べる根拠となる。 | https://www.nngroup.com/articles/empty-state-interface-design/ | 2026-11-12 |
| R-34 | NN/g の Tone of Voice 指針は「The tone of any piece of content can be analyzed along 4 dimensions: humor, formality, respectfulness, and enthusiasm.」と定義しており、日英すべての UI 文言・エラー案内・解説文の調子を4軸で一貫させる根拠となる。 | https://www.nngroup.com/articles/tone-of-voice-dimensions/ | 2026-11-12 |

見られなかったもの（例：App Store の画面写真、ログインが要る画面）：
- **Brilliant**：App Store ページ上のスクリーンショット画像、およびアカウント登録・ログイン（`Sign in`）後に入る対話型レッスンキャンバス実画面・学習履歴0件の空状態画面は**見ていない**。
- **CodinGame**：アカウント作成・ログイン後に入るブラウザ IDE 実画面・戦績0件の空状態画面、および HTTP 403 となる外部レビュー集約サイト（G2 等）は**見ていない**。
- **Human Resource Machine**：App Store ページ上のスクリーンショット画像、および有料買い切りアプリ（¥800）購入・インストール後の実機プレイ画面・メニュー階層・初期セーブ画面は**見ていない**。
- **Quantable / Guesstimate**：Quantable `/games/fermiestimation` で `Start Game` を押した後にクライアント JS で動的生成される出題・回答入力画面、`📊 View Stats` の動的モーダル／統計画面、および有料サブスクリプション限定の詳細解説画面は**見ていない**。また Guesstimate（`https://www.getguesstimate.com/`）の JS 描画後のスプレッドシート実画面も静的 HTML が空シェルのため**見ていない**。
- **Monkeytype / Wordle**：`https://monkeytype.com/` および `https://www.nytimes.com/games/wordle/index.html` のクライアント JS・CSS 実行後の動的ゲーム画面そのものは静的取得では描画前のため**見ていない**（公式 GitHub リポジトリ文書および Wikipedia 査読済み解説文書で仕様を確認した）。

## 確かめ（提出前に designer が印を付ける。design-reviewer はこれを信じずに確かめる）
- [x] R が5つ以上あり、どれにも出典 URL と確認日がある
- [x] 競合を2つ以上と、手本を1つ調べた。不満は引用と URL 付き
- [x] ターゲットは「仮説」と書き、根拠に R 番号がある
- [x] 性格語ごとに「意味しないこと」がある
- [x] 差をつける点が1から2個ある
- [x] 方向性の2案と、選ばなかった理由がある
