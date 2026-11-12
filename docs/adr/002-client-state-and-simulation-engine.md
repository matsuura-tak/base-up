# B ADR 002：クライアント状態永続化スキーマ・純粋関数シミュレーション＆網羅ソルバー・Web Audio 合成エンジン

- 状態：承認
- 書いた役：tech-lead　日付：2026-11-12
- 関係する PRD、設計メモ、契約：docs/prd/001-arcade-core.md、docs/adr/features/001-arcade-core.md、contracts/openapi.yaml、contracts/arcade-test-seam.md
- 元に戻す手間：大（利用者のブラウザ `localStorage` に保存されたクリア履歴スキーマとの後方互換維持、および全19ステージの正解判定数理モデルの再検証を伴うため）

## 背景
`001-arcade-core` では外部バックエンドや外部音声ファイルを持たず、次の4つの元に戻しにくい中核設計を実装前に確定する必要がある：
1. **クライアント永続化データの形と例外耐性（`AC-10`〜`AC-12`, `AC-14`〜`AC-16`）**：5軸整数スコア算出式（PRD 11章：`C_1, F_count, a_s, R_1, K_1, C_2, q_s, F_2, T_2`）と7日再訪等の匿名コホート真偽値（PRD 15章）を欠損なく復元でき、かつ `window.localStorage` getter 例外や破損 JSON でも未捕捉例外 `0件` で動く保存構造。
2. **シミュレーション実行エンジンと全19ステージ網羅ソルバー（`AC-3`〜`AC-9`, `AC-19`）**：1ステップ検証（`STEP`）と3手連続実行（`RUN`）で結果が1ミリも食い違わず、モード1全10ステージの全順列 `P(n,3)`・モード2全9ステージの全カード組を数ミリ秒で網羅検証できる決定論的モデル。
3. **Web Audio API チップチューン合成エンジン（`AC-15`）**：外部音源通信 `0件`・初期自動再生 `0回` でレトロ効果音を鳴らし、`SOUND OFF` 時に確実に無音化でき、ヘッドレスブラウザでも発音・ゲイン状態を機械検証できる音声アーキテクチャ。
4. **ヘッドレス受け入れテストとの観測境界（`verifier-r2` つなぎ口）**：Canvas 2D 描画内部や Web Audio 内部の状態を不安定なピクセル比較や `sleep` なしで Playwright から決定論的に検証できるインターフェース。

## 決定
1. **永続化スキーマ `PersistedArcadeStateV1`**：`localStorage` キーを `'logic_arcade_state_v1'` に固定し、`schemaVersion: 1` を持つ単一 JSON オブジェクトで全履歴・音声設定・言語設定・初回訪問／初回クリア時刻を保存する。`window.localStorage` への全アクセス（プロパティ参照自体を含む）を `SafeStorageAdapter` の `try/catch` で包み、例外時はインメモリ Map ストアへ即時退避して `storage-fallback-banner` を出し、破損 JSON・未知 enum 値は `migratePersistedState` で安全に正規化初期化する。
2. **純粋関数ドメイン＆決定論的ステートマシン**：全19ステージのシミュレーション計算・4段階オーダー判定・網羅ソルバー・5軸診断算出を DOM / React / Canvas / タイマーから完全分離した純粋 TypeScript 関数として実装する。再生アニメーションやトースト消去の進行は `page.clock` で制御可能な標準タイマー／時刻差分で駆動し、Canvas 状態は DOM テレメトリと完全に同一の純粋状態スナップショットを参照する。
3. **Web Audio 直接合成＋テスト公開口 `window.__ARCADE_TEST_API__`**：外部音声ライブラリ（Tone.js / Howler.js 等）は使わず、ユーザー操作イベントハンドラ内で遅延初期化する標準 `AudioContext` + `OscillatorNode`（矩形波・三角波）+ 単一マスター `GainNode` で実装する。Playwright 検証用に読み取り専用の `window.__ARCADE_TEST_API__`（`getSimulationSnapshot`, `auditAllStages`, `getAudioState`, `getEmittedEvents`）を常時公開する。

