PASS

## 指摘
- 要修正、`docs/prd/001-arcade-core.md:250-254`、12章「非機能要件」の一部行に具体的な測り方または数値基準が不足している（250行目の「ローカル／高速回線で `1.0秒以内`」の計測条件・計測手段、252行目「セキュリティとプライバシー」の検証手段、253行目「判読性」の数値基準と自動監査手段、254行目「言語」の整合検査基準）。根拠：`.claude/skills/craft-tech-lead/SKILL.md` 1節「目標は『数字と測り方』の組」および2節 G0-6「12 に数字か測り方のない行があれば『要修正』」。直す方向：各行に数値と測り方の組を明記する（例：速さは Playwright Performance / Lighthouse CI で計測、セキュリティは Playwright ネットワーク監視でゲーム進行データの外部送信 `0件`、アクセシビリティは `@axe-core/playwright` 違反 `0件`・幅 `320px`×文字 `200%` で横スクロール `0px` かつテキスト重なり `0件`・キーボード完走テスト PASS、言語は `ja` / `en` 辞書キー不一致 `0件`）。
- 要修正、`docs/prd/001-arcade-core.md:281-289, 308`、15章「イベントとプライバシー」のプロパティ定義および18章 `Q-2` の選択肢と、13章 KPI・14章撤退基準の計測可能性が噛み合っていない。(1) 本アプリは `backend/` を持たず全イベントをブラウザ側で発火し、Cookie・個人識別子を使わない前提のため、サーバー側で「初回訪問セッション限定」「60秒以内の初回実行」「1ステージ以上クリアしたユニークブラウザの7日以内再訪（重複排除）」を結合できない。262行目に「（ブラウザ内コホート日数差分）」とあるにもかかわらず、281〜289行目の各イベントのプロパティ列にクライアント側判定フラグがない。(2) 308行目 `Q-2` 案1に例示された単体の `Cloudflare Web Analytics` はページビューと Core Web Vitals 専用でカスタム JS イベント・プロパティを受け付けず（公式仕様 <https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/>）、案2「サーバー標準アクセスログと任意アンケートのみ」では静的配信のため 13・14章の全ゲーム内指標が計測不能になる。根拠：`docs/org/gates.md:33-34` および `.claude/skills/craft-tech-lead/SKILL.md` 2節 G0-6「15 のイベントごとに、アプリとサーバーのどちらで取れるかを確かめる」。直す方向：(a) 15章のプロパティに `localStorage` / セッションメモリから算出する重複排除・コホート用 boolean / 区分（`Session Started` に `is_first_visit`、`Simulation Executed` に `is_first_exec_in_session`・`within_60s`・`is_first_7d_return_play`、`Stage Completed` に `is_first_ever_clear`、`Diagnostic Viewed` に `is_first_visit_session`・`is_first_qualified_in_session`、`Diagnostic Copied` に `is_first_copy_in_session`）を追加する、(b) 308行目 `Q-2` 案1の候補をカスタムイベント対応の Cookie レス解析（Umami Cloud Hobby・Cloudflare Workers Analytics Engine・Plausible Business 等。Core Web Vitals RUM は Cloudflare Web Analytics 併用可）に改め、案2を選ぶ場合は 13・14章の判定手段も合わせて見直す注記を添える。
- 要修正、`docs/prd/001-arcade-core.md:186-205`、『思考力診断カルテ』において「片方のモードのみ1ステージ以上クリアした状態」または「失敗履歴のみある状態（クリア0件）」の認定ランク表示が `AC-10`（両モード各1ステージ以上クリアで `S+`〜`C`）、`AC-11`（「1ステージ以上のプレイ履歴があり認定ランクが算出されている」）、`AC-12`（「プレイ履歴が `0件`」で `UNRANKED`）の間で曖昧になっている。根拠：`docs/prd/001-arcade-core.md:6, 261`（両モード各1ステージ以上クリア＋ランク表示を到達定義としている）および `docs/org/gates.md:42`（G1 の「一部だけ読めたとき」等の状態定義）。直す方向：6行目・261行目の定義と一致するよう、「両モードを各1ステージ以上クリアするまでは認定ランクを `UNRANKED` とし（クリア済みモード分の軸スコアのみ算出、未クリアモードへ誘導する導線を表示）、両モード各1ステージ以上クリア時点で `S+`〜`C` を認定して `AC-11` の共有コピーを有効化する」等の境界条件を `AC-10`〜`AC-12` に明記する。
- 提案、`docs/prd/001-arcade-core.md:221-225`、`AC-15`（ミュート切替）において初回起動時（`localStorage` 未保存時）の既定値が `SOUND ON` か `SOUND OFF` かを明記するとよい。
- 提案、`.claude/org/app.json:7-10`、`app.json` の `stacks` には `["web", "backend"]` が設定されているが、`docs/prd/product.md:5` および `docs/prd/001-arcade-core.md:111` では `backend/` を使わないブラウザ単体完結構成としている。`001-arcade-core` では `web/` のみを変更対象として進め問題ないが、プロダクト全体として今後も `backend/` を一切作らない方針が確定した場合は、Takuma に `.claude/org/app.json` の `stacks` から `"backend"` を外すか確認するとよい。

