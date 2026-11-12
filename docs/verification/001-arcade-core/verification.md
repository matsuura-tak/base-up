# 検証レポート 001-arcade-core

置き場所：docs/verification/001-arcade-core/verification.md

判定：PASS

- 関門：G3（再検証 r2）
- 検証した役：verifier　日時：2026-11-13 02:12
- コミット：`c802f8a53e0ba05a57f9808f1739f7e7ed9b0416`（Web 実装最終コミット：`e5693b9258c47b926cd5f7609297966646147d47`）
- 環境：
  - ローカル実行環境：macOS `27.2`（Build `26B123`, `arm64`）、Node.js `v24.22.1`、npm `12.2.1`、Playwright `1.65.0`（ブラウザエンジン：`chromium` `158.0.8127.18`、`webkit` `27.2`）。画面の幅：デスクトップ `1280×800px`・スマホ最小幅 `320×640px`（文字拡大 `100%`・`200%`）。接続先の URL：`http://127.0.0.1:4173`（`web/dist` 本番ビルド静的配信サーバー `serve-dist.mjs`。スクリーンショット・axe 再監査時は `http://127.0.0.1:4174`、探索セッション時は `http://127.0.0.1:4175`、Lighthouse 計測時は `http://127.0.0.1:4173`）。
  - 同一コミット CI 実機実行環境（3エンジン全件確認）：GitHub Actions `ubuntu-26.04`（`26.04.1 LTS`、ワークフロー `web` run `43263542517`、コミット `c802f8a53e0ba05a57f9808f1739f7e7ed9b0416` ※Web 実装コミット `e5693b9258c47b926cd5f7609297966646147d47` の run `43259314748` も同一ビルドで `66 passed`）、Playwright `1.65.0`（`chromium`・`firefox`・`webkit` 全3エンジン、接続先 `http://127.0.0.1:4173`）。
  - バックエンドの接続先：なし（`001-arcade-core` はサーバー通信 `0件` のブラウザ単体完結 SPA であり、`contracts/openapi.yaml` の `paths` は `{}`）。

## 1. 実行したコマンドと結果

### コマンド 1：Web 本番ビルド・契約型生成・バンドル予算検査・単体テスト
- コマンド：`cd web && npm ci && npm run build && npm test`
- 終了コード：`0`
- テストの件数（成功 / 失敗 / 飛ばした）：`23 / 0 / 0`（6ファイル・23単体テスト）
- 出力：

```text
✨ openapi-typescript 7.13.0
🚀 ../contracts/openapi.yaml → src/generated/contracts.d.ts [38.92ms]
vite v8.3.8 building client environment for production...
✓ 37 modules transformed.
dist/index.html                   1.70 kB │ gzip:   0.76 kB
dist/assets/style-DVsiKx1T.css   26.09 kB │ gzip:   4.02 kB
dist/assets/index-C2JavOhI.js   350.12 kB │ gzip: 108.15 kB
✓ built in 88ms
Bundle budget check: JS raw=350129B gzip=107051B (104.54 KB / 120.00 KB), CSS raw=26096B gzip=4002B (3.91 KB / 20.00 KB)

 RUN  v5.1.0 /Users/takumamatsuura/src/base-up/web

 ✓ src/__tests__/storageAndRouter.test.ts (5 tests) 4ms
 ✓ src/__tests__/diagnostic.test.ts (4 tests) 3ms
 ✓ src/__tests__/engine.test.ts (7 tests) 6ms
 ✓ src/__tests__/i18n.test.ts (2 tests) 18ms
 ✓ src/__tests__/solver.test.ts (2 tests) 10ms
 ✓ src/__tests__/ui.test.tsx (3 tests) 69ms

 Test Files  6 passed (6)
      Tests  23 passed (23)
   Start at  02:01:41
   Duration  761ms (environment 91%, tests 5%, import 3%, transform 2%)
```

### コマンド 2：受け入れテストの依存導入と TypeScript 静的型検査
- コマンド：`cd web/tests/acceptance && npm ci && npm run typecheck`
- 終了コード：`0`
- テストの件数（成功 / 失敗 / 飛ばした）：型エラー `0件`（`tsc --noEmit` 通過、`0 vulnerabilities`）
- 出力：

```text
added 72 packages, and audited 73 packages in 944ms
found 0 vulnerabilities

> logic-arcade-acceptance-tests@1.0.0 typecheck
> tsc --noEmit
```

### コマンド 3：ローカル macOS 受け入れテスト（Chromium + WebKit・再試行なし）
- コマンド：`cd web/tests/acceptance && FORCE_COLOR=0 CI=1 npx playwright test --project=chromium --project=webkit --retries=0`
- 終了コード：`0`
- テストの件数（成功 / 失敗 / 飛ばした）：`44 / 0 / 0`（22テスト × 2ブラウザエンジン、ログ全文：`docs/verification/001-arcade-core/evidence/acceptance-local-chromium-webkit.log`）
- 出力（最後の 30 行）：

```text
  ✓  19 [chromium] › specs/resilience-and-media.spec.ts:318:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了 (1.4s)
  ✓  12 [chromium] › specs/fermi.spec.ts:58:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-8 / AC8_モード2のFIRE3秒以内視覚シミュレーションと対数誤差・罠有無による4段階オーダー判定・クリア記録 (4.0s)
  ✓  21 [chromium] › specs/responsive-and-a11y.spec.ts:155:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走 (1.4s)
  ✓  18 [chromium] › specs/resilience-and-media.spec.ts:219:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録 (2.9s)
  ✓  22 [chromium] › specs/shell-and-lobby.spec.ts:8:3 › Shell and Lobby Acceptance Suite › AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証 (687ms)
  ✓  20 [chromium] › specs/responsive-and-a11y.spec.ts:95:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件 (3.8s)
  ✓  26 [webkit] › specs/combinator.spec.ts:187:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-5 / AC5_モード1のSTEP1手検証による試行回数非加算とRESET0.2秒以内スロット維持初期化 (1.1s)
  ✓  25 [webkit] › specs/combinator.spec.ts:134:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-4 / AC4_モード1全10ステージの全順列解存在・50パーセント以下・ステージ8から10非自明性の保証 (2.9s)
  ✓  24 [webkit] › specs/combinator.spec.ts:79:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-3 / AC3_モード1の3ステップ配置とRUN3秒以内シミュレーション再生・STAGE_CLEARスコア算出・クリア記録 (3.3s)
  ✓  29 [webkit] › specs/diagnostic.spec.ts:121:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-10 / AC10_思考力診断カルテのSプラス・S・B・Cランク境界値と5軸算出式の網羅検証 (712ms)
  ✓  30 [webkit] › specs/diagnostic.spec.ts:279:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-11 / AC11_思考力診断カルテの結果サマリーテキストのクリップボード書き込みと2秒以上の完了通知表示 (470ms)
  ✓  27 [webkit] › specs/diagnostic.spec.ts:46:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-10 / AC10_両モードクリア後の5軸整数スコア算出・正五角形レーダーチャート描画・総合認定ランク表示 (2.8s)
  ✓  31 [webkit] › specs/diagnostic.spec.ts:337:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-12 / AC12_認定ランク未解放3パターン（履歴0件・失敗のみ・片モードのみクリア）のUNRANKED表示と開始導線 (752ms)
  ✓  23 [webkit] › specs/combinator.spec.ts:12:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-2 / AC2_モード1全10ステージ選択と5から7個のユニークモジュール4属性・目標・暴走上限表示 (4.7s)
  ✓  32 [webkit] › specs/diagnostic.spec.ts:475:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-20 / AC20_クリップボード書き込み拒否および未定義時の失敗通知と手動コピー用テキスト領域展開 (963ms)
  ✓  28 [webkit] › specs/combinator.spec.ts:266:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-6 / AC6_モード1途中制約違反時のCRASHED中断と完走未達時のFAILED判定およびデバッグログ3項目表示 (3.1s)
  ✓  35 [webkit] › specs/fermi.spec.ts:115:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-9 / AC9_モード2の基準因数分解式・罠カード解説3項目表示とRESET0.2秒以内全スロット未選択初期化 (1.1s)
  ✓  37 [webkit] › specs/resilience-and-media.spec.ts:11:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-13 / AC13_モード1およびモード2のスロット未充足時の実行ボタンdisabled化・未配置スロット案内文・試行回数0回保証 (825ms)
  ✓  33 [webkit] › specs/fermi.spec.ts:12:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-7 / AC7_モード2全9ステージ（初級3・中級3・上級3）と3スロット各3から4枚の仮説カード選択・自由入力欄0件 (1.8s)
  ✓  36 [webkit] › specs/fermi.spec.ts:184:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-19 / AC19_モード2全9ステージの全組み合わせPERFECT_ORDER解存在・50パーセント以下・罠カード1枚以上配置の保証 (2.4s)
  ✓  38 [webkit] › specs/resilience-and-media.spec.ts:83:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-14 / AC14_初期読み込み後の完全オフライン両モードクリア・外部通信0件・リロード後のlocalStorage履歴復元 (1.8s)
  ✓  39 [webkit] › specs/resilience-and-media.spec.ts:146:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-15 / AC15_Web_Audioシンセ効果音発音・外部音声通信0件・SOUND_OFFゲイン0抑止とリロード後永続化 (1.6s)
  ✓  41 [webkit] › specs/resilience-and-media.spec.ts:318:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了 (1.7s)
  ✓  34 [webkit] › specs/fermi.spec.ts:58:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-8 / AC8_モード2のFIRE3秒以内視覚シミュレーションと対数誤差・罠有無による4段階オーダー判定・クリア記録 (4.5s)
  ✓  43 [webkit] › specs/responsive-and-a11y.spec.ts:155:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走 (2.1s)
  ✓  44 [webkit] › specs/shell-and-lobby.spec.ts:8:3 › Shell and Lobby Acceptance Suite › AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証 (1.1s)
  ✓  40 [webkit] › specs/resilience-and-media.spec.ts:219:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録 (3.8s)
  ✓  42 [webkit] › specs/responsive-and-a11y.spec.ts:95:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件 (4.5s)

  44 passed (20.8s)
```