## 検討した案

| 案 | 良い点 | 悪い点 | 選ばなかった理由 |
|---|---|---|---|
| **案1（採用）：`localStorage` 単一版管理 JSON（`logic_arcade_state_v1`）＋純粋関数エンジン＋標準 Web Audio API 直接合成** | ・同期読込により初回描画フレーム（`< 1.0秒`）から履歴ちらつき `0件`（`CLS <= 0.1`）で進捗を出せる<br>・純粋関数のため全19ステージ計 `1,569` 通りの網羅ソルバーが `3ms 未満` で完了する<br>・ランタイム外部依存 `0個`（音声・状態管理ライブラリ不要） | ・`localStorage` は同期 API・容量上限約 `5MB` であり、プライベートブラウズ等で `SecurityError` / `QuotaExceededError` が起きうるためアダプタ実装が必須<br>・Web Audio のエンベロープ制御（約80行）を自前で書く必要がある | **採用**（保存データ量は約 `1.5 KB` であり `5MB` 制限に対して3,000倍以上の余裕がある） |
| **案2：IndexedDB（非同期ストレージ）によるプレイ履歴永続化** | ・大容量データを非同期で保存でき、構造化ストアを持てる | ・初期マウント時に必ず非同期読込待ちが入り、初期表示での数値ちらつき防止やテストでのシード投入・getter 例外検証（`AC-16`）が複雑化する | 約 `1.5 KB` の集計オブジェクトに対して非同期 DB は過剰であり、`AC-14`/`AC-16` の同期復元・シード検証と相性が悪いため不採用 |
| **案3：外部音声合成ライブラリ（Tone.js 等）＋Canvas ゲームエンジン（Phaser / PixiJS）の導入** | ・高度なシンセエフェクトやスプライト物理演算が用意されている | ・Tone.js 単体で gzip `60 KB+`、Phaser 等で gzip `250 KB+` となり初期 JS 予算 `120 KB` を即座に超過するうえ、Canvas 内部に UI を持つと `320px × 200%` リフローやキーボード操作・axe 監査が破綻する | バンドル予算超過かつアクセシビリティ逸脱が大きく、単純なパルス・レーザー描画と4種チップチューン効果音には完全に過剰なため不採用 |

## いちばん強い反論と、それでも選んだ理由
- **いちばん強い反論**：「本番ビルドのグローバル変数に `window.__ARCADE_TEST_API__` を残すと、ブラウザのコンソールを開いた利用者が `window.__ARCADE_TEST_API__.auditAllStages()` を実行して全19ステージの代表正解順列・正解カード組カンニングできてしまうのではないか。」
- **それでも選んだ理由**：(1) 本アプリはクライアント単体完結の静的 JS バンドルであり、そもそもソースマップやバンドル内ステージ定数を読めるエンジニアであればブラウザ DevTools 上での解析自体は防げない（課金・賞金・全国ランキングがない自己学習ゲームであるため STRIDE 7章のとおり自己端末内解析は許容リスクである）。(2) 逆に「テスト時だけ別ビルド（`VITE_TEST_MODE=true`）にする」方式を採ると、**本番ビルドそのものを検証していない**ことになり、本番バンドルだけで起きる最適化バグを見逃す危険の方がはるかに大きい。さらに `window.__ARCADE_TEST_API__` は内部状態を一切書き換えない純粋な**読み取り専用メソッドのみ**に限定するため、本番の安全性・性能（メモリオーバーヘッド `0`）を一切損なわずに本番ビルド実物に対する決定論的 E2E 検証を実現できる。

