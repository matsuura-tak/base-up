import type { components } from '../generated/contracts';

export type Locale = components['schemas']['Locale'];
export type LocalizedText = components['schemas']['LocalizedText'];

export const JA_DICTIONARY = {
  'app.name': 'LOGIC ARCADE',
  'app.subtitle': '設計思考とフェルミ推定を鍛えるレトロ思考ゲーム',
  'page.title.lobby': 'モード選択 | LOGIC ARCADE',
  'page.title.combinator': '3-ACT COMBINATOR | LOGIC ARCADE',
  'page.title.fermi': 'FERMI BLASTER | LOGIC ARCADE',
  'page.title.diagnostic': '思考力診断カルテ | LOGIC ARCADE',
  'page.title.notFound': 'ページが見つかりません | LOGIC ARCADE',
  'nav.skipToMain': 'メインコンテンツへ移動する',
  'nav.homeAria': 'LOGIC ARCADE：モード選択へ戻る',
  'nav.modeSwitcherAria': 'モード切替',
  'nav.combinator': '3-ACT COMBINATOR',
  'nav.fermi': 'FERMI BLASTER',
  'nav.diagnostic': '思考力診断カルテ',
  'header.sound.toggle': 'SOUND（効果音）',
  'header.sound.on': 'SOUND ON',
  'header.sound.off': 'SOUND OFF',
  'header.lang.ja': 'JA',
  'header.lang.en': 'EN',
  'header.lang.switchJa': 'JA：表示言語を日本語に切り替える',
  'header.lang.switchEn': 'EN：表示言語を英語に切り替える',
  'banner.storageFallback':
    'ブラウザの保存機能が無効なため、このタブを閉じるまでプレイ記録を一時保持します。永続保存するにはプライベートブラウズや Cookie・サイトデータの制限設定をご確認ください。',
  'error.boundary.message':
    '画面の表示中に問題が発生しました。ページを再読み込みして再開してください。',
  'error.boundary.reload': 'ページを再読み込みする',
  'error.notFound.heading': '指定されたページが見つかりません',
  'error.notFound.message':
    '開こうとした URL に対応する画面がありません。モード選択（トップ）へ戻ってステージを選んでください。',
  'error.notFound.backToLobby': 'モード選択（トップ）へ戻る',
  'lobby.lead':
    '登録不要・全19ステージ無料。1ステージ約3分で「3手の設計トレードオフ」と「3スロットのフェルミ因数分解」を試し、5軸の思考特性を可視化します。',
  'lobby.emptyHint': 'まだクリア記録がありません。まずは STAGE 1 から試せます。',
  'lobby.cta.startCombinator': '3-ACT COMBINATOR の STAGE 1 を始める',
  'lobby.cta.startFermi': 'FERMI BLASTER の STAGE 1 を始める',
  'lobby.cta.openDiagnostic': '思考力診断カルテで認定ランクを見る',
  'lobby.card.combinator.desc':
    '5〜7個のモジュールから3手の順序を組み、副作用と暴走上限を制御して目標出力を達成する設計パズル（全10ステージ）。',
  'lobby.card.fermi.desc':
    '母集団・絞り込み・単価の3スロットに仮説カードを選び、対数オーダーで未知の規模を射抜く概算ゲーム（全9ステージ）。',
  'lobby.card.diagnostic.desc':
    '両モードの履歴から5軸スコア（0〜100）と総合認定ランク（S+〜C）を算出し、テキストで結果を共有します。',
  'lobby.card.openCombinator': '3-ACT COMBINATOR を開く',
  'lobby.card.openFermi': 'FERMI BLASTER を開く',
  'lobby.card.openDiagnostic': '思考力診断カルテを開く',
  'common.progressCleared': 'クリア進捗：{cleared} / {total}',
  'common.clearedBadge': 'CLEAR',
  'common.stageFallbackNotice':
    '指定されたステージ番号が範囲外のため、STAGE 1 を表示しました。上のステージ選択ボタンから任意のステージを選べます。',
  'combinator.section.stages': 'ステージを選択する（全10ステージ）',
  'combinator.stage.label': 'S{n}',
  'combinator.stage.labelCleared': 'S{n} CLEAR',
  'combinator.stage.aria': 'S{n}：ステージ {n} を選択する',
  'combinator.stage.ariaCleared': 'S{n} CLEAR：ステージ {n}（クリア済み）を選択する',
  'combinator.label.target': 'ターゲット達成条件',
  'combinator.target.display': 'ターゲット達成条件：{condition}',
  'combinator.label.limit': '暴走上限値',
  'combinator.limit.display': '暴走上限値：{limit}',
  'combinator.gauge.energy': '残りエネルギー (ENERGY)',
  'combinator.gauge.output': '現在出力 (OUTPUT)',
  'combinator.gauge.sideEffect': '現在発熱 (HEAT)',
  'combinator.canvas.aria':
    '3ステップ回路シミュレーション盤面（現在の状態：{status}、ステップ：{step}/3）',
  'combinator.section.slots': '3ステップ実行スロット',
  'combinator.slot.emptyLabel': 'STEP {k}：未配置（モジュールを押して配置）',
  'combinator.slot.assignedLabel': 'STEP {k}：{moduleName}（押して解除する）',
  'combinator.guidance.unassigned':
    '未配置のスロットがあります：{slots} にモジュールを配置してください。',
  'combinator.action.run': 'RUN（実行する）',
  'combinator.action.step': 'STEP（1手進める）',
  'combinator.action.reset': 'RESET（初期値に戻す）',
  'combinator.action.nextStage': '次のステージを開く',
  'combinator.section.modules': 'モジュールデッキ（押してスロットへ配置）',
  'combinator.module.assignAction': 'スロットへ配置する',
  'combinator.module.removeAction': 'STEP {k} に配置中（押して解除する）',
  'combinator.module.fullAction': 'スロット満杯（空きを作ると配置可能）',
  'combinator.attr.effect': '基本性能',
  'combinator.attr.cost': 'エネルギーコスト',
  'combinator.attr.sideEffect': '副作用',
  'combinator.attr.condition': '発動条件',
  'combinator.status.idle': 'IDLE（待機中）',
  'combinator.status.stepping': 'STEPPING（{step}/3 一時停止中）',
  'combinator.status.running': 'RUNNING（再生中）',
  'combinator.status.clear': 'STAGE CLEAR',
  'combinator.status.crashed': 'CRASHED',
  'combinator.status.failed': 'FAILED',
  'combinator.score.label': '獲得スコア：{score} pt',
  'combinator.debug.heading': 'デバッグログ（破綻箇所と数値の検証）',
  'combinator.debug.location': '失敗発生箇所：{location}',
  'combinator.debug.reason.energy': '原因種別：エネルギー枯渇（残量が 0 未満に低下）',
  'combinator.debug.reason.overheat': '原因種別：暴走上限超過（副作用値が上限を超過）',
  'combinator.debug.reason.unmet': '原因種別：ターゲット未達（3手完走時点で目標条件に不足）',
  'combinator.debug.values': '期待条件値：{expected} ／ 実測値：{actual}',
  'combinator.debug.retryHint':
    'RESET（初期値に戻す）を押すかスロットのモジュールを差し替えて、別の順序を試せます。',
  'fermi.tier.beginner': '初級',
  'fermi.tier.intermediate': '中級',
  'fermi.tier.advanced': '上級',
  'fermi.stage.label': 'S{n}',
  'fermi.stage.labelCleared': 'S{n} CLEAR',
  'fermi.stage.aria': 'S{n}：{tier}ステージ {n} を選択する',
  'fermi.stage.ariaCleared': 'S{n} CLEAR：{tier}ステージ {n}（クリア済み）を選択する',
  'fermi.formula.emptySlot': '?',
  'fermi.canvas.aria': 'フェルミ推定シミュレーション盤面（現在の判定：{status}）',
  'fermi.card.labelFormat': '{label}（{value}）',
  'fermi.card.selectedBadge': '選択中',
  'fermi.guidance.unassigned':
    '未選択のスロットがあります：{slots} の仮説カードを1枚ずつ選択してください。',
  'fermi.action.fire': 'FIRE（発射する）',
  'fermi.action.reset': 'RESET（選択をクリア）',
  'fermi.status.idle': 'IDLE（仮説選択待ち）',
  'fermi.status.running': 'RUNNING（推定レーザー計測中）',
  'fermi.status.perfect': 'PERFECT ORDER',
  'fermi.status.good': 'GOOD RANGE',
  'fermi.status.overkill': 'OVERKILL',
  'fermi.status.underestimate': 'UNDERESTIMATE',
  'fermi.explain.heading': '因数分解ロジックと罠カードの解説',
  'fermi.explain.comparison':
    'あなたの推定値：{estimate} ／ ステージ基準値：{baseline}（対数誤差 d = {logError}）',
  'fermi.explain.formulaHeading': '基準因数分解式（ACT 1 × ACT 2 × ACT 3）',
  'fermi.explain.trapHeading': 'このステージの罠カードと注意点',
  'fermi.explain.trapTriggeredBadge': '今回選択した罠カード',
  'fermi.explain.retryHint':
    'RESET（選択をクリア）を押すか各スロットで別の仮説カードを選び直して、再度 FIRE（発射する）で検証できます。',
  'diagnostic.heading.rank': '総合認定ランク',
  'diagnostic.rankLabel': '総合認定ランク：{rank}',
  'diagnostic.rank.unranked': 'UNRANKED',
  'diagnostic.overallScore': '総合スコア：{score} / 100',
  'diagnostic.overallScore.unranked': '総合スコア：未算出（両モード各1ステージクリアで解放）',
  'diagnostic.unranked.noticeBoth':
    '認定ランクはまだ解放されていません。3-ACT COMBINATOR と FERMI BLASTER をそれぞれ1ステージ以上クリアすると、総合認定ランク（S+〜C）と結果コピーが解放されます。',
  'diagnostic.unranked.noticeCombinatorOnly':
    'あと1モードで認定ランク解放です。3-ACT COMBINATOR を1ステージ以上クリアすると総合認定ランクが確定します。',
  'diagnostic.unranked.noticeFermiOnly':
    'あと1モードで認定ランク解放です。FERMI BLASTER を1ステージ以上クリアすると総合認定ランクが確定します。',
  'diagnostic.axis.spec': '仕様読解力',
  'diagnostic.axis.sequence': '順序構築力',
  'diagnostic.axis.resource': 'リソース制御力',
  'diagnostic.axis.fermi': 'フェルミ概算センス',
  'diagnostic.axis.hypothesis': '仮説精度',
  'diagnostic.radar.title': '5軸エンジニア思考特性レーダーチャート',
  'diagnostic.radar.desc':
    '仕様読解力 {s1}、順序構築力 {s2}、リソース制御力 {s3}、フェルミ概算センス {s4}、仮説精度 {s5}（各100点満点）',
  'diagnostic.action.copy': '診断結果をコピーする',
  'diagnostic.copy.toastSuccess':
    '診断結果をクリップボードにコピーしました。SNS やチャットにそのまま貼り付けられます。',
  'diagnostic.copy.errorFallback':
    'クリップボードへの自動コピーがブラウザに制限されました。下のテキスト欄を選択してコピーしてください。',
  'diagnostic.copy.manualLabel': '手動コピー用の診断結果サマリー',
  'diagnostic.action.selectAll': 'テキストを全選択する',
  'diagnostic.share.template':
    'LOGIC ARCADE 思考力診断カルテ\n総合認定ランク: {rank} ({overall}/100)\n・仕様読解力: {s1}\n・順序構築力: {s2}\n・リソース制御力: {s3}\n・フェルミ概算センス: {s4}\n・仮説精度: {s5}',
} as const;