## 証拠
- 対象：`main...HEAD`（`371348a...84f6db5`）、観点：G0 技術実現性・非機能要件・月額費用・Web ブラウザ制約・第1部根拠および「G0 の前の確認」の全項目検証
  - `git diff --name-only main...HEAD` の一覧：
    - [x] `docs/prd/001-arcade-core.md`（全329行を読了・検証）
    - [x] `docs/prd/product.md`（全59行を読了・検証）
    - [x] `docs/progress.md`（全13行を読了・検証）

### 1. 全受け入れ条件（`AC-1`〜`AC-18`）ごとの実現性の表
| AC 番号 | 判定 | 根拠の URL かコマンド |
|---|---|---|
| AC-1〜AC-18 | すべて「今の構成で作れる」（「未確認」`0件`） | 標準 HTML5 Canvas / SVG / Web Audio API / `localStorage` / Clipboard API / CSS Grid・Flexbox・`prefers-reduced-motion` で外部ランタイム依存・バックエンド API なしに実装可能。`AC-4` 全順列評価（最大 2,100 通り）は Node.js v24.22.1 実測 `0.785 ms` で完了確認済み |

### 2. 第1部および末尾「G0 の前の確認」の検証
- 第1部行数：77行（<= 120行）、1章紹介文：3文・数値比較あり、競合アプリ・Web 5件＋非デジタル代替1件、全18 URL が HTTP 200 で応答し引用原文・価格・評価件数の実在を確認済み。

### 3. Web 公開・権限・ブラウザ制約で気になる点
1. Web Audio API の Autoplay 制限（初回ユーザー操作内で `AudioContext` 起動／`resume()` が必要、ヘッドレス検証用ゲイン状態公開つなぎ口を G1 で定義）
2. `localStorage` の `SecurityError` / `QuotaExceededError` / JSON 破損（`window.localStorage` getter ごと `try/catch` ラッパー化しインメモリ `Map` へ退避）
3. Clipboard API の権限とクロスブラウザ受け入れテスト制約（Firefox/WebKit は `grantPermissions(['clipboard-read'])` 非対応のため、拒否時フォールバックと検証つなぎ口を G1 で契約化）
4. オフライン動作（`AC-14`）のため動的チャンク分割や外部フォント CDN を使わず初期バンドルに同梱
5. 幅 `320px` × 文字拡大 `200%`（`rem` 基準折り返しと `max-width: 100%` 追従）
6. 電気通信事業法の外部送信規律（本番で匿名解析を入れる場合は G5 前に `docs/support/` へ公表記載）

### 4. 利用者 1,000 人あたりの月額費用の試算
- **利用者 1,000 人あたり月額 $0（約 ¥0/月）**（Cloudflare Pages Free 静的配信 $0/月＋バックエンド・外部 API $0/月＋Cloudflare Web Analytics / Umami Cloud Hobby / Workers Analytics Engine Free 枠 $0/月。Plausible Business 選択時のみ $19/月）。

- 読んだファイル：`.claude/skills/craft-tech-lead/SKILL.md`, `.claude/skills/craft-tech-lead/web.md`, `.claude/org/app.json`, `CLAUDE.md`, `docs/org/gates.md`, `docs/templates/review-report.md`, `docs/templates/prd.md`, `docs/idea-seed.md`, `docs/prd/product.md`, `docs/prd/001-arcade-core.md`, `docs/progress.md`, `contracts/dependencies.md`
- 実行したコマンドと結果：
  1. `git branch -a && git log --oneline -n 5 && git diff --name-only main...HEAD`
  2. 競合全5件（計10 URL）の実ページ取得と引用文・価格・評価件数の照合（すべて HTTP 200・実在確認）
  3. 全出典 URL（18件）の HTTP 200 疎通確認
  4. PRD 構造・第1部行数・全18 AC 検査スクリプト実行
  5. `AC-4` 全順列計算量ベンチマーク（2,100 通り `0.785 ms`）
- 開いた URL と確認した日付：2026-11-11（Brilliant, CodinGame, Human Resource Machine, Quantable, Guesstimate, Hacker News, Amplitude, Mixpanel, web.dev, MDN, Playwright Docs, Cloudflare / Umami / Plausible Docs）
- 未検証：なし

## 記録
- 関門：G0
- 判定した役：tech-lead
- 回：r1
- 対象：`docs/prd/001-arcade-core.md`、`feat/001-arcade-core`、`371348a...84f6db5`
- 日付：2026-11-11