## 結果
- **これで楽になること**：
  - `STEP`（1手検証）と `RUN`（3手連続実行）がまったく同じ1ステップ純粋遷移関数 `stepCombinatorOnce(stage, state, moduleId)` を共有するため、1手検証と本番実行の計算不一致が原理的に起きない。
  - 単体テスト（Node 上）と E2E テスト（本物ブラウザ上）の双方から同じ `auditAllStages()` を呼び出して `AC-4` と `AC-19` をミリ秒単位で保証できる。
  - Web Audio の発音有無とミュート時のゲイン `0` を、OS のスピーカー出力デバイス有無に依存しない `ubuntu-latest` ヘッドレス環境でも `getAudioState()` で100%確実にテストできる。
- **これで難しくなること、守り続けること**：
  - `PersistedArcadeStateV1` の既存フィールド名・意味を同じ `schemaVersion: 1` の中で破壊的変更してはならない（フィールド追加時はオプショナルまたは既定値補完とし、構造変更時は `schemaVersion: 2` と `v1 -> v2` マイグレーション関数・移行テストを必ず追加する）。
  - `AudioContext` はページ初期ロード時（モジュールトップレベルや `useEffect` 初回）には絶対に生成・発音せず、必ずユーザーの明示的なクリック／キー押下イベントハンドラ内で初期化または `resume()` し、`autoPlayBeforeGestureCount` を厳密に `0` に保つ。
  - アニメーション完了およびコピートースト消去（`3000ms`）は Playwright の `page.clock` で制御できるよう標準の `window.setTimeout` / `performance.now()` / `requestAnimationFrame` を用いて実装し、モジュールロード時に `window.setTimeout` 参照をキャッシュして束縛しない（`page.clock.install()` の差し替えを有効に保つため）。
- **元に戻すときの手順と手間**：
  - 手間：大（スキーマ変更を伴うため約2日）。保存構造を変える場合は旧キー `logic_arcade_state_v1` の読み取り互換アダプタを残したまま新スキーマへ変換保存するマイグレーション関数を挟む。

## 見直す条件
1. ステージ数が `100ステージ` を超え、またはプレイごとの詳細なリプレイログ配列を全件保存したくなり、`localStorage` 保存サイズが `500 KB` を超えたとき（IndexedDB への移行を検討する）。
2. BGM のマルチトラックシーケンス再生や複雑なリアルタイム音響フィルタが必要になり、Web Audio 直接合成コードが `300行` を超えたとき（軽量 Web Audio ラッパーの採用を検討する）。
3. オンライン認定試験モードなど、クライアント側での正解逆引きを抑止すべき要件が新たに生まれたとき（採点ロジックのバックエンド API 移行を検討する）。

## 確かめたこと
- 公式ドキュメント（2026-11-12 確認）：
  - Web Audio API / Autoplay guide：`https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API`、`https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide`
  - Web Storage API（`SecurityError` / `QuotaExceededError`）：`https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage`
  - Clipboard API `writeText`：`https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText`
  - Playwright Clock API：`https://playwright.dev/docs/clock`
- 実機検算（Node.js `v24.22.1`）：
  - モード1全10ステージ（計 `1,290` 順列）およびモード2全9ステージ（計 `279` 組み合わせ、合計 `1,569` 通り）の純粋関数ソルバーを実行し、全10ステージで `STAGE CLEAR` が `1〜7通り`（`0.5%〜5.8% <= 50%`）・ステージ8〜10で副作用機構および `if` 閾値発火を伴わないクリア `0通り`（`AC-4`）、全9ステージで `PERFECT ORDER` が `1〜4通り`（`3.7%〜11.1% <= 50%`）・各ステージ罠カード `3枚 >= 1枚`（`AC-19`）をすべて満たすことを実測 `3ms 未満` で確認済み。
  - PRD 11章の5軸 `Math.round` 算出式とランク閾値スイープを実行し、ゼロ除算 `0件`・全軸 `[0, 100]` 整数収束・全6ランク（`UNRANKED`, `C`, `B`, `A`, `S`, `S+`）到達を確認済み。

## 確かめ（B）
- [x] 案が2つ以上あり、どの案にも悪い点が書いてある
- [x] 反論、悪い結果、見直す条件が空でない
- [x] 確かめたことに、URL かコマンドの出力がある