### コマンド 4：同一コミット `c802f8a` の Ubuntu CI 受け入れテスト（Chromium + Firefox + WebKit 全3エンジン・再試行0）
- コマンド：`gh run view 43263542517 --log`（ワークフロー内実行コマンド：`cd web/tests/acceptance && npx playwright test`、`playwright.config.ts` の `retries: 0` により再試行なし。※ローカル macOS サンドボックスでの `--project=firefox` 試行時はページ到達前に Firefox Nightly の一時プロファイル作成制限 `[err] Could not find profile folder` で停止するため、同一コミットの `ubuntu-latest` 実機実行ログと併せて全3エンジン通過を検証した）
- 終了コード：`0`
- テストの件数（成功 / 失敗 / 飛ばした）：`66 / 0 / 0`（`chromium` 22件 + `firefox` 22件 + `webkit` 22件、ログ全文：`docs/verification/001-arcade-core/evidence/ci-ubuntu-web-run-43263542517.log`）
- 出力（最後の 30 行）：

```text
  ✓  39 [firefox] › specs/resilience-and-media.spec.ts:146:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-15 / AC15_Web_Audioシンセ効果音発音・外部音声通信0件・SOUND_OFFゲイン0抑止とリロード後永続化 (3.1s)
  ✓  41 [firefox] › specs/resilience-and-media.spec.ts:318:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了 (2.5s)
  ✓  40 [firefox] › specs/resilience-and-media.spec.ts:219:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録 (6.4s)
  ✓  43 [firefox] › specs/responsive-and-a11y.spec.ts:155:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走 (3.3s)
  ✓  44 [firefox] › specs/shell-and-lobby.spec.ts:8:3 › Shell and Lobby Acceptance Suite › AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証 (2.2s)
  ✓  42 [firefox] › specs/responsive-and-a11y.spec.ts:95:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件 (12.6s)
  ✓  46 [webkit] › specs/combinator.spec.ts:79:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-3 / AC3_モード1の3ステップ配置とRUN3秒以内シミュレーション再生・STAGE_CLEARスコア算出・クリア記録 (4.2s)
  ✓  47 [webkit] › specs/combinator.spec.ts:134:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-4 / AC4_モード1全10ステージの全順列解存在・50パーセント以下・ステージ8から10非自明性の保証 (4.7s)
  ✓  45 [webkit] › specs/combinator.spec.ts:12:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-2 / AC2_モード1全10ステージ選択と5から7個のユニークモジュール4属性・目標・暴走上限表示 (12.8s)
  ✓  48 [webkit] › specs/combinator.spec.ts:187:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-5 / AC5_モード1のSTEP1手検証による試行回数非加算とRESET0.2秒以内スロット維持初期化 (2.0s)
  ✓  49 [webkit] › specs/combinator.spec.ts:266:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-6 / AC6_モード1途中制約違反時のCRASHED中断と完走未達時のFAILED判定およびデバッグログ3項目表示 (5.5s)
  ✓  50 [webkit] › specs/diagnostic.spec.ts:46:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-10 / AC10_両モードクリア後の5軸整数スコア算出・正五角形レーダーチャート描画・総合認定ランク表示 (5.7s)
  ✓  51 [webkit] › specs/diagnostic.spec.ts:121:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-10 / AC10_思考力診断カルテのSプラス・S・B・Cランク境界値と5軸算出式の網羅検証 (1.6s)
  ✓  52 [webkit] › specs/diagnostic.spec.ts:279:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-11 / AC11_思考力診断カルテの結果サマリーテキストのクリップボード書き込みと2秒以上の完了通知表示 (1.2s)
  ✓  53 [webkit] › specs/diagnostic.spec.ts:337:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-12 / AC12_認定ランク未解放3パターン（履歴0件・失敗のみ・片モードのみクリア）のUNRANKED表示と開始導線 (1.8s)
  ✓  54 [webkit] › specs/diagnostic.spec.ts:475:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-20 / AC20_クリップボード書き込み拒否および未定義時の失敗通知と手動コピー用テキスト領域展開 (2.1s)
  ✓  55 [webkit] › specs/fermi.spec.ts:12:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-7 / AC7_モード2全9ステージ（初級3・中級3・上級3）と3スロット各3から4枚の仮説カード選択・自由入力欄0件 (4.2s)
  ✓  57 [webkit] › specs/fermi.spec.ts:115:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-9 / AC9_モード2の基準因数分解式・罠カード解説3項目表示とRESET0.2秒以内全スロット未選択初期化 (2.3s)
  ✓  56 [webkit] › specs/fermi.spec.ts:58:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-8 / AC8_モード2のFIRE3秒以内視覚シミュレーションと対数誤差・罠有無による4段階オーダー判定・クリア記録 (7.2s)
  ✓  58 [webkit] › specs/fermi.spec.ts:184:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-19 / AC19_モード2全9ステージの全組み合わせPERFECT_ORDER解存在・50パーセント以下・罠カード1枚以上配置の保証 (4.4s)
  ✓  59 [webkit] › specs/resilience-and-media.spec.ts:11:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-13 / AC13_モード1およびモード2のスロット未充足時の実行ボタンdisabled化・未配置スロット案内文・試行回数0回保証 (2.2s)
  ✓  61 [webkit] › specs/resilience-and-media.spec.ts:146:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-15 / AC15_Web_Audioシンセ効果音発音・外部音声通信0件・SOUND_OFFゲイン0抑止とリロード後永続化 (3.1s)
  ✓  60 [webkit] › specs/resilience-and-media.spec.ts:83:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-14 / AC14_初期読み込み後の完全オフライン両モードクリア・外部通信0件・リロード後のlocalStorage履歴復元 (3.9s)
  ✓  63 [webkit] › specs/resilience-and-media.spec.ts:318:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了 (3.5s)
  ✓  62 [webkit] › specs/resilience-and-media.spec.ts:219:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録 (7.6s)
  ✓  65 [webkit] › specs/responsive-and-a11y.spec.ts:155:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走 (4.9s)
  ✓  66 [webkit] › specs/shell-and-lobby.spec.ts:8:3 › Shell and Lobby Acceptance Suite › AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証 (2.5s)
  ✓  64 [webkit] › specs/responsive-and-a11y.spec.ts:95:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件 (11.8s)

  66 passed (2.1m)
```

### コマンド 5：揺れの確認（全22受け入れテスト × 5回反復 × 2エンジン・再試行なし）
- コマンド：`cd web/tests/acceptance && FORCE_COLOR=0 CI=1 npx playwright test --project=chromium --project=webkit --repeat-each=5 --retries=0`
- 終了コード：`0`
- テストの件数（成功 / 失敗 / 飛ばした）：`220 / 0 / 0`（影響「大」の AC 全20テストを含む全22テスト × 5回 × 2ブラウザエンジン、失敗 `0回`、ログ全文：`docs/verification/001-arcade-core/evidence/repeat5-chromium-webkit.log`）
- 出力（最後の 30 行）：

```text
  ✓  188 [webkit] › specs/fermi.spec.ts:58:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-8 / AC8_モード2のFIRE3秒以内視覚シミュレーションと対数誤差・罠有無による4段階オーダー判定・クリア記録 (4.4s)
  ✓  195 [webkit] › specs/resilience-and-media.spec.ts:318:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了 (1.8s)
  ✓  197 [webkit] › specs/responsive-and-a11y.spec.ts:155:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走 (2.0s)
  ✓  198 [webkit] › specs/shell-and-lobby.spec.ts:8:3 › Shell and Lobby Acceptance Suite › AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証 (1.2s)
  ✓  194 [webkit] › specs/resilience-and-media.spec.ts:219:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録 (3.8s)
  ✓  202 [webkit] › specs/combinator.spec.ts:187:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-5 / AC5_モード1のSTEP1手検証による試行回数非加算とRESET0.2秒以内スロット維持初期化 (961ms)
  ✓  196 [webkit] › specs/responsive-and-a11y.spec.ts:95:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件 (5.7s)
  ✓  201 [webkit] › specs/combinator.spec.ts:134:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-4 / AC4_モード1全10ステージの全順列解存在・50パーセント以下・ステージ8から10非自明性の保証 (2.8s)
  ✓  200 [webkit] › specs/combinator.spec.ts:79:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-3 / AC3_モード1の3ステップ配置とRUN3秒以内シミュレーション再生・STAGE_CLEARスコア算出・クリア記録 (2.9s)
  ✓  205 [webkit] › specs/diagnostic.spec.ts:279:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-11 / AC11_思考力診断カルテの結果サマリーテキストのクリップボード書き込みと2秒以上の完了通知表示 (466ms)
  ✓  204 [webkit] › specs/diagnostic.spec.ts:121:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-10 / AC10_思考力診断カルテのSプラス・S・B・Cランク境界値と5軸算出式の網羅検証 (701ms)
  ✓  199 [webkit] › specs/combinator.spec.ts:12:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-2 / AC2_モード1全10ステージ選択と5から7個のユニークモジュール4属性・目標・暴走上限表示 (4.7s)
  ✓  207 [webkit] › specs/diagnostic.spec.ts:337:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-12 / AC12_認定ランク未解放3パターン（履歴0件・失敗のみ・片モードのみクリア）のUNRANKED表示と開始導線 (830ms)
  ✓  208 [webkit] › specs/diagnostic.spec.ts:475:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-20 / AC20_クリップボード書き込み拒否および未定義時の失敗通知と手動コピー用テキスト領域展開 (966ms)
  ✓  203 [webkit] › specs/combinator.spec.ts:266:3 › Mode 1: 3-ACT COMBINATOR Acceptance Suite › AC-6 / AC6_モード1途中制約違反時のCRASHED中断と完走未達時のFAILED判定およびデバッグログ3項目表示 (2.9s)
  ✓  211 [webkit] › specs/fermi.spec.ts:115:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-9 / AC9_モード2の基準因数分解式・罠カード解説3項目表示とRESET0.2秒以内全スロット未選択初期化 (1.1s)
  ✓  209 [webkit] › specs/fermi.spec.ts:12:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-7 / AC7_モード2全9ステージ（初級3・中級3・上級3）と3スロット各3から4枚の仮説カード選択・自由入力欄0件 (1.8s)
  ✓  206 [webkit] › specs/diagnostic.spec.ts:46:3 › Screen 4: Diagnostic Chart Acceptance Suite › AC-10 / AC10_両モードクリア後の5軸整数スコア算出・正五角形レーダーチャート描画・総合認定ランク表示 (3.0s)
  ✓  213 [webkit] › specs/resilience-and-media.spec.ts:11:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-13 / AC13_モード1およびモード2のスロット未充足時の実行ボタンdisabled化・未配置スロット案内文・試行回数0回保証 (783ms)
  ✓  212 [webkit] › specs/fermi.spec.ts:184:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-19 / AC19_モード2全9ステージの全組み合わせPERFECT_ORDER解存在・50パーセント以下・罠カード1枚以上配置の保証 (2.3s)
  ✓  214 [webkit] › specs/resilience-and-media.spec.ts:83:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-14 / AC14_初期読み込み後の完全オフライン両モードクリア・外部通信0件・リロード後のlocalStorage履歴復元 (1.8s)
  ✓  216 [webkit] › specs/resilience-and-media.spec.ts:146:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-15 / AC15_Web_Audioシンセ効果音発音・外部音声通信0件・SOUND_OFFゲイン0抑止とリロード後永続化 (1.6s)
  ✓  217 [webkit] › specs/resilience-and-media.spec.ts:318:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了 (1.7s)
  ✓  210 [webkit] › specs/fermi.spec.ts:58:3 › Mode 2: FERMI BLASTER Acceptance Suite › AC-8 / AC8_モード2のFIRE3秒以内視覚シミュレーションと対数誤差・罠有無による4段階オーダー判定・クリア記録 (4.4s)
  ✓  220 [webkit] › specs/shell-and-lobby.spec.ts:8:3 › Shell and Lobby Acceptance Suite › AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証 (1.1s)
  ✓  219 [webkit] › specs/responsive-and-a11y.spec.ts:155:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走 (2.0s)
  ✓  215 [webkit] › specs/resilience-and-media.spec.ts:219:3 › Resilience, Offline, Storage, Audio & Motion Acceptance Suite › AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録 (3.6s)
  ✓  218 [webkit] › specs/responsive-and-a11y.spec.ts:95:3 › Responsive Reflow, Target Size, Axe & Keyboard-Only Acceptance Suite › AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件 (4.6s)

  220 passed (1.6m)
```

