# プロダクト全体定義（product.md）

- 更新日：2026-11-11　書いた役：pdm
- 現在の仮称：`base-up（仮）`［実データ］（`.claude/org/app.json`）
- 提供形態：Web ブラウザ単体で動作するレトロアーケード風エンジニア思考ゲーム（`stacks` に `ios` がないため iOS ストア固有項目は非該当・`craft-pdm/web.md` に基づき定義）［実データ］

## 1. 対象の層
- **主対象（コア層）**：日本のソフトウェアエンジニア（実務経験1〜10年前後の Web・バックエンド・インフラエンジニア、および技術面接・システム設計面接・ケース面接を控えたエンジニア）［推測］。
  - 抱えている状況：実務のシステム設計（副作用・境界値・リソース制約のトレードオフ）や未知の規模を見積もるフェルミ推定の思考力を鍛えたいが、平日の業務の合間や移動中の5〜15分では重いコーディング環境や英語サブスク教材、分厚い対策本を開けない［推測］。
- **副対象（広がり層）**：プログラミングパズルや数値概算ゲームを好む情報系学生・PdM・テックリード層（同僚や X 上で思考診断ランクを比較して楽しむ層）［推測］。

## 2. 中心の Job
- **Job ストーリー**：技術面接の対策中や開発業務の合間の5〜15分に自分の設計判断や概算の感覚を確かめたいとき、環境構築や長文読解なしに要素の組み合わせ順序・制約の境界・桁の因数分解を試してどこで破綻したかをその場で目で見て確かめたい。そうすれば、退屈な暗記に頼らず楽しみながら自分の思考の弱点に気づき、設計議論や未知の数値見積もりで筋の通った仮説を組み立てられるようになる［推測］。
- **機能の面**：アカウント登録・インストール0秒で開始でき、1ステージ約2〜3分で「非可換な順序・副作用・境界制御」と「3段階の因数分解・オーダー概算」を試行し、失敗原因と5軸の思考特性を確認できる［推測］。
- **気持ちの面**：無機質な試験画面や長い英語教材で消耗するのではなく、80〜90年代アーケード筐体のようなネオン視覚変化とチップチューン効果音の手触りで「もう1手試したい」と没頭できる［推測］。
- **人の目の面**：単なる暇つぶしゲームではなくエンジニアとしての設計思考・概算センスを磨いており、認定ランクと5軸チャートを知的な話題として同僚や SNS に共有できる［推測］。

## 3. 対象の国と言語・見つけてもらう道（Web での位置づけ）
- **対象の国と言語**：国コード `JP`（日本）、主言語 `ja`（日本語 UI を既定とし、組織品質基準および海外エンジニア共有向けに `en` 辞書を併設。App Store は非該当）［実データ］。
- **見つけてもらう主の道**：**SNS の共有（X・技術コミュニティ Slack 等での『思考力診断カルテ』認定ランク S+〜C と5軸スコアのシェア）** を主の道とし、検索流入（「フェルミ推定 ゲーム」「エンジニア 思考力 診断」「システム設計 パズル」等）を副の道とする［推測］。
  - 選んだ理由：エンジニア向けのブラウザ完結型ミニゲーム・診断は、検索広告よりも「自分の5軸タイプとランクを貼って同僚と比べたくなる」SNS バイラルの方が獲得単価 ¥0 で初期流入を立ち上げやすいため［推測］。G5 公開前に `metadata/web.md` で画面タイトル・説明文・OGP 画像を整備する。

## 4. 競合と代替