export type DictionaryKey = keyof typeof JA_DICTIONARY;

export const EN_DICTIONARY: Record<DictionaryKey, string> = {
  'app.name': 'LOGIC ARCADE',
  'app.subtitle': 'Retro Arcade Puzzles for System Design & Fermi Estimation',
  'page.title.lobby': 'Mode Select | LOGIC ARCADE',
  'page.title.combinator': '3-ACT COMBINATOR | LOGIC ARCADE',
  'page.title.fermi': 'FERMI BLASTER | LOGIC ARCADE',
  'page.title.diagnostic': 'Diagnostic Chart | LOGIC ARCADE',
  'page.title.notFound': 'Page Not Found | LOGIC ARCADE',
  'nav.skipToMain': 'Skip to main content',
  'nav.homeAria': 'LOGIC ARCADE: Return to Mode Select',
  'nav.modeSwitcherAria': 'Mode navigation',
  'nav.combinator': '3-ACT COMBINATOR',
  'nav.fermi': 'FERMI BLASTER',
  'nav.diagnostic': 'Diagnostic Chart',
  'header.sound.toggle': 'SOUND (SFX)',
  'header.sound.on': 'SOUND ON',
  'header.sound.off': 'SOUND OFF',
  'header.lang.ja': 'JA',
  'header.lang.en': 'EN',
  'header.lang.switchJa': 'JA: Switch display language to Japanese',
  'header.lang.switchEn': 'EN: Switch display language to English',
  'banner.storageFallback':
    'Browser storage is unavailable, so progress is kept in memory until this tab closes. Check private browsing or site data settings to save across reloads.',
  'error.boundary.message':
    'Something went wrong while rendering this screen. Reload the page to continue.',
  'error.boundary.reload': 'Reload page',
  'error.notFound.heading': 'Page Not Found',
  'error.notFound.message':
    'No screen matches this URL. Return to Mode Select to choose a game mode.',
  'error.notFound.backToLobby': 'Return to Mode Select',
  'lobby.lead':
    'Zero sign-up, all 19 stages free. Test 3-step system trade-offs and 3-slot Fermi breakdowns in ~3 minutes per stage, then inspect your 5-axis profile.',
  'lobby.emptyHint': 'No cleared stages yet. Start with Stage 1 to record your first run.',
  'lobby.cta.startCombinator': 'Start 3-ACT COMBINATOR Stage 1',
  'lobby.cta.startFermi': 'Start FERMI BLASTER Stage 1',
  'lobby.cta.openDiagnostic': 'View Rank in Diagnostic Chart',
  'lobby.card.combinator.desc':
    'Arrange 3 modules out of 5–7 to hit target output while controlling side effects and overload limits (10 stages).',
  'lobby.card.fermi.desc':
    'Pick hypothesis cards across 3 breakdown slots to hit the right order of magnitude without rote memorization (9 stages).',
  'lobby.card.diagnostic.desc':
    'Computes 5 thinking-axis scores (0–100) and an overall rank (S+ to C) from both modes, ready to copy and share.',
  'lobby.card.openCombinator': 'Open 3-ACT COMBINATOR',
  'lobby.card.openFermi': 'Open FERMI BLASTER',
  'lobby.card.openDiagnostic': 'Open Diagnostic Chart',
  'common.progressCleared': 'Cleared: {cleared} / {total}',
  'common.clearedBadge': 'CLEAR',
  'common.stageFallbackNotice':
    'The requested stage number is out of range, so Stage 1 was loaded. Use the stage buttons above to switch stages.',
  'combinator.section.stages': 'Select Stage (10 Stages)',
  'combinator.stage.label': 'S{n}',
  'combinator.stage.labelCleared': 'S{n} CLEAR',
  'combinator.stage.aria': 'S{n}: Select Stage {n}',
  'combinator.stage.ariaCleared': 'S{n} CLEAR: Select Stage {n} (Cleared)',
  'combinator.label.target': 'Target Condition',
  'combinator.target.display': 'Target Condition: {condition}',
  'combinator.label.limit': 'Overload Limit',
  'combinator.limit.display': 'Overload Limit: {limit}',
  'combinator.gauge.energy': 'Energy',
  'combinator.gauge.output': 'Output',
  'combinator.gauge.sideEffect': 'Heat',
  'combinator.canvas.aria':
    '3-step circuit simulation board (status: {status}, step: {step}/3)',
  'combinator.section.slots': '3-Step Execution Slots',
  'combinator.slot.emptyLabel': 'STEP {k}: Empty (select a module below)',
  'combinator.slot.assignedLabel': 'STEP {k}: {moduleName} (activate to remove)',
  'combinator.guidance.unassigned':
    'Unassigned slots remaining: place modules in {slots}.',
  'combinator.action.run': 'RUN (Execute)',
  'combinator.action.step': 'STEP (1 Act)',
  'combinator.action.reset': 'RESET (Restore)',
  'combinator.action.nextStage': 'Open Next Stage',
  'combinator.section.modules': 'Module Deck (Select to Assign)',
  'combinator.module.assignAction': 'Assign to slot',
  'combinator.module.removeAction': 'In STEP {k} (activate to remove)',
  'combinator.module.fullAction': 'Slots full (clear a slot to assign)',
  'combinator.attr.effect': 'Effect',
  'combinator.attr.cost': 'Energy Cost',
  'combinator.attr.sideEffect': 'Side Effect',
  'combinator.attr.condition': 'Condition',
  'combinator.status.idle': 'IDLE (Ready)',
  'combinator.status.stepping': 'STEPPING (Paused at {step}/3)',
  'combinator.status.running': 'RUNNING (Simulating)',
  'combinator.status.clear': 'STAGE CLEAR',
  'combinator.status.crashed': 'CRASHED',
  'combinator.status.failed': 'FAILED',
  'combinator.score.label': 'Score: {score} pt',
  'combinator.debug.heading': 'Debug Log (Failure Step & Telemetry)',
  'combinator.debug.location': 'Failure Location: {location}',
  'combinator.debug.reason.energy': 'Cause: Energy Depletion (dropped below 0)',
  'combinator.debug.reason.overheat': 'Cause: Overload Exceeded (side effect crossed limit)',
  'combinator.debug.reason.unmet': 'Cause: Target Unmet (final output missed condition)',
  'combinator.debug.values': 'Expected: {expected} / Actual: {actual}',
  'combinator.debug.retryHint':
    'Press RESET (Restore) or swap a module in any slot to test another sequence.',
  'fermi.tier.beginner': 'Beginner',
  'fermi.tier.intermediate': 'Intermediate',
  'fermi.tier.advanced': 'Advanced',
  'fermi.stage.label': 'S{n}',
  'fermi.stage.labelCleared': 'S{n} CLEAR',
  'fermi.stage.aria': 'S{n}: Select {tier} Stage {n}',
  'fermi.stage.ariaCleared': 'S{n} CLEAR: Select {tier} Stage {n} (Cleared)',
  'fermi.formula.emptySlot': '?',
  'fermi.canvas.aria': 'Fermi estimation simulation board (judgment: {status})',
  'fermi.card.labelFormat': '{label} ({value})',
  'fermi.card.selectedBadge': 'Selected',
  'fermi.guidance.unassigned':
    'Unselected slots remaining: select one hypothesis card for {slots}.',
  'fermi.action.fire': 'FIRE (Launch)',
  'fermi.action.reset': 'RESET (Clear)',
  'fermi.status.idle': 'IDLE (Select Cards)',
  'fermi.status.running': 'RUNNING (Measuring Beam)',
  'fermi.status.perfect': 'PERFECT ORDER',
  'fermi.status.good': 'GOOD RANGE',
  'fermi.status.overkill': 'OVERKILL',
  'fermi.status.underestimate': 'UNDERESTIMATE',
  'fermi.explain.heading': 'Factorization Breakdown & Trap Card Analysis',
  'fermi.explain.comparison':
    'Your Estimate: {estimate} / Stage Baseline: {baseline} (log10 error d = {logError})',
  'fermi.explain.formulaHeading': 'Baseline Factorization (ACT 1 × ACT 2 × ACT 3)',
  'fermi.explain.trapHeading': 'Trap Cards in This Stage',
  'fermi.explain.trapTriggeredBadge': 'Selected in Your Run',
  'fermi.explain.retryHint':
    'Press RESET (Clear) or choose different hypothesis cards in any slot, then press FIRE (Launch) to test again.',
  'diagnostic.heading.rank': 'Overall Certified Rank',
  'diagnostic.rankLabel': 'Overall Rank: {rank}',
  'diagnostic.rank.unranked': 'UNRANKED',
  'diagnostic.overallScore': 'Overall Score: {score} / 100',
  'diagnostic.overallScore.unranked': 'Overall Score: Pending (clear 1+ stage in each mode)',
  'diagnostic.unranked.noticeBoth':
    'Your overall rank is not unlocked yet. Clear at least 1 stage in both 3-ACT COMBINATOR and FERMI BLASTER to unlock your S+ to C rank and summary sharing.',
  'diagnostic.unranked.noticeCombinatorOnly':
    'One mode left to unlock your rank. Clear at least 1 stage in 3-ACT COMBINATOR to finalize your overall rank.',
  'diagnostic.unranked.noticeFermiOnly':
    'One mode left to unlock your rank. Clear at least 1 stage in FERMI BLASTER to finalize your overall rank.',
  'diagnostic.axis.spec': 'Spec Comprehension',
  'diagnostic.axis.sequence': 'Sequence Design',
  'diagnostic.axis.resource': 'Resource Control',
  'diagnostic.axis.fermi': 'Fermi Sense',
  'diagnostic.axis.hypothesis': 'Hypothesis Precision',
  'diagnostic.radar.title': '5-Axis Engineering Thinking Radar Chart',
  'diagnostic.radar.desc':
    'Spec Comprehension {s1}, Sequence Design {s2}, Resource Control {s3}, Fermi Sense {s4}, Hypothesis Precision {s5} out of 100',
  'diagnostic.action.copy': 'Copy Diagnostic Summary',
  'diagnostic.copy.toastSuccess':
    'Copied diagnostic summary to clipboard. Ready to paste and share.',
  'diagnostic.copy.errorFallback':
    'Automatic clipboard copy was blocked by the browser. Select and copy the summary text below.',
  'diagnostic.copy.manualLabel': 'Diagnostic Summary for Manual Copy',
  'diagnostic.action.selectAll': 'Select All Text',
  'diagnostic.share.template':
    'LOGIC ARCADE Diagnostic Chart\nOverall Rank: {rank} ({overall}/100)\n- Spec Comprehension: {s1}\n- Sequence Design: {s2}\n- Resource Control: {s3}\n- Fermi Sense: {s4}\n- Hypothesis Precision: {s5}',
};

export function t(
  locale: Locale,
  key: DictionaryKey,
  params?: Readonly<Record<string, string | number>>,
): string {
  const table = locale === 'en' ? EN_DICTIONARY : JA_DICTIONARY;
  const template = table[key];
  if (!params) {
    return template;
  }
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, token: string) => {
    const val = params[token];
    return val === undefined ? match : String(val);
  });
}

export function pickText(text: LocalizedText, locale: Locale): string {
  return locale === 'en' ? text.en : text.ja;
}