### コマンド 6：Lighthouse 自動性能・アクセシビリティ監査（全4ルート）
- コマンド：`cd web && npm run audit:lighthouse`
- 終了コード：`0`
- テストの件数（成功 / 失敗 / 飛ばした）：`4 / 0 / 0`（全4ルート監査通過、ログ：`docs/verification/001-arcade-core/evidence/lighthouse-audit.log`）
- 出力：

```text
Lighthouse (/): Performance=100, Accessibility=100, LCP=901ms, TBT=0ms, CLS=0
Lighthouse (/combinator?stage=1): Performance=100, Accessibility=100, LCP=901ms, TBT=0ms, CLS=0
Lighthouse (/fermi?stage=1): Performance=100, Accessibility=100, LCP=901ms, TBT=0ms, CLS=0
Lighthouse (/diagnostic): Performance=100, Accessibility=100, LCP=901ms, TBT=0ms, CLS=0
```

## 2. 受け入れ条件ごとの結果

| AC | 結果（PASS / FAIL / 未検証） | 動いたテストの数 | 飛ばしたテストの数 | 証拠（テストの名前、ログの行、スクリーンショットのパス） |
|---|---|---|---|---|
| AC-1 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/shell-and-lobby.spec.ts::AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証`、`evidence/acceptance-local-chromium-webkit.log` (L24, L45)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1490, L1512, L1534)、`evidence/lobby_empty_light.png`、`evidence/lobby_normal_light.png`、`evidence/lobby_normal_en.png`、`evidence/not_found_404_light.png` |
| AC-2 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/combinator.spec.ts::AC-2 / AC2_モード1全10ステージ選択と5から7個のユニークモジュール4属性・目標・暴走上限表示`、`evidence/acceptance-local-chromium-webkit.log` (L6, L33)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1472, L1495, L1516)、`evidence/combinator_normal_light.png`、`evidence/combinator_empty_light.png`、`evidence/combinator_stage_fallback_light.png` |
| AC-3 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/combinator.spec.ts::AC-3 / AC3_モード1の3ステップ配置とRUN3秒以内シミュレーション再生・STAGE_CLEARスコア算出・クリア記録`、`evidence/acceptance-local-chromium-webkit.log` (L10, L28)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1470, L1492, L1514)、`evidence/combinator_running_light.png`、`evidence/AC3_STAGE_CLEAR.png` |
| AC-4 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/combinator.spec.ts::AC-4 / AC4_モード1全10ステージの全順列解存在・50パーセント以下・ステージ8から10非自明性の保証`、`evidence/acceptance-local-chromium-webkit.log` (L5, L27)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1471, L1493, L1515)、`evidence/AC3_STAGE_CLEAR.png` |
| AC-5 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/combinator.spec.ts::AC-5 / AC5_モード1のSTEP1手検証による試行回数非加算とRESET0.2秒以内スロット維持初期化`、`evidence/acceptance-local-chromium-webkit.log` (L4, L26)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1473, L1494, L1517)、`evidence/combinator_stepping_light.png` |
| AC-6 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/combinator.spec.ts::AC-6 / AC6_モード1途中制約違反時のCRASHED中断と完走未達時のFAILED判定およびデバッグログ3項目表示`、`evidence/acceptance-local-chromium-webkit.log` (L7, L35)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1474, L1496, L1518)、`evidence/AC6_CRASHED.png`、`evidence/AC6_FAILED.png` |
| AC-7 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/fermi.spec.ts::AC-7 / AC7_モード2全9ステージ（初級3・中級3・上級3）と3スロット各3から4枚の仮説カード選択・自由入力欄0件`、`evidence/acceptance-local-chromium-webkit.log` (L16, L38)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1480, L1502, L1524)、`evidence/fermi_normal_light.png`、`evidence/fermi_empty_light.png`、`evidence/fermi_stage_fallback_light.png` |
| AC-8 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/fermi.spec.ts::AC-8 / AC8_モード2のFIRE3秒以内視覚シミュレーションと対数誤差・罠有無による4段階オーダー判定・クリア記録`、`evidence/acceptance-local-chromium-webkit.log` (L21, L43)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1482, L1504, L1526)、`evidence/fermi_running_light.png`、`evidence/fermi_perfect_order_light.png`、`evidence/fermi_good_range_light.png`、`evidence/AC9_解説表示.png`、`evidence/fermi_underestimate_light.png` |
| AC-9 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/fermi.spec.ts::AC-9 / AC9_モード2の基準因数分解式・罠カード解説3項目表示とRESET0.2秒以内全スロット未選択初期化`、`evidence/acceptance-local-chromium-webkit.log` (L15, L36)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1481, L1503, L1525)、`evidence/AC9_解説表示.png`、`evidence/fermi_empty_light.png` |
| AC-10 | PASS | 10（ローカル2エンジン4件＋Ubuntu CI 3エンジン6件） | 0 | `specs/diagnostic.spec.ts::AC-10 / AC10_両モードクリア後の5軸整数スコア算出・正五角形レーダーチャート描画・総合認定ランク表示` および `specs/diagnostic.spec.ts::AC-10 / AC10_思考力診断カルテのSプラス・S・B・Cランク境界値と5軸算出式の網羅検証`、`evidence/acceptance-local-chromium-webkit.log` (L9, L11, L29, L31)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1475, L1476, L1497, L1498, L1519, L1520)、`evidence/diagnostic_normal_light.png` |
| AC-11 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/diagnostic.spec.ts::AC-11 / AC11_思考力診断カルテの結果サマリーテキストのクリップボード書き込みと2秒以上の完了通知表示`、`evidence/acceptance-local-chromium-webkit.log` (L8, L30)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1477, L1499, L1521)、`evidence/AC11_コピー完了通知.png` |
| AC-12 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/diagnostic.spec.ts::AC-12 / AC12_認定ランク未解放3パターン（履歴0件・失敗のみ・片モードのみクリア）のUNRANKED表示と開始導線`、`evidence/acceptance-local-chromium-webkit.log` (L12, L32)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1478, L1500, L1522)、`evidence/AC12_UNRANKED.png`、`evidence/diagnostic_unranked_failed_only_light.png`、`evidence/diagnostic_unranked_partial_light.png`、`evidence/lobby_partial_combinator_only_light.png` |
| AC-13 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/resilience-and-media.spec.ts::AC-13 / AC13_モード1およびモード2のスロット未充足時の実行ボタンdisabled化・未配置スロット案内文・試行回数0回保証`、`evidence/acceptance-local-chromium-webkit.log` (L14, L37)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1484, L1505, L1528)、`evidence/combinator_empty_light.png`、`evidence/fermi_empty_light.png` |
| AC-14 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/resilience-and-media.spec.ts::AC-14 / AC14_初期読み込み後の完全オフライン両モードクリア・外部通信0件・リロード後のlocalStorage履歴復元`、`evidence/acceptance-local-chromium-webkit.log` (L19, L40)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1486, L1507, L1530)、`evidence/offline_play_light.png` |
| AC-15 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/resilience-and-media.spec.ts::AC-15 / AC15_Web_Audioシンセ効果音発音・外部音声通信0件・SOUND_OFFゲイン0抑止とリロード後永続化`、`evidence/acceptance-local-chromium-webkit.log` (L18, L41)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1485, L1508, L1529)、`evidence/lobby_normal_light.png` |
| AC-16 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/resilience-and-media.spec.ts::AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録`、`evidence/acceptance-local-chromium-webkit.log` (L23, L46)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1488, L1510, L1532)、`evidence/AC16_ストレージ退避バナー.png` |
| AC-17 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/resilience-and-media.spec.ts::AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了`、`evidence/acceptance-local-chromium-webkit.log` (L20, L42)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1487, L1509, L1531)、`evidence/AC6_CRASHED.png`、`evidence/fermi_perfect_order_light.png` |
| AC-18 | PASS | 10（ローカル2エンジン4件＋Ubuntu CI 3エンジン6件） | 0 | `specs/responsive-and-a11y.spec.ts::AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件` および `specs/responsive-and-a11y.spec.ts::AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走`、`evidence/acceptance-local-chromium-webkit.log` (L22, L25, L44, L47)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1489, L1491, L1511, L1513, L1533, L1535)、全4画面の5通り画像20枚（`evidence/*_normal_{light,dark,zoom200,en,mobile}.png`） |
| AC-19 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/fermi.spec.ts::AC-19 / AC19_モード2全9ステージの全組み合わせPERFECT_ORDER解存在・50パーセント以下・罠カード1枚以上配置の保証`、`evidence/acceptance-local-chromium-webkit.log` (L17, L39)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1483, L1506, L1527)、`evidence/fermi_perfect_order_light.png` |
| AC-20 | PASS | 5（ローカル2エンジン2件＋Ubuntu CI 3エンジン3件） | 0 | `specs/diagnostic.spec.ts::AC-20 / AC20_クリップボード書き込み拒否および未定義時の失敗通知と手動コピー用テキスト領域展開`、`evidence/acceptance-local-chromium-webkit.log` (L13, L34)、`evidence/ci-ubuntu-web-run-43263542517.log` (L1479, L1501, L1523)、`evidence/AC20_手動コピー展開.png` |

## 3. 状態ごとの結果

| 状態 | 選んだもの（自動 / G4 の人 / 範囲外） | 結果 | 証拠のパス、または理由 |
|---|---|---|---|
| 初めて起動 | 自動 | PASS | `AC-1`（`0 / 10`・`0 / 9`・3導線即時提示）、`AC-12`（初期 `UNRANKED`・警告ボックス表示）、`AC-15`（既定 `SOUND ON`・操作前自動再生 `0回`）で検証。証拠：`evidence/lobby_empty_light.png`, `evidence/combinator_empty_light.png`, `evidence/fermi_empty_light.png`, `evidence/AC12_UNRANKED.png`, `evidence/acceptance-local-chromium-webkit.log` |
| データがある | 自動 | PASS | 実画面クリア後の `page.reload()` 永続化検証および `logic_arcade_state_v1` シード投入により、`AC-3`（クリア保持）、`AC-10`（5軸スコア・全5ランク `S+`〜`C`）、`AC-12`（失敗のみ・片側クリア）、`AC-14`（リロード復元）で検証。証拠：`evidence/lobby_normal_light.png`, `evidence/AC3_STAGE_CLEAR.png`, `evidence/diagnostic_normal_light.png`, `evidence/diagnostic_unranked_failed_only_light.png`, `evidence/diagnostic_unranked_partial_light.png` |
| 前の版からの更新 | 範囲外 | 対象外 | 初回機能 `001-arcade-core` であり公開済みの前の版（過去リリースタグ）がまだ存在しないため範囲外（なお、`schemaVersion: 1` の保存と破損 JSON・未知 `schemaVersion: 2` からの安全復旧は `AC-16` および探索セッション4で確認済み。次機能以降で `v1` シード移行を自動検証する）。 |
| オフライン、サーバーエラー | 自動 | PASS | 初期ロード完了後に `context.setOffline(true)` で通信遮断したまま両モードクリア・診断カルテ算出を完走し、未捕捉 JS 例外 `0件`・外部通信 `0件`・通信失敗 `0件`・リロード復元を確認（バックエンド HTTP API は `0件` のため 500 スタブは非該当）。証拠：`evidence/offline_play_light.png`, `evidence/acceptance-local-chromium-webkit.log` (L19, L40) |
| 権限を断った | 自動 | PASS | `navigator.clipboard.writeText` の `NotAllowedError` / `undefined`（`AC-20`）、および `window.localStorage` getter の `SecurityError`（`AC-16`）を注入し、未捕捉例外 `0件` で手動コピー欄展開・インメモリ退避バナー表示を確認。証拠：`evidence/AC20_手動コピー展開.png`, `evidence/AC16_ストレージ退避バナー.png` |
| バックグラウンドから復帰 | G4 の人 | G4 申し送り | ブラウザ最小化・OS バックグラウンド遷移から復帰した際のモバイル／PC 実機上の Web Audio `AudioContext` 復帰手触りとアニメーション再開は G4 の実機人間確認へ申し送り（ページ再読み込みによる履歴・ミュート復元は `AC-3`・`AC-14`・`AC-15` で自動検証済み）。 |
| 言語と地域（ja、en） | 自動 | PASS | 既定 `ja` 表示および共通ヘッダー `header-lang-en` / `header-lang-ja` 切替での `<title>`・全ナビ・ライブ計器 `<dt>`（`残りエネルギー (ENERGY)` / `Energy` 等）・全4画面対訳切替・共有テキストおよび手動コピー `<textarea>` の即時言語追従を `AC-1`・探索セッション1/3/5・英語スクリーンショット4枚で確認。証拠：`evidence/lobby_normal_en.png`, `evidence/combinator_normal_en.png`, `evidence/fermi_normal_en.png`, `evidence/diagnostic_normal_en.png` |
| 大きい文字、ダークモード | 自動 | PASS | `320px` / `1280px` × 文字拡大 `100%` / `200%` の4条件×全4画面（横はみ出し `0px`・`1280px × 200%` での `auto-fit` 1列折り返し・最小 `24x24px`・重なり `0件`）、ライト／ダーク双方の axe 違反 `0件`（`AC-18`）、および `prefers-reduced-motion: reduce` 時のシェイク `0px`・`<= 1.0s` 短縮再生（`AC-17`）を確認。証拠：`evidence/*_normal_dark.png`, `evidence/*_normal_zoom200.png`, `evidence/*_normal_mobile.png`, `evidence/axe-full-audit.json` |
| 容量不足、割り込み | 自動 | PASS | `window.localStorage` アクセス例外注入による保存不能状態の退避（未捕捉例外 `0件`・インメモリ状態保持・`storage-fallback-banner` 1件表示）を `AC-16` で自動検証済み（実機電話着信等の割り込み復帰は G4 実機確認で補完）。証拠：`evidence/AC16_ストレージ退避バナー.png` |

## 4. 揺れの確認

`test-plan.md` 1章の影響「大」のリスク（R1〜R5）に関わる全20テストに加え、残り2テスト（`AC-15`, `AC-17`）を含む全22テストを `--repeat-each=5 --retries=0` で `chromium` 各5回・`webkit` 各5回（計220実行）繰り返し、**落ちた回数は全テストとも `0回`** であった（ログ全文：`docs/verification/001-arcade-core/evidence/repeat5-chromium-webkit.log`）。また今回の G3 判定実行で一度でも落ちたテストは `0件` であった。

| テストの名前 | コマンド | 回数 | 落ちた回数 | 原因の型（待ち方、順番、時刻、外部サービス、後片付け） |
|---|---|---|---|---|
| `specs/shell-and-lobby.spec.ts::AC-1 / AC1_初期表示と迷路クローンでない3導線の即時提示および言語切替・404案内検証` | `npx playwright test --project=chromium --project=webkit --repeat-each=5 --retries=0` | 5（×2エンジン＝10） | 0 | なし |
| `specs/combinator.spec.ts::AC-2 / AC2_モード1全10ステージ選択と5から7個のユニークモジュール4属性・目標・暴走上限表示` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/combinator.spec.ts::AC-3 / AC3_モード1の3ステップ配置とRUN3秒以内シミュレーション再生・STAGE_CLEARスコア算出・クリア記録` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/combinator.spec.ts::AC-4 / AC4_モード1全10ステージの全順列解存在・50パーセント以下・ステージ8から10非自明性の保証` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/combinator.spec.ts::AC-5 / AC5_モード1のSTEP1手検証による試行回数非加算とRESET0.2秒以内スロット維持初期化` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/combinator.spec.ts::AC-6 / AC6_モード1途中制約違反時のCRASHED中断と完走未達時のFAILED判定およびデバッグログ3項目表示` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/fermi.spec.ts::AC-7 / AC7_モード2全9ステージ（初級3・中級3・上級3）と3スロット各3から4枚の仮説カード選択・自由入力欄0件` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/fermi.spec.ts::AC-8 / AC8_モード2のFIRE3秒以内視覚シミュレーションと対数誤差・罠有無による4段階オーダー判定・クリア記録` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/fermi.spec.ts::AC-9 / AC9_モード2の基準因数分解式・罠カード解説3項目表示とRESET0.2秒以内全スロット未選択初期化` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/fermi.spec.ts::AC-19 / AC19_モード2全9ステージの全組み合わせPERFECT_ORDER解存在・50パーセント以下・罠カード1枚以上配置の保証` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/diagnostic.spec.ts::AC-10 / AC10_両モードクリア後の5軸整数スコア算出・正五角形レーダーチャート描画・総合認定ランク表示` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/diagnostic.spec.ts::AC-10 / AC10_思考力診断カルテのSプラス・S・B・Cランク境界値と5軸算出式の網羅検証` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/diagnostic.spec.ts::AC-11 / AC11_思考力診断カルテの結果サマリーテキストのクリップボード書き込みと2秒以上の完了通知表示` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/diagnostic.spec.ts::AC-12 / AC12_認定ランク未解放3パターン（履歴0件・失敗のみ・片モードのみクリア）のUNRANKED表示と開始導線` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/diagnostic.spec.ts::AC-20 / AC20_クリップボード書き込み拒否および未定義時の失敗通知と手動コピー用テキスト領域展開` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/resilience-and-media.spec.ts::AC-13 / AC13_モード1およびモード2のスロット未充足時の実行ボタンdisabled化・未配置スロット案内文・試行回数0回保証` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/resilience-and-media.spec.ts::AC-14 / AC14_初期読み込み後の完全オフライン両モードクリア・外部通信0件・リロード後のlocalStorage履歴復元` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/resilience-and-media.spec.ts::AC-15 / AC15_Web_Audioシンセ効果音発音・外部音声通信0件・SOUND_OFFゲイン0抑止とリロード後永続化` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/resilience-and-media.spec.ts::AC-16 / AC16_localStorageアクセス例外時のインメモリ退避バナー表示および破損JSON時の安全な破棄再記録` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/resilience-and-media.spec.ts::AC-17 / AC17_prefers_reduced_motion有効時の画面シェイク変位0px抑止と1.0秒以内の短縮再生完了` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/responsive-and-a11y.spec.ts::AC-18 / AC18_320pxと1280pxおよび文字拡大100パーセント・200パーセント全4条件×全4画面の横はみ出し0px・最小24x24px・重なり0件・axe違反0件` | 同上 | 5（×2エンジン＝10） | 0 | なし |
| `specs/responsive-and-a11y.spec.ts::AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走` | 同上 | 5（×2エンジン＝10） | 0 | なし |

## 5. 受け入れテストの変更

- この機能のテストを最初に入れたコミット：`74a9643a3d32c452f8057eb2cf5b747ac994bb3c`（ステップ9初回作成。なお実装着手前に G2 レビュー承認されたコミット `48bc8032aa26f74f272eb070b534113fb3be777d` 以降、`git diff 48bc8032aa26f74f272eb070b534113fb3be777d..HEAD -- web/tests/acceptance` の変更は **`0件`** であり、実装に合わせてテストを改変した箇所は一切ない）
- コマンド：`git diff 74a9643a3d32c452f8057eb2cf5b747ac994bb3c..HEAD -- web/tests/acceptance`

| ファイル:行 | 何を変えたか | PRD の根拠（AC 番号と PRD の文） |
|---|---|---|
| `web/tests/acceptance/helpers/contracts.ts:95`、`web/tests/acceptance/specs/fermi.spec.ts:152-156` | `FermiExplanation` 型に必須フィールド `showRetryHint: boolean` を追加し、`OVERKILL` 時に `fermi-retry-hint` 可視表示と `showRetryHint === true` を検証するよう厳格化（実装前ステップ10 r2 修正） | `AC-8`・`AC-9`（`docs/prd/001-arcade-core.md:187,194`：`OVERKILL` 判定と結果解説領域の表示検証、および対応する `design/001-arcade-core.md:130,194`・`contracts/openapi.yaml` の `FermiExplanation.required`） |
| `web/tests/acceptance/helpers/contracts.ts:192-311,320-326` | `TelemetryEvent` 型を汎用 `Record<string, unknown>` から PRD 全9イベントの判別共用体型へ厳格化し、`getEmittedEvents(): TelemetryEvent[]` の戻り値型整合を強化（実装前ステップ10 r2 修正） | PRD 15章「イベント設計」（`docs/prd/001-arcade-core.md:305-315`：`Session Started`〜`Client Error Occurred` 全9イベントと必須プロパティ定義、および `contracts/openapi.yaml` `TelemetryEvent`） |
| `web/tests/acceptance/helpers/contracts.ts:329-331`、`web/tests/acceptance/helpers/test-utils.ts:141-214`、`web/tests/acceptance/specs/combinator.spec.ts:6,230-237`、`web/tests/acceptance/specs/fermi.spec.ts:5,163-170` | `RESET` の復帰時間計測を Playwright プロセス間 IPC 往復込みの外側計測から、ブラウザページ内の `click` capture 発火〜`MutationObserver` による `data-status="IDLE"` 到達時間（`<= 200ms`）の実測へ精緻化（実装前ステップ10 r2 修正） | `AC-5`（`docs/prd/001-arcade-core.md:166`：「続く `RESET` 操作から `0.2秒以内` にスロット配置を維持したままシミュレーション位置と各パラメータが初期値に戻る」）、`AC-9`（同 `:194`：「続く `RESET` 操作から `0.2秒以内` に `ACT 1`〜`ACT 3` の3スロットすべてが未選択かつ未実行の初期状態に戻る」）、PRD 12章（同 `:276`） |
| `web/tests/acceptance/helpers/test-utils.ts:218-225,238-255`、`web/tests/acceptance/specs/responsive-and-a11y.spec.ts:154-156,189-191` | macOS WebKit の標準リンクフォーカス移動キー（`Alt+Tab` / `Alt+Shift+Tab`）にも対応させ、全対応ブラウザエンジンでキーボード単独完走を検証できるよう更新（実装前ステップ10 r2 修正） | `AC-18`・PRD 12章「非機能要件 — アクセシビリティ・レスポンシブ・動き軽減」（`docs/prd/001-arcade-core.md:279`：「キーボード操作（`Tab` / `Enter` / `Space`）のみで全ステージ選択・スロット選択・実行・リセット・結果コピーが完走可能であること」、対応ブラウザ Safari/WebKit を含む同 `:283`） |

## 6. 検査の件数

| 検査 | コマンド | 件数 | 理由 |
|---|---|---|---|
| sleep で待つ | `grep -rnE --exclude-dir=node_modules --exclude=package-lock.json 'sleep\(|usleep|Thread\.sleep|time\.sleep|asyncio\.sleep|waitForTimeout|setTimeout\(' web/tests/acceptance/` | 0 | — |
| 飛ばす、失敗を許す | `grep -rnE --exclude-dir=node_modules --exclude=package-lock.json 'XCTSkip|XCTExpectFailure|pytest\.mark\.skip|skipif|xfail|pytest\.skip|unittest\.skip|test\.skip|\.skip\(|test\.fixme|test\.fail\(|\.only\(' web/tests/acceptance/` | 0 | — |
| 再試行 | `grep -rnE --exclude-dir=node_modules --exclude=package-lock.json 'retries:\s*[1-9]|--retries=[1-9]|--reruns|-retry-tests-on-failure' web/tests/acceptance/` | 0 | `playwright.config.ts:9` は `retries: 0` 固定、本レポート1章・4章の実行コマンドもすべて `--retries=0`（再試行なし）のみ指定（なお大文字小文字無視の単語検索 `grep -rniE 'retry|rerun' web/tests/acceptance/` では `design/001-arcade-core.md` 定義の再挑戦ヒント要素 ID `fermi-retry-hint` / `showRetryHint` のみが一致し、テスト再試行は `0件`）。 |
| 中を覗く import | `grep -rnE --exclude-dir=node_modules --exclude=package-lock.json '@testable import|from ['"'"'"](\.\./){2,}|from ['"'"'"]@/|import\(['"'"'"](\.\./){2,}' web/tests/acceptance/` | 0 | — |
| AC 番号の抜け（PRD にあってテストにない、その逆） | `diff -u <(grep -oE 'AC-[0-9]+' docs/prd/001-arcade-core.md \| sort -V -u) <(grep -rhoE 'AC-[0-9]+' web/tests/acceptance/specs/ \| sort -V -u)`（および `AC[0-9]+_` 照合） | 0 | PRD の全20件（`AC-1`〜`AC-20`）と受け入れテスト名の `AC-1`〜`AC-20`（`AC1_`〜`AC20_`）が双方向で100%一致し、AC 番号のないテストも `0件`。 |
| 表示の文字や並び順で探す | `grep -rnE --exclude-dir=node_modules --exclude=package-lock.json 'locator\(['"'"'"]\.|xpath=|nth\(|first\(\)|last\(\)|getByText\(|(buttons\|staticTexts\|textFields\|cells\|switches)\["\|element\(boundBy:' web/tests/acceptance/` | 0 | すべての要素特定に `design/001-arcade-core.md` 6章および `contracts/arcade-test-seam.md` 1章の `data-testid` / 標準属性のみを使用。 |

## 7. アクセシビリティ監査

### 7.1 全画面・全状態 `@axe-core/playwright`（WCAG 2.2 AA）およびキーボード単独完走結果
`design/001-arcade-core.md` の全4画面と未定義 URL（404）画面について、最新ビルド上で通常の状態5通り（ライト、ダーク、文字拡大 `200%`、英語、スマホ幅 `320px`）計20状態＋空・実行中・`STEPPING`・クリア・エラー（`CRASHED`/`FAILED`/`OVERKILL`/`UNDERESTIMATE`/範囲外クエリ補正/手動コピー展開/ストレージ退避バナー/404）・オフライン・一部クリア計24状態の **全44状態すべて** に対して `@axe-core/playwright`（タグ：`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`）を再実行し、**全44状態で違反 `0件`・未捕捉例外 `0件`・コンソールエラー `0件`** を確認した（詳細ログ：`docs/verification/001-arcade-core/evidence/axe-full-audit.json`）。
なお、実機スクリーンリーダー（macOS / iOS `VoiceOver`、Windows `NVDA`）による実際の音声読み上げ順・ライブリージョン通知の聞き取り確認は **G4 の人間確認へ申し送り** とする。

| 画面 | テストの名前 | 結果 | 見つかった問題 |
|---|---|---|---|
| **画面1：モード選択**（`/`：通常5通り・初期未プレイ空・片モードクリア計7状態） | `AC-1`・`AC-18`（`responsive-and-a11y.spec.ts`）および全状態監査（`evidence/axe-full-audit.json`） | PASS（axe 通過 19〜20 ルール、違反 `0件`） | なし |
| **画面2：モード1『3-ACT COMBINATOR』**（`/combinator`：通常5通り・未配置空・`STEPPING`・`RUNNING`・`STAGE CLEAR`・`CRASHED`・`FAILED`・`?stage=99` 補正計12状態） | `AC-2`・`AC-18`（`combinator.spec.ts`, `responsive-and-a11y.spec.ts`）および全状態監査（`evidence/axe-full-audit.json`） | PASS（axe 通過 25〜27 ルール、違反 `0件`） | なし |
| **画面3：モード2『FERMI BLASTER』**（`/fermi`：通常5通り・未選択空・`RUNNING`・`PERFECT ORDER`・`GOOD RANGE`・`OVERKILL`＋解説・`UNDERESTIMATE`＋解説・`?stage=99` 補正計12状態） | `AC-7`・`AC-18`（`fermi.spec.ts`, `responsive-and-a11y.spec.ts`）および全状態監査（`evidence/axe-full-audit.json`） | PASS（axe 通過 23〜25 ルール、違反 `0件`） | なし |
| **画面4：『思考力診断カルテ』**（`/diagnostic`：通常5通り・`UNRANKED` 3パターン・コピー完了トースト・Clipboard 拒否手動コピー `<textarea>` 展開・オフライン完走後計11状態） | `AC-10`・`AC-18`（`diagnostic.spec.ts`, `responsive-and-a11y.spec.ts`）および全状態監査（`evidence/axe-full-audit.json`） | PASS（axe 通過 25〜27 ルール、違反 `0件`） | なし |
| **共通シェル異常系・404 画面**（`storage-fallback-banner` 表示・`/unknown-arcade-route` 404 フォールバック計2状態） | `AC-1`・`AC-16` および全状態監査（`evidence/axe-full-audit.json`） | PASS（axe 通過 19〜22 ルール、違反 `0件`） | なし |
| **全4画面横断キーボード単独操作**（マウスクリック `0回`、フォーカス枠 `>= 2px` 検証込み） | `specs/responsive-and-a11y.spec.ts::AC-18 / AC18_キーボード操作（フォーカス移動キーとEnter）のみでの両モードステージクリアと診断カルテ共有までの完走` | PASS（Chromium・Firefox・WebKit 全3エンジン通過） | なし |

### 7.2 性能とバンドル予算の実測値（ADR-001・PRD 12章との照合）
- **バンドルサイズ（gzip 圧縮後）**：
  - 初期読込 JS：`107,051 bytes`（`104.54 KB`） ≦ 予算上限 `122,880 bytes`（`120.00 KB`） — **PASS**
  - 初期読込 CSS：`4,002 bytes`（`3.91 KB`） ≦ 予算上限 `20,480 bytes`（`20.00 KB`） — **PASS**
- **Lighthouse 13.6.0 自動計測（全4ルート、`evidence/lighthouse-audit.log`）**：
  - `/`：Performance `100`（目標 `>= 90`）、Accessibility `100`、LCP `901ms`（目標 `<= 2500ms`）、TBT `0ms`、CLS `0`（目標 `<= 0.1`） — **PASS**
  - `/combinator?stage=1`：Performance `100`、Accessibility `100`、LCP `901ms`、TBT `0ms`、CLS `0` — **PASS**
  - `/fermi?stage=1`：Performance `100`、Accessibility `100`、LCP `901ms`、TBT `0ms`、CLS `0` — **PASS**
  - `/diagnostic`：Performance `100`、Accessibility `100`、LCP `901ms`、TBT `0ms`、CLS `0` — **PASS**
- **応答時間実測（Playwright 受け入れテスト内計測）**：
  - トップ `/` ナビゲーション開始〜3導線操作可能：`<= 1000ms`（`AC-1`） — **PASS**
  - `RESET` click 発火〜`IDLE` 初期状態復帰：`<= 200ms`（`AC-5`, `AC-9`） — **PASS**
  - 通常時シミュレーション再生完了：`<= 3000ms`（`AC-3`, `AC-8`）、`prefers-reduced-motion: reduce` 時：`<= 1000ms` かつシェイク変位 `0px`（`AC-17`） — **PASS**

## 8. 探索セッション

実行ログ：`docs/verification/001-arcade-core/evidence/exploratory-sessions.log`

### セッション 1（リスク R1）
- チャーター：モード1『3-ACT COMBINATOR』の `STEP` 一時停止・スロット差し替え・`RUN` 実行・ステージ切り替えを、再生中連打や `STEP 2/3` 途中でのモジュール解除／別ステージ移動・日英計器ラベル切替を交えて探り、古いパラメータの残留や試行回数（$R_1, K_1$）の二重加算・不整合が起きないかを見つける。
- 区切り（予定と実際。時間か操作の数）：予定 `30分か40操作` ／ 実際 `59操作`（実ブラウザ連続検証）
- 試したこと：
  - 画面2のライブ計器 `<dt>` が `ja` で `残りエネルギー (ENERGY)` / `現在出力 (OUTPUT)` / `現在発熱 (HEAT)`、`en` で `Energy` / `Output` / `Heat` になり、モジュールデッキ側の4属性（`エネルギーコスト`・`基本性能`・`副作用`・`発動条件`）と正しく分離されていることを確認。
  - STAGE 1 で3枠配置後に `STEP` 2回で `STEPPING (2/3, output=12)` まで進め、途中で `combinator-slot-2` をクリック解除 → 即座に `IDLE (stepIndex=0, energy=10, output=0, sideEffect=0)` に戻ることを確認。
  - 配置済みカード（`s1-amp2b`）の再クリックでスロット3も解除されて `STEP` が `disabled` になることを確かめた後、再配置して `STEP` を3回押し切り（`3/3`）→ `combinatorTotalRuns === 0` かつ `data-cleared="false"` のまま公式試行・クリアに算入されないことを確認。
  - `STEP 1/3` 途中から直接 `RUN` を押し、`RUNNING` 再生中に全ボタン・スロット・ステージ選択が `disabled` になること、および DOM `btn.click()` 強制発火でも `combinatorTotalRuns === 1`（二重加算なし）であることを確認。
  - STAGE 2 で `STEP 1/3` 停止中に STAGE 4 へステージ切替し、STAGE 4 の初期パラメータ `(10, 0, 3)` にクリーンリセットされること、さらに `s4-guard` の次ステップ副作用無効シールド（`shieldActive: true -> false`）と `s4-leak` 暴走時の $K_1$ 加算（`R_1=2, K_1=1`）、STAGE 5〜10 連続切替・再配置・`RESET` で例外 `0件` を確認。
- 見つけた不具合（11章の番号）：なし（AC 違反・JS 例外・数値不整合すべて `0件`）
- 疑問：`STEP` を3回押し切って3手目の検証結果まで見た後に `STEP` ボタンは `disabled` になり、`RUN` は活性のまま残るためそのまま本番実行へ進める設計になっている（自然で迷いがない）。
- 次に試すこと：G4 実機確認で、通常モーション時に `STEP 1/3` → `RUN` へ切り替えた際のパルス波形アニメーションの視覚的なつながりを確認する。
- 使い捨てのテスト：消した（探索実行用スクリプトを削除し、`git status` に残存なし）

### セッション 2（リスク R2）
- チャーター：モード2『FERMI BLASTER』の仮説カード選択解除・同スロット別カード切り替え・`FIRE` 連打・`RESET` 直後の再選択を、罠カード複数選択や境界付近の組み合わせで探り、式プレビュー・対数誤差判定・罠解説ハイライトの食い違いが起きないかを見つける。
- 区切り（予定と実際。時間か操作の数）：予定 `30分か40操作` ／ 実際 `44操作`
- 試したこと：
  - STAGE 1 の `ACT 1` で選択済み仮説カードを再クリックした際、`aria-pressed="true"` が維持されるラジオ型排他選択として動作し、同スロット内の別カード（`1 -> 2 -> 3 -> 4`）を連続クリックすると常に選択数 `1枚` に保たれることを確認。
  - 3スロットすべてで罠カード `(2, 2, 2)` を選択して `FIRE` を押し、再生中の `disabled` 連打防止、完了後の `OVERKILL`、`trapTriggeredCount === 3`、および `fermi-trap-notes` 内に「今回選択した罠カード」強調バッジが3件すべて出ることを確認。
  - `RESET` を押さずに直接正解カード `(1, 1, 1)` に選び直すと即座に `IDLE`・解説非表示へ戻り、再 `FIRE` で `PERFECT ORDER` かつ強調バッジ `0件` になること、また `GOOD RANGE` では `fermi-retry-hint` が非表示・`UNDERESTIMATE` では表示されること、STAGE 2〜9 連続切替と部分選択時の `?` プレビュー・累積 $F_2=4, T_2=2$ 整合を確認。
- 見つけた不具合（11章の番号）：AC 違反なし（AC外の軽微な UX 提案として 11章 `#1` を記録）
- 疑問：モード1のモジュールカードは再クリックで個別解除できる一方、モード2の仮説カードは `<fieldset>` 内の排他選択のため再クリックでは未選択（`?`）に戻らず `RESET（選択をクリア）` で全3枠クリアとなる（仕様どおりだが 11章 `#1` に提案として記載）。
- 次に試すこと：G4 で英語表示時の指数表記と単位ラベルの読みやすさをモバイル実機で目視確認する。
- 使い捨てのテスト：消した

### セッション 3（リスク R3）
- チャーター：『思考力診断カルテ』の5軸スコア・認定ランク・共有コピーを、初回1発クリア後の同ステージ再失敗／再クリアや `JA`/`EN` 言語切替直後のコピー実行・手動コピー `<textarea>` 展開中の言語切替で探り、初回クリア効率（$a_s$）の上書きバグや共有サマリー文字列の言語・数値ズレが起きないかを見つける。
- 区切り（予定と実際。時間か操作の数）：予定 `30分か40操作` ／ 実際 `43操作`
- 試したこと：
  - モード1 STAGE 1 を初回1発クリア（`runAttemptsBeforeFirstClear = 1`）した後、意図的に同ステージで `CRASHED` 2回・`FAILED` 1回・再 `STAGE CLEAR` 1回（計 $R_1=5, K_1=2$）を実行 → `runAttemptsBeforeFirstClear` が `1` のまま不変であり、第2軸「順序構築力」が `73` に維持され第3軸「リソース制御力」のみ `45` に変動することを確認。
  - モード2 STAGE 1 を最初に `GOOD RANGE`（第4軸 `45`）でクリアした後、`PERFECT ORDER` で再クリアすると最高判定が昇格して第4軸が `73` に上がり、その後 `OVERKILL` を踏んでも `bestJudgment` が `PERFECT_ORDER` から降格せず第5軸「仮説精度」のみ `27` に更新され、総合 `56 / B` になることを確認。
  - 診断カルテで `JA` コピー実行直後に `EN` へ切り替えて即コピー実行し、クリップボード文字列が日英それぞれのテンプレートと数値 `B (56/100)` に完全一致することを確認。さらに Clipboard 拒否注入状態で `EN` のまま手動コピー `<textarea>` を展開し、**コピーボタンを押し直さずにヘッダー `JA` → `EN` を切り替えた際、`<textarea>` 内の文字列も即座に日本語テンプレート ↔ 英語テンプレートへライブ追従する**（前回 G3 r1 提案 `#2` の解消）こと、全選択ボタン動作、および STAGE 2 追加クリア後の `59 / B` 即時反映を確認。
- 見つけた不具合（11章の番号）：なし（前回 r1 で記録した手動コピー `<textarea>` 言語追従の提案も解消済み）
- 疑問：なし
- 次に試すこと：全19ステージ完走（`S+` 100点満点）時の共有テキスト貼り付け見栄えを G4 で確認する。
- 使い捨てのテスト：消した

### セッション 4（リスク R4）
- チャーター：オフライン状態・ブラウザの「戻る／進む」・URL 直接書き換え（`?stage=0`, `?stage=abc`, `/unknown`）・複数タブ同時プレイを組み合わせて探り、履歴の巻き戻りや未捕捉 JS 例外・コンソールエラーが発生しないかを見つける。
- 区切り（予定と実際。時間か操作の数）：予定 `30分か40操作` ／ 実際 `42操作`
- 試したこと：
  - `/` → `/combinator?stage=1` → `?stage=3` → `/fermi?stage=1` → `?stage=5` → `/diagnostic` の5段階遷移後にブラウザの `goBack()` 5回と `goForward()` 5回を連続実行し、各画面とステージ状態が例外 `0件` で正確に往復することを確認。
  - 不正クエリ・特殊文字列10パターン（`?stage=0`, `?stage=-5`, `?stage=1.5`, `?stage=Infinity`, `?stage=abc`, `?stage=%3Cscript%3Ealert(1)%3C/script%3E`, `/fermi?stage=0`, `/fermi?stage=10`, `/fermi?stage=NaN`, `/unknown/nested/route`）へ直接遷移し、XSS 発火 `0件`・未捕捉例外 `0件` で `?stage=1`＋`stage-fallback-notice`（ステージ切替で消去）または `not-found-section` へ安全誘導されることを確認。
  - 同一コンテキストで2タブ（Tab A：モード1、Tab B：モード2）を同時に開き、`setOffline(true)` 中に両タブでクリア実行、さらに未知の将来版 `schemaVersion: 2` の `StorageEvent` 発火とオンライン復帰リロード、404 画面でのキーボードフォーカス移動を組み合わせ、両タブとも `pageerror` / `console.error` が `0件` であることを確認。
- 見つけた不具合（11章の番号）：なし
- 疑問：ステージ番号ボタン（`S1`〜`S10`）の切替は `pushState` で履歴に残るため、「直前に見ていたステージへ戻る」操作がブラウザ戻るボタンで直感的に機能している。
- 次に試すこと：G4 ステージング配信環境で未知パス直接リロード時のサーバー側 SPA フォールバック応答ヘッダーを確認する。
- 使い捨てのテスト：消した

### セッション 5（リスク R5）
- チャーター：幅 `320px × 文字拡大 200%`・ダークモード・英語（`EN`）表示および `1280px × 文字拡大 200%` 折り返しの組み合わせで全4画面とエラー／解説展開時の長文折り返しをキーボード操作で探り、文字切れ・フォーカス見失い・押下不能要素が生じないかを見つける。
- 区切り（予定と実際。時間か操作の数）：予定 `30分か40操作` ／ 実際 `45操作`
- 試したこと：
  - 最も厳しい複合条件である「幅 `320px` × ルート文字サイズ `200%` × ダークモード × 英語（`EN`） × `storage-fallback-banner` 常時表示 × Clipboard 拒否手動コピー展開」を同時に有効化し、ロビー・モード1 `CRASHED` デバッグログ展開・モード2 `OVERKILL` 解説＋再試行ヒント展開・診断カルテ手動コピー `<textarea>`＋`Select All Text` 展開・404 画面の全5画面状態を走査。あわせて `1280px × ルート文字サイズ 200%` でカード・スロットグリッドが `auto-fit` によりゆったり1列へ折り返す（`1280x200_slotsCols=1`）ことを確認。
  - 全画面状態で `scrollWidth - innerWidth <= 0px`（横スクロール `0px`）、`text-overflow: ellipsis` 使用要素 `0件`、全可視操作要素 `>= 24x24px`、axe WCAG 2.2 AA 違反 `0件` を確認。
  - キーボード `Tab` による先頭 `skip-to-main-link` 出現と `Enter` ジャンプ、`Select All Text` ボタンの `Enter` による全文選択（20文字以上選択状態）、`SOUND (SFX)` トグルの `Space` キーによる `SOUND OFF` 切替を確認。
- 見つけた不具合（11章の番号）：なし
- 疑問：なし（`320px × 200%` に退避バナーとエラー解説を重ねても 1px も横はみ出しせず折り返され、`1280px × 200%` でも3列窮屈化なく1列に折り返される）。
- 次に試すこと：G4 で iOS Safari / Android Chrome 実機のピンチズーム・ソフトキーボード非出現（自由入力欄0件）を確認する。
- 使い捨てのテスト：消した

## 9. スクリーンショットとログ

置き場所：`docs/verification/001-arcade-core/evidence/`（全51ファイル：最新ビルドで再撮影したスクリーンショット44枚＋実行・監査ログ7件、既存の `red.log` も保持）。

| ファイル | 画面と状態 | 見た目（ライト / ダーク / AX5 か 200% / 英語 / スマホの幅） | 対応する AC |
|---|---|---|---|
| `docs/verification/001-arcade-core/evidence/lobby_normal_light.png` | 画面1（`/`）：通常（進捗 `1/10`・`1/9`・ランク `A`） | ライト | AC-1, AC-18 |
| `docs/verification/001-arcade-core/evidence/lobby_normal_dark.png` | 画面1（`/`）：通常（進捗 `1/10`・`1/9`・ランク `A`） | ダーク | AC-1, AC-18 |
| `docs/verification/001-arcade-core/evidence/lobby_normal_zoom200.png` | 画面1（`/`）：通常（進捗 `1/10`・`1/9`・ランク `A`・`auto-fit` 折り返し） | 200% | AC-1, AC-18 |
| `docs/verification/001-arcade-core/evidence/lobby_normal_en.png` | 画面1（`/`）：通常（進捗 `1/10`・`1/9`・ランク `A`） | 英語 | AC-1, AC-18 |
| `docs/verification/001-arcade-core/evidence/lobby_normal_mobile.png` | 画面1（`/`）：通常（進捗 `1/10`・`1/9`・ランク `A`） | スマホの幅（320px） | AC-1, AC-18 |
| `docs/verification/001-arcade-core/evidence/combinator_normal_light.png` | 画面2（`/combinator`）：通常（STAGE 1・3スロット配置済・`RUN` 活性・計器 `<dt>` 更新済） | ライト | AC-2, AC-3, AC-18 |
| `docs/verification/001-arcade-core/evidence/combinator_normal_dark.png` | 画面2（`/combinator`）：通常（STAGE 1・3スロット配置済・`RUN` 活性・計器 `<dt>` 更新済） | ダーク | AC-2, AC-3, AC-18 |
| `docs/verification/001-arcade-core/evidence/combinator_normal_zoom200.png` | 画面2（`/combinator`）：通常（STAGE 1・3スロット配置済・`RUN` 活性・`auto-fit` 折り返し） | 200% | AC-2, AC-3, AC-18 |
| `docs/verification/001-arcade-core/evidence/combinator_normal_en.png` | 画面2（`/combinator`）：通常（STAGE 1・3スロット配置済・`RUN` 活性・`Energy/Output/Heat`） | 英語 | AC-2, AC-3, AC-18 |
| `docs/verification/001-arcade-core/evidence/combinator_normal_mobile.png` | 画面2（`/combinator`）：通常（STAGE 1・3スロット配置済・`RUN` 活性） | スマホの幅（320px） | AC-2, AC-3, AC-18 |
| `docs/verification/001-arcade-core/evidence/fermi_normal_light.png` | 画面3（`/fermi`）：通常（STAGE 1・3スロット選択済・`FIRE` 活性） | ライト | AC-7, AC-8, AC-18 |
| `docs/verification/001-arcade-core/evidence/fermi_normal_dark.png` | 画面3（`/fermi`）：通常（STAGE 1・3スロット選択済・`FIRE` 活性） | ダーク | AC-7, AC-8, AC-18 |
| `docs/verification/001-arcade-core/evidence/fermi_normal_zoom200.png` | 画面3（`/fermi`）：通常（STAGE 1・3スロット選択済・`FIRE` 活性・`auto-fit` 折り返し） | 200% | AC-7, AC-8, AC-18 |
| `docs/verification/001-arcade-core/evidence/fermi_normal_en.png` | 画面3（`/fermi`）：通常（STAGE 1・3スロット選択済・`FIRE` 活性） | 英語 | AC-7, AC-8, AC-18 |
| `docs/verification/001-arcade-core/evidence/fermi_normal_mobile.png` | 画面3（`/fermi`）：通常（STAGE 1・3スロット選択済・`FIRE` 活性） | スマホの幅（320px） | AC-7, AC-8, AC-18 |
| `docs/verification/001-arcade-core/evidence/diagnostic_normal_light.png` | 画面4（`/diagnostic`）：通常（ランク `A` 解放・5軸レーダーチャート・コピー活性） | ライト | AC-10, AC-18 |
| `docs/verification/001-arcade-core/evidence/diagnostic_normal_dark.png` | 画面4（`/diagnostic`）：通常（ランク `A` 解放・5軸レーダーチャート・コピー活性） | ダーク | AC-10, AC-18 |
| `docs/verification/001-arcade-core/evidence/diagnostic_normal_zoom200.png` | 画面4（`/diagnostic`）：通常（ランク `A` 解放・5軸レーダーチャート・`auto-fit` 折り返し） | 200% | AC-10, AC-18 |
| `docs/verification/001-arcade-core/evidence/diagnostic_normal_en.png` | 画面4（`/diagnostic`）：通常（ランク `A` 解放・5軸レーダーチャート・コピー活性） | 英語 | AC-10, AC-18 |
| `docs/verification/001-arcade-core/evidence/diagnostic_normal_mobile.png` | 画面4（`/diagnostic`）：通常（ランク `A` 解放・5軸レーダーチャート・コピー活性） | スマホの幅（320px） | AC-10, AC-18 |
| `docs/verification/001-arcade-core/evidence/lobby_empty_light.png` | 画面1（`/`）：空（初期未プレイ `0 / 10`・`0 / 9`・`UNRANKED`） | ライト | AC-1 |
| `docs/verification/001-arcade-core/evidence/lobby_partial_combinator_only_light.png` | 画面1（`/`）：一部クリア（モード1のみクリア・推奨CTAがモード2開始へ切替） | ライト | AC-1, AC-12 |
| `docs/verification/001-arcade-core/evidence/combinator_empty_light.png` | 画面2（`/combinator`）：空・入力不足（未配置案内・`RUN`/`STEP` `disabled`） | ライト | AC-2, AC-13 |
| `docs/verification/001-arcade-core/evidence/combinator_stepping_light.png` | 画面2（`/combinator`）：`STEPPING`（`1/3` 一時停止・試行回数非加算） | ライト | AC-5 |
| `docs/verification/001-arcade-core/evidence/combinator_running_light.png` | 画面2（`/combinator`）：読み込み中／実行中（`RUNNING`・全操作 `disabled`） | ライト | AC-3 |
| `docs/verification/001-arcade-core/evidence/AC3_STAGE_CLEAR.png` | 画面2（`/combinator`）：クリア達成（`STAGE CLEAR`・スコア `1105 pt`・`S1 CLEAR`） | ライト | AC-3, AC-4 |
| `docs/verification/001-arcade-core/evidence/AC6_CRASHED.png` | 画面2（`/combinator`）：エラー（`CRASHED`・`STEP 3` 枯渇・デバッグログ3項目） | ライト | AC-6, AC-17 |
| `docs/verification/001-arcade-core/evidence/AC6_FAILED.png` | 画面2（`/combinator`）：エラー（`FAILED`・`FINAL CHECK` 未達・デバッグログ3項目） | ライト | AC-6 |
| `docs/verification/001-arcade-core/evidence/combinator_stage_fallback_light.png` | 画面2（`/combinator?stage=99`）：エラー（範囲外クエリ補正・`stage-fallback-notice`） | ライト | AC-2 |
| `docs/verification/001-arcade-core/evidence/fermi_empty_light.png` | 画面3（`/fermi`）：空・入力不足（`? × ? × ?`・未選択案内・`FIRE` `disabled`） | ライト | AC-7, AC-9, AC-13 |
| `docs/verification/001-arcade-core/evidence/fermi_running_light.png` | 画面3（`/fermi`）：読み込み中／実行中（`RUNNING`・全操作 `disabled`） | ライト | AC-8 |
| `docs/verification/001-arcade-core/evidence/fermi_perfect_order_light.png` | 画面3（`/fermi`）：クリア達成（`PERFECT ORDER`・解説3項目・`S1 CLEAR`） | ライト | AC-8, AC-9, AC-17, AC-19 |
| `docs/verification/001-arcade-core/evidence/fermi_good_range_light.png` | 画面3（`/fermi`）：クリア達成（`GOOD RANGE`・選択罠強調タグ＋解説3項目） | ライト | AC-8, AC-9 |
| `docs/verification/001-arcade-core/evidence/AC9_解説表示.png` | 画面3（`/fermi`）：エラー・解説（`OVERKILL`・比較／因数分解式／罠理由3項目＋再試行案内） | ライト | AC-8, AC-9 |
| `docs/verification/001-arcade-core/evidence/fermi_underestimate_light.png` | 画面3（`/fermi`）：エラー・解説（`UNDERESTIMATE`・解説3項目＋再試行案内） | ライト | AC-8, AC-9 |
| `docs/verification/001-arcade-core/evidence/fermi_stage_fallback_light.png` | 画面3（`/fermi?stage=99`）：エラー（範囲外クエリ補正・`stage-fallback-notice`） | ライト | AC-7 |
| `docs/verification/001-arcade-core/evidence/AC12_UNRANKED.png` | 画面4（`/diagnostic`）：空（未解放パターン1：履歴0件・`UNRANKED`・警告ボックス枠線／背景） | ライト | AC-12 |
| `docs/verification/001-arcade-core/evidence/diagnostic_unranked_failed_only_light.png` | 画面4（`/diagnostic`）：空（未解放パターン2：失敗履歴のみ・`UNRANKED`・警告ボックス枠線／背景） | ライト | AC-12 |
| `docs/verification/001-arcade-core/evidence/diagnostic_unranked_partial_light.png` | 画面4（`/diagnostic`）：一部クリア（未解放パターン3：モード1のみクリア・`UNRANKED`・警告ボックス枠線／背景） | ライト | AC-12 |
| `docs/verification/001-arcade-core/evidence/AC11_コピー完了通知.png` | 画面4（`/diagnostic`）：コピー完了トースト（`diagnostic-copy-toast` 表示） | ライト | AC-11 |
| `docs/verification/001-arcade-core/evidence/AC20_手動コピー展開.png` | 画面4（`/diagnostic`）：権限拒否・エラー（失敗通知＋手動コピー `<textarea>` 展開） | ライト | AC-20 |
| `docs/verification/001-arcade-core/evidence/AC16_ストレージ退避バナー.png` | 共通シェル・画面1（`/`）：権限拒否・容量不足（`storage-fallback-banner` 表示） | ライト | AC-16 |
| `docs/verification/001-arcade-core/evidence/offline_play_light.png` | 画面4（`/diagnostic`）：オフライン完走後の認定ランク `A` 表示 | ライト | AC-14 |
| `docs/verification/001-arcade-core/evidence/not_found_404_light.png` | 未定義 URL（`/unknown-arcade-route`）：404 フォールバック（`not-found-section`） | ライト | AC-1 |
| `docs/verification/001-arcade-core/evidence/red.log` | 実装前の赤ログ（HTTP `404` により66件失敗） | ログ | AC-1〜AC-20 |
| `docs/verification/001-arcade-core/evidence/acceptance-local-chromium-webkit.log` | G3 r2 ローカル `chromium` + `webkit` 再試行なし実行ログ（44件 PASS） | ログ | AC-1〜AC-20 |
| `docs/verification/001-arcade-core/evidence/ci-ubuntu-web-run-43263542517.log` | G3 r2 同一コミット `c802f8a` Ubuntu CI `chromium` + `firefox` + `webkit` 実行ログ（66件 PASS） | ログ | AC-1〜AC-20 |
| `docs/verification/001-arcade-core/evidence/repeat5-chromium-webkit.log` | G3 r2 揺れ確認 5回反復実行ログ（220件 PASS・失敗0件） | ログ | AC-1〜AC-20 |
| `docs/verification/001-arcade-core/evidence/axe-full-audit.json` | 最新ビルド全44画面・状態の `@axe-core/playwright`（WCAG 2.2 AA）監査結果 JSON（違反0件） | ログ | AC-1, AC-2, AC-7, AC-10, AC-16, AC-18, AC-20 |
| `docs/verification/001-arcade-core/evidence/lighthouse-audit.log` | Lighthouse 13.6.0 全4ルート性能・アクセシビリティ計測ログ | ログ | AC-1, AC-18 |
| `docs/verification/001-arcade-core/evidence/exploratory-sessions.log` | 探索セッション1〜5（R1〜R5）再実行結果ログ | ログ | AC-1〜AC-14, AC-16, AC-18〜AC-20 |

## 10. 前の機能の受け入れテスト（回帰）

`001-arcade-core` は本リポジトリ最初の機能であるため、前の機能は存在しない（該当なし）。

| 機能 | コマンド | 終了コード | 成功 / 失敗 / 飛ばした |
|---|---|---|---|
| 該当なし（初回機能 `001-arcade-core` のため前の機能なし） | — | — | — |

## 11. 見つかった問題

AC の範囲の不具合（`重大` / `要修正`）は **`0件`** である。探索セッションで見つけた AC 外の細かな UX 改善余地1点のみを「提案」として記録する（なお、前回 G3 r1 で記録した提案 `#2`「Clipboard 拒否で手動コピー `<textarea>` を展開中の `JA / EN` 言語切替追従」はコミット `e5693b9` で修正され、今回の探索セッション3で解消を確認した）。

| # | 内容 | 再現の手順 | 再現するテストの名前 | AC | 重大度（重大 / 要修正 / 提案） | 直す役 |
|---|---|---|---|---|---|---|
| 1 | モード2『FERMI BLASTER』で選択済みの仮説カードをもう一度クリックした際、現在は `<fieldset>` スロット内の排他選択維持（`aria-pressed="true"` 継続）として動き、未選択（`?`）に戻すには `RESET（選択をクリア）` で全3枠クリアする形になっている。現状でも別カードへの直接切り替えと `RESET` で全 AC を満たすが、1スロットだけを一旦未選択に戻したい利用者向けに再クリック解除の可否を将来検討してもよい。 | `/fermi?stage=1` を開き、`fermi-card-act1-1` を2回連続クリックする。 | なし（AC外の UX 提案） | AC外（参考：AC-7, AC-9） | 提案 | designer / web-engineer |

## 12. PRD とテストの食い違い

なし

| AC | PRD の文 | テストか実装のふるまい | 決めてほしいこと |
|---|---|---|---|
| — | なし | — | — |

## 13. 未検証のものと理由

なし（PRD の全受け入れ条件 `AC-1`〜`AC-20` はすべて検証完了。なお 3章・7章に記載した実機バックグラウンド復帰時の Web Audio 手触り確認および実機スクリーンリーダー `VoiceOver` / `NVDA` 読み上げ確認は `test-plan.md` の計画どおり G4 の人間確認へ申し送り済み）。