| 名前 | URL | 評価の数 | 価格と課金の形（無料で使える範囲） | 強み | 繰り返し出る不満・構造上の制限（引用と URL） |
|---|---|---|---|---|---|
| Brilliant（Web / アプリ） | https://brilliant.org/ | JP App Store 605件（★4.7）［公開情報 <https://apps.apple.com/jp/app/brilliant-learn-math-coding/id913335252?see-all=reviews>］／US 33K件（★4.7）［公開情報 <https://apps.apple.com/us/app/brilliant-learn-math-coding/id913335252?see-all=reviews>］ | 無料枠は冒頭プレビューと日次キー制限のみ。全40+コース解放の Premium は年額一括払いで月額換算 ¥1,625/月（Family ¥3,250/月）［公開情報 <https://brilliant.org/premium/>］ | CS・論理・数学を対話型ビジュアル教材で段階学習できる［公開情報 <https://brilliant.org/premium/>］ | 日本語非対応とダークモード等の設定不足：「It’s also more than a bit disappointing to see there’s no options to learn through any other language than English.」［公開情報 <https://apps.apple.com/jp/app/brilliant-learn-math-coding/id913335252?see-all=reviews>］。年額一括課金の重さと単元順序の飛躍：「The special price for the subscription to sign up right away is only if you pay for it annually, meaning a pretty big chunk of change all at once」［公開情報 <https://apps.apple.com/us/app/brilliant-learn-math-coding/id913335252?see-all=reviews>］、「I found the lesson structure to be out of sequence, often referring to things that haven't been covered yet.」［公開情報 <https://news.ycombinator.com/item?id=39050606>］ |
| CodinGame（Web サービス） | https://www.codingame.com/start/ | 公式ページに単一評価件数表記なし（G2 等は 403 のため見ていない） | 個人向けパズル・ボット対戦は無料（要アカウント登録・コード記述提出）［公開情報 <https://www.codingame.com/start/>］ | 多言語のコード提出でゲーム画面上のボットや最適化課題を動かせる［公開情報 <https://www.codingame.com/start/>］ | アニメーション再生の遅さ・RPG装飾による集中阻害・エディタ補完不足・設計力との乖離：「the visuals, the (sometimes slow) execution of the code because of the animation, and the gaming references (descriptions) distracted me from actual coding and learning.」［公開情報 <https://news.ycombinator.com/item?id=13784590>］、「It's too bad that there's nothing like IntelliSense there」［公開情報 <https://news.ycombinator.com/item?id=11899981>］、「Design, architecture, UI/UX and communication are a lot more valuable than being able to write your own Sudoku Solver.」［公開情報 <https://news.ycombinator.com/item?id=26470452>］ |
| Human Resource Machine（アプリ / PC） | https://apps.apple.com/jp/app/human-resource-machine/id1005098334?see-all=reviews | JP App Store 140件（★4.6）［公開情報 <https://apps.apple.com/jp/app/human-resource-machine/id1005098334?see-all=reviews>］／US 416件（★4.5）［公開情報 <https://apps.apple.com/us/app/human-resource-machine/id1005098334?see-all=reviews>］ | 買い切り ¥800（無料体験枠なし・ブラウザ即時プレイ不可）［公開情報 <https://itunes.apple.com/search?term=Human+Resource+Machine&entity=software&country=JP&limit=3>］ | 命令ブロックの組み合わせと最適化で高い達成感を得られる論理パズル［公開情報 <https://apps.apple.com/jp/app/human-resource-machine/id1005098334?see-all=reviews>］ | 日本語訳の曖昧さによる意図不明・スマホでの長コード視認性悪化・失敗時ヒント不足：「日本語への翻訳が雑であり、問題の意図がところどころ分かりません...途中で何をすればよいのか分からず断念してしまいました」「後半の問題はコードが長い割にスマホで見ずらかったりする」［公開情報 <https://apps.apple.com/jp/app/human-resource-machine/id1005098334?see-all=reviews>］、「The only help you are given is in the form of either an example of the result or being chided when you get something wrong.」［公開情報 <https://apps.apple.com/us/app/human-resource-machine/id1005098334?see-all=reviews>］ |
| Quantable（Web サービス：Fermi Estimation ほか） | https://www.quantable.io/games | 公式ページに評価件数表記なし | 無料枠は 600+ 問・Games Basic Settings のみで解説・ヒント閲覧不可。Premium は月額 $34.99/月（年額換算 $19.99/月）［公開情報 <https://www.quantable.io/pricing>］ | クオンツ・テック面接向けに Fermi Estimation ゲーム等をブラウザで練習できる［公開情報 <https://www.quantable.io/games>］ | 英語専用かつ無料枠では解答解説とヒントが一切非公開（「Solutions: No Solutions」「Hints: No Hints」「Games: Basic Settings Only」）で、なぜ桁が外れたかの分解ロジックを無料で学べない［公開情報 <https://www.quantable.io/pricing>］ |
| Guesstimate（Web サービス） | https://www.getguesstimate.com/ | Hacker News 529 points / 67 comments［公開情報 <https://news.ycombinator.com/item?id=18785371>］ | 無料・オープンソースで確率分布スプレッドシートを作成可能［公開情報 <https://news.ycombinator.com/item?id=18785371>］ | 不確実な数値をセル分解とモンテカルロ計算でモデル化できる［公開情報 <https://news.ycombinator.com/item?id=18785371>］ | 積極開発が止まっており白紙の表計算ツールであるため、課題出題・ゲーム演出・二重計上や相関ミスの指摘機能がない：「it's not getting much more active development at this time」「Guesstimate doesn't currently allow for correlations as you're probably thinking of them.」［公開情報 <https://news.ycombinator.com/item?id=18785371>］ |
| 面接・思考対策書籍＋紙と電卓での手計算（アプリ以外の代替） | なし（非デジタル・紙） | 非該当 | 書籍1冊 ¥1,500〜¥2,500 前後＋紙・ペン［推測］ | 解説が体系的で通信不要で読める［推測］ | 1問解いて答え合わせするのに15〜30分かかり、自分の仮説のどこが境界値違反・二重計上かの動的シミュレーションがないため、隙間時間では開かず積読になりやすい［推測］ |

