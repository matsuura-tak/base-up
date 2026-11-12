import type {
  CombinatorCondition,
  CombinatorConditionType,
  CombinatorEffect,
  CombinatorEffectOp,
  CombinatorModule,
  CombinatorStageDefinition,
  LocalizedText,
} from './types';

function makeCondition(
  type: CombinatorConditionType,
  threshold: number | null,
): CombinatorCondition {
  switch (type) {
    case 'ALWAYS':
      return {
        type: 'ALWAYS',
        threshold: null,
        label: { ja: '常時発動（ALWAYS）', en: 'Always active (ALWAYS)' },
      };
    case 'IF_OUTPUT_GTE':
      return {
        type: 'IF_OUTPUT_GTE',
        threshold,
        label: {
          ja: `実行前 OUTPUT >= ${String(threshold)}`,
          en: `Pre-step OUTPUT >= ${String(threshold)}`,
        },
      };
    case 'IF_HEAT_GTE':
      return {
        type: 'IF_HEAT_GTE',
        threshold,
        label: {
          ja: `実行前 HEAT >= ${String(threshold)}`,
          en: `Pre-step HEAT >= ${String(threshold)}`,
        },
      };
    case 'IF_HEAT_LTE':
      return {
        type: 'IF_HEAT_LTE',
        threshold,
        label: {
          ja: `実行前 HEAT <= ${String(threshold)}`,
          en: `Pre-step HEAT <= ${String(threshold)}`,
        },
      };
    case 'IF_ENERGY_GTE':
      return {
        type: 'IF_ENERGY_GTE',
        threshold,
        label: {
          ja: `実行前 ENERGY >= ${String(threshold)}`,
          en: `Pre-step ENERGY >= ${String(threshold)}`,
        },
      };
    case 'IF_ENERGY_LTE':
      return {
        type: 'IF_ENERGY_LTE',
        threshold,
        label: {
          ja: `実行前 ENERGY <= ${String(threshold)}`,
          en: `Pre-step ENERGY <= ${String(threshold)}`,
        },
      };
  }
}

function makeEffect(op: CombinatorEffectOp, value: number): CombinatorEffect {
  switch (op) {
    case 'ADD':
      return {
        op: 'ADD',
        value,
        label: {
          ja: `OUTPUT +${String(value)}`,
          en: `OUTPUT +${String(value)}`,
        },
      };
    case 'MUL':
      return {
        op: 'MUL',
        value,
        label: {
          ja: `OUTPUT ×${String(value)}`,
          en: `OUTPUT ×${String(value)}`,
        },
      };
    case 'HEAT_TO_OUT':
      return {
        op: 'HEAT_TO_OUT',
        value,
        label: {
          ja: `OUTPUT +(HEAT × ${String(value)})`,
          en: `OUTPUT +(HEAT × ${String(value)})`,
        },
      };
    case 'ENERGY_TO_OUT':
      return {
        op: 'ENERGY_TO_OUT',
        value,
        label: {
          ja: `OUTPUT +(ENERGY × ${String(value)})`,
          en: `OUTPUT +(ENERGY × ${String(value)})`,
        },
      };
    case 'ADD_SHIELD':
      return {
        op: 'ADD_SHIELD',
        value,
        label: {
          ja: `OUTPUT +${String(value)} ＆ 次回発熱1回無効シールド`,
          en: `OUTPUT +${String(value)} & next positive HEAT shield`,
        },
      };
  }
}

function makeSideEffectLabel(delta: number): LocalizedText {
  if (delta > 0) {
    return {
      ja: `HEAT +${String(delta)}（発熱加算）`,
      en: `HEAT +${String(delta)} (heat gain)`,
    };
  }
  if (delta < 0) {
    return {
      ja: `HEAT ${String(delta)}（冷却減算・下限0）`,
      en: `HEAT ${String(delta)} (cooling, floor 0)`,
    };
  }
  return {
    ja: 'HEAT ±0（発熱なし）',
    en: 'HEAT ±0 (neutral)',
  };
}

function mod(
  id: string,
  jaName: string,
  enName: string,
  energyDelta: number,
  sideEffectDelta: number,
  condType: CombinatorConditionType,
  threshold: number | null,
  op: CombinatorEffectOp,
  value: number,
): CombinatorModule {
  return {
    id,
    name: { ja: jaName, en: enName },
    energyDelta,
    sideEffectDelta,
    sideEffectLabel: makeSideEffectLabel(sideEffectDelta),
    condition: makeCondition(condType, threshold),
    effect: makeEffect(op, value),
  };
}