## 5. 位置づけ（1文）
英語サブスク教材や長時間のコード提出サイト・対策本とは異なり、**登録0秒・¥0の日本語レトロアーケード画面で「3手の設計トレードオフ制御」と「3スロットのフェルミ因数分解」を1ステージ3分でシミュレーション体験し、5軸の思考特性カルテまでその場で可視化できるエンジニア向けブラウザ思考筐体**である［推測］。

## 6. North Star と入力指標
- **North Star（1つ）**：
  - **週間思考診断完走プレイヤー数**：1週間のうちに『3-ACT COMBINATOR』と『FERMI BLASTER』の両モードを各1ステージ以上クリアし、『思考力診断カルテ』で認定ランクと5軸スコアを受け取ったユニークブラウザ数（見かけの PV や訪問数ではなく、顧客が「2種の思考試行と自己診断」の価値を受け取った数）［推測］。
- **入力指標（4個：チームが改善で直接動かせる数）**：
  1. **初回実行到達率**：トップ画面表示から60秒以内に第1ステージで最初の実行（`RUN` または `FIRE`）を行ったセッションの割合［推測］。
  2. **初回訪問での診断カルテ到達率**：初回訪問セッション内で2つのモードを各1ステージ以上クリアし、『思考力診断カルテ』のランク表示まで到達したセッションの割合（最初の機能 `001-arcade-core` が動かす入力指標）［推測］。
  3. **失敗後の即時リトライ率**：ステージ未達（クラッシュ／オーダー外れ）となった試行のうち、離脱せず60秒以内に構成を組み替えて再実行した割合［推測］。
  4. **7日以内再訪プレイ率**：1ステージ以上クリアしたユニークブラウザのうち、初回プレイから7日以内に再訪してステージを実行した割合［推測］。

## 7. アプリ名とサブタイトルの候補案（各30字以内）とキーワード案

### アプリ名・サブタイトル候補（4案）
すべての候補で30字以内、競合名・商標・誇大表現（「世界一の」等）不使用を満たす［実データ］。

| 案 | アプリ名案（字数） | サブタイトル案（字数） | 特徴と評価 |
|---|---|---|---|
| **案A（推奨）** | `LOGIC ARCADE`（12字） | `設計思考とフェルミ推定を鍛えるレトロ思考ゲーム`（23字） | 初見で「論理・設計×アーケード」が伝わり、2モードのどちらにも偏らず将来のモード追加にもそのまま使える［推測］。反論：一般語に近く固有造語より検索一意性が弱い［推測］。 |
| 案B | `ORDER & COMBO`（13字） | `3手パズルと桁推定で測るエンジニア思考カルテ`（22字） | 「実行順序（Order）と桁（Order of Magnitude）×3手コンボ」のダブルミーニングがエンジニアに刺さる［推測］。反論：初見でゲームアプリと直感しにくい［推測］。 |
| 案C | `BIT BRAIN BLASTER`（17字） | `3分でシステム思考と概算力を試すブラウザ筐体`（22字） | 80〜90年代アーケード筐体らしい勢いと語呂が最も強い［推測］。反論：反射神経シューティングゲームと誤認される懸念がある［推測］。 |
| 案D | `BASE-UP ARCADE`（14字） | `エンジニアの基礎思考力を可視化するレトロゲーム`（23字） | リポジトリ仮名 `base-up`（基礎思考力の底上げ）の意図を継承できる［推測］。反論：給与の「ベースアップ」と検索結果が競合しやすい［推測］。 |

### 検索・メタデータ用キーワード案（100バイト以内）
- キーワード案：`フェルミ推定,システム設計,論理パズル,エンジニア,思考診断`（30字・UTF-8 で **82バイト** <= 100バイト、競合名・商標・「app」・重複語なし）［実データ］。