function stageSpec(
  stageId: number,
  jaTitle: string,
  enTitle: string,
  initialEnergy: number,
  initialOutput: number,
  initialSideEffect: number,
  overloadLimit: number,
  targetOutput: number,
  modules: CombinatorModule[],
): CombinatorStageDefinition {
  return {
    stageId,
    title: { ja: jaTitle, en: enTitle },
    initialEnergy,
    initialOutput,
    initialSideEffect,
    targetOutput,
    targetConditionText: {
      ja: `OUTPUT >= ${String(targetOutput)}（初期値 E:${String(initialEnergy)} / OUT:${String(initialOutput)} / HEAT:${String(initialSideEffect)}）`,
      en: `OUTPUT >= ${String(targetOutput)} (Init E:${String(initialEnergy)} / OUT:${String(initialOutput)} / HEAT:${String(initialSideEffect)})`,
    },
    overloadLimit,
    overloadLimitText: {
      ja: `HEAT <= ${String(overloadLimit)}`,
      en: `HEAT <= ${String(overloadLimit)}`,
    },
    modules,
  };
}

export const COMBINATOR_STAGES: readonly CombinatorStageDefinition[] = [
  stageSpec(1, 'STAGE 1：信号起動の順序設計', 'Stage 1: Signal Boot Ordering', 10, 0, 0, 12, 24, [
    mod('s1-seed', 'シード発振器', 'Seed Oscillator', -3, 2, 'ALWAYS', null, 'ADD', 6),
    mod('s1-amp2', '二倍増幅器 A', 'Twin Amplifier A', -3, 3, 'ALWAYS', null, 'MUL', 2),
    mod('s1-amp2b', '二倍増幅器 B', 'Twin Amplifier B', -4, 4, 'ALWAYS', null, 'MUL', 2),
    mod('s1-add5', '補助加算バス', 'Aux Adder Bus', -2, 1, 'ALWAYS', null, 'ADD', 5),
    mod('s1-over', '過負荷ブースト', 'Overdrive Boost', -5, 10, 'ALWAYS', null, 'ADD', 10),
  ]),
  stageSpec(2, 'STAGE 2：電源充填と三倍増幅', 'Stage 2: Cell Charge & Triple Amp', 6, 2, 0, 12, 30, [
    mod('s2-cell', '予備セル充填', 'Reserve Cell Charge', 5, 2, 'ALWAYS', null, 'ADD', 2),
    mod('s2-boost', '中段ブースター', 'Mid Booster', -4, 3, 'ALWAYS', null, 'ADD', 6),
    mod('s2-tri', '三倍乗算コア', 'Triple Core', -7, 5, 'ALWAYS', null, 'MUL', 3),
    mod('s2-patch', '安定パッチ回路', 'Steady Patch', -2, 1, 'ALWAYS', null, 'ADD', 5),
    mod('s2-burn', '高熱バーナー増幅', 'High-Heat Burner', -5, 9, 'ALWAYS', null, 'MUL', 2),
  ]),
  stageSpec(3, 'STAGE 3：熱飽和の冷却挟み込み', 'Stage 3: Thermal Cooling Interleave', 10, 0, 4, 10, 32, [
    mod('s3-core', '高出力コア注入', 'Core Injector', -3, 6, 'ALWAYS', null, 'ADD', 12),
    mod('s3-cool', '液体冷却ダクト', 'Cryo Coolant Duct', -2, -6, 'ALWAYS', null, 'ADD', 4),
    mod('s3-dup', 'デュアル複製器', 'Dual Replicator', -4, 6, 'ALWAYS', null, 'MUL', 2),
    mod('s3-safe', '低発熱バイパス', 'Low-Heat Bypass', -2, 1, 'ALWAYS', null, 'ADD', 6),
    mod('s3-heavy', '重負荷インジェクタ', 'Heavy Injector', -6, 7, 'ALWAYS', null, 'ADD', 14),
  ]),
  stageSpec(4, 'STAGE 4：断熱シールドによる暴走遮断', 'Stage 4: Thermal Shield Interception', 10, 0, 3, 9, 40, [
    mod('s4-init', '初期励起コイル', 'Prime Exciter', -3, 3, 'ALWAYS', null, 'ADD', 10),
    mod('s4-guard', '断熱シールド展開', 'Thermal Guard Shield', -2, 0, 'ALWAYS', null, 'ADD_SHIELD', 4),
    mod('s4-nova', 'ノヴァ三倍増幅', 'Nova Triple Amp', -5, 8, 'ALWAYS', null, 'MUL', 3),
    mod('s4-vent', '排気ベント弁', 'Exhaust Vent', -2, -4, 'ALWAYS', null, 'ADD', 3),
    mod('s4-amp', '標準倍増ユニット', 'Standard Doubler', -4, 4, 'ALWAYS', null, 'MUL', 2),
    mod('s4-leak', '漏電ブースト回路', 'Leakage Booster', -6, 5, 'ALWAYS', null, 'ADD', 12),
  ]),
  stageSpec(5, 'STAGE 5：出力閾値ゲートの開放', 'Stage 5: Output Threshold Gate', 10, 4, 0, 10, 48, [
    mod('s5-add8', '前段パルス加算', 'Pre-Pulse Adder', -3, 3, 'ALWAYS', null, 'ADD', 8),
    mod('s5-gate', '閾値四倍ゲート', 'Quad Threshold Gate', -4, 4, 'IF_OUTPUT_GTE', 12, 'MUL', 4),
    mod('s5-trim', '微調整クーラー', 'Trim Cooler', -2, -2, 'ALWAYS', null, 'ADD', 2),
    mod('s5-add5', '小信号加算器', 'Minor Signal Adder', -2, 2, 'ALWAYS', null, 'ADD', 5),
    mod('s5-mul2', '汎用二倍器', 'General Doubler', -4, 5, 'ALWAYS', null, 'MUL', 2),
    mod('s5-surge', '高圧サージ注入', 'Surge Injector', -7, 7, 'ALWAYS', null, 'ADD', 15),
  ]),
  stageSpec(6, 'STAGE 6：低温条件レーザーの精密制御', 'Stage 6: Low-Heat Precision Laser', 9, 0, 6, 10, 45, [
    mod('s6-chill', '急速チラー冷却', 'Rapid Chiller', -2, -5, 'ALWAYS', null, 'ADD', 6),
    mod('s6-laser', '低温励起レーザー', 'Cryo Laser Emitter', -3, 4, 'IF_HEAT_LTE', 2, 'ADD', 18),
    mod('s6-double', '終段ダブラー', 'Final Stage Doubler', -4, 4, 'ALWAYS', null, 'MUL', 2),
    mod('s6-warm', '予熱加算ユニット', 'Warmup Adder', -3, 3, 'ALWAYS', null, 'ADD', 10),
    mod('s6-cell', '補助バッテリー', 'Aux Battery Cell', 3, 3, 'ALWAYS', null, 'ADD', 4),
    mod('s6-blast', '高消費ブラスター', 'High-Drain Blaster', -6, 6, 'ALWAYS', null, 'MUL', 2),
  ]),
  stageSpec(7, 'STAGE 7：高電圧ダイナモの変換連鎖', 'Stage 7: High-Voltage Dynamo Chain', 4, 0, 2, 10, 48, [
    mod('s7-charge', '急速コンデンサ充電', 'Fast Capacitor Charge', 6, 3, 'ALWAYS', null, 'ADD', 4),
    mod('s7-dynamo', '高圧ダイナモ変換', 'High-Volt Dynamo', -3, 2, 'IF_ENERGY_GTE', 10, 'ENERGY_TO_OUT', 2),
    mod('s7-amp2', '共振倍増アンプ', 'Resonant Doubler', -5, 3, 'ALWAYS', null, 'MUL', 2),
    mod('s7-cool', '放熱フィン', 'Radiator Fin', -1, -4, 'ALWAYS', null, 'ADD', 5),
    mod('s7-flat', '定常加算ノード', 'Steady Adder Node', -2, 2, 'ALWAYS', null, 'ADD', 10),
    mod('s7-over', '過熱三倍ブースター', 'Overheat Tripler', -6, 6, 'ALWAYS', null, 'MUL', 3),
  ]),
  stageSpec(8, 'STAGE 8：廃熱回生タービンの逆利用', 'Stage 8: Waste-Heat Recovery Turbine', 10, 0, 2, 10, 64, [
    mod('s8-ignite', '点火イグナイタ', 'Core Igniter', -3, 7, 'ALWAYS', null, 'ADD', 6),
    mod('s8-thermo', '熱電回生コンバータ', 'Thermo Converter', -3, -4, 'IF_HEAT_GTE', 8, 'HEAT_TO_OUT', 3),
    mod('s8-amp2', '高出力段ダブラー', 'High-Output Doubler', -4, 4, 'IF_OUTPUT_GTE', 30, 'MUL', 2),
    mod('s8-safe', '安定バイパス回路', 'Safe Bypass', -2, 1, 'ALWAYS', null, 'ADD', 8),
    mod('s8-cool', '先行冷却バルブ', 'Pre-Cool Valve', -2, -5, 'ALWAYS', null, 'ADD', 5),
    mod('s8-mul2', '無条件倍増器', 'Direct Doubler', -5, 5, 'ALWAYS', null, 'MUL', 2),
    mod('s8-melt', '臨界メルト注入', 'Critical Melt Injector', -3, 9, 'ALWAYS', null, 'ADD', 20),
  ]),
  stageSpec(9, 'STAGE 9：リアクター充填と熱サイフォン境界', 'Stage 9: Reactor & Thermal Siphon', 5, 0, 5, 9, 66, [
    mod('s9-reactor', '核融合リアクター充填', 'Reactor Charge', 6, 4, 'ALWAYS', null, 'ADD', 8),
    mod('s9-siphon', '高温熱サイフォン', 'Thermal Siphon', -4, -5, 'IF_HEAT_GTE', 8, 'ADD', 15),
    mod('s9-hyper', 'ハイパー三倍ドライブ', 'Hyper Triple Drive', -7, 5, 'IF_ENERGY_GTE', 7, 'MUL', 3),
    mod('s9-shield', '防護シールド発生器', 'Barrier Generator', -2, 0, 'ALWAYS', null, 'ADD_SHIELD', 5),
    mod('s9-add10', '中出力パルス器', 'Mid Pulse Unit', -3, 2, 'ALWAYS', null, 'ADD', 10),
    mod('s9-mul2', '標準二倍アンプ', 'Standard Twin Amp', -3, 3, 'ALWAYS', null, 'MUL', 2),
    mod('s9-spike', '熱スパイク注入', 'Heat Spike Injector', -4, 6, 'ALWAYS', null, 'ADD', 18),
  ]),
  stageSpec(10, 'STAGE 10：臨界ストークと熱エネルギー全転換', 'Stage 10: Critical Stoke & Full Reclaim', 8, 2, 4, 10, 105, [
    mod('s10-stoke', '臨界ストーク炉', 'Critical Stoker', -2, 6, 'ALWAYS', null, 'ADD', 4),
    mod('s10-reclaim', '臨界熱回生ジェネレータ', 'Critical Heat Reclaimer', 3, -6, 'IF_HEAT_GTE', 10, 'HEAT_TO_OUT', 3),
    mod('s10-overdrive', '終段オーバードライブ', 'Final Overdrive ×3', -9, 6, 'IF_OUTPUT_GTE', 35, 'MUL', 3),
    mod('s10-vent', '緊急放熱ベント', 'Emergency Vent', -1, -4, 'ALWAYS', null, 'ADD', 6),
    mod('s10-boost', '補助ブースト回路', 'Aux Boost Circuit', -3, 3, 'ALWAYS', null, 'ADD', 12),
    mod('s10-amp2', '汎用二倍コンバータ', 'Twin Converter', -4, 4, 'ALWAYS', null, 'MUL', 2),
    mod('s10-overload', '暴走寸前インジェクタ', 'Brink Injector', -3, 7, 'ALWAYS', null, 'ADD', 25),
  ]),
];

export function getCombinatorStage(stageId: number): CombinatorStageDefinition {
  const found = COMBINATOR_STAGES.find((s) => s.stageId === stageId);
  return found ?? COMBINATOR_STAGES[0]!;
}

export function formatEnergyCost(energyDelta: number, locale: 'ja' | 'en'): string {
  if (energyDelta > 0) {
    return locale === 'en'
      ? `ENERGY +${String(energyDelta)} (recover)`
      : `ENERGY +${String(energyDelta)}（回復）`;
  }
  return locale === 'en'
    ? `ENERGY ${String(energyDelta)} (consume)`
    : `ENERGY ${String(energyDelta)}（消費）`;
}
