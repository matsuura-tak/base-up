import type {
  CombinatorCondition,
  CombinatorCurrentParams,
  CombinatorDebugLog,
  CombinatorFailureLocation,
  CombinatorInitialParams,
  CombinatorModule,
  CombinatorStageDefinition,
} from './types';

export interface CombinatorStepFrame {
  readonly stepNumber: 1 | 2 | 3;
  readonly moduleId: string;
  readonly conditionMet: boolean;
  readonly shieldConsumed: boolean;
  readonly paramsAfter: CombinatorCurrentParams;
  readonly crashedDebugLog: CombinatorDebugLog | null;
}

export interface CombinatorEvaluationResult {
  readonly status: 'STAGE CLEAR' | 'CRASHED' | 'FAILED';
  readonly finalStepIndex: 1 | 2 | 3;
  readonly initialParams: CombinatorInitialParams;
  readonly finalParams: CombinatorCurrentParams;
  readonly frames: readonly CombinatorStepFrame[];
  readonly score: number | null;
  readonly debugLog: CombinatorDebugLog | null;
  readonly usedSideEffectOrIf: boolean;
}

export function createInitialCombinatorParams(
  stage: CombinatorStageDefinition,
): CombinatorCurrentParams {
  return {
    energy: stage.initialEnergy,
    output: stage.initialOutput,
    sideEffect: stage.initialSideEffect,
    shieldActive: false,
    score: null,
  };
}

export function extractInitialParamsMeta(
  stage: CombinatorStageDefinition,
): CombinatorInitialParams {
  return {
    energy: stage.initialEnergy,
    output: stage.initialOutput,
    sideEffect: stage.initialSideEffect,
    overloadLimit: stage.overloadLimit,
    targetOutput: stage.targetOutput,
  };
}

export function evaluateCombinatorCondition(
  condition: CombinatorCondition,
  preEnergy: number,
  preOutput: number,
  preSideEffect: number,
): boolean {
  const threshold = condition.threshold ?? 0;
  switch (condition.type) {
    case 'ALWAYS':
      return true;
    case 'IF_OUTPUT_GTE':
      return preOutput >= threshold;
    case 'IF_HEAT_GTE':
      return preSideEffect >= threshold;
    case 'IF_HEAT_LTE':
      return preSideEffect <= threshold;
    case 'IF_ENERGY_GTE':
      return preEnergy >= threshold;
    case 'IF_ENERGY_LTE':
      return preEnergy <= threshold;
  }
}

function stepLocation(stepNumber: 1 | 2 | 3): CombinatorFailureLocation {
  if (stepNumber === 1) {
    return 'STEP 1';
  }
  if (stepNumber === 2) {
    return 'STEP 2';
  }
  return 'STEP 3';
}

export function stepCombinatorOnce(
  stage: CombinatorStageDefinition,
  pre: CombinatorCurrentParams,
  mod: CombinatorModule,
  stepNumber: 1 | 2 | 3,
): CombinatorStepFrame {
  const conditionMet = evaluateCombinatorCondition(
    mod.condition,
    pre.energy,
    pre.output,
    pre.sideEffect,
  );

  const nextEnergy = pre.energy + mod.energyDelta;
  if (nextEnergy < 0) {
    const loc = stepLocation(stepNumber);
    return {
      stepNumber,
      moduleId: mod.id,
      conditionMet,
      shieldConsumed: false,
      paramsAfter: {
        energy: nextEnergy,
        output: pre.output,
        sideEffect: pre.sideEffect,
        shieldActive: pre.shieldActive,
        score: null,
      },
      crashedDebugLog: {
        location: loc,
        reason: 'ENERGY_DEPLETED',
        expectedValue: 0,
        actualValue: nextEnergy,
        expectedText: {
          ja: 'ENERGY >= 0',
          en: 'ENERGY >= 0',
        },
        actualText: {
          ja: `ENERGY = ${String(nextEnergy)}`,
          en: `ENERGY = ${String(nextEnergy)}`,
        },
      },
    };
  }

  let effSideDelta = mod.sideEffectDelta;
  let nextShieldActive = pre.shieldActive;
  let shieldConsumed = false;
  if (mod.sideEffectDelta > 0 && pre.shieldActive) {
    effSideDelta = 0;
    nextShieldActive = false;
    shieldConsumed = true;
  }
  const nextSideEffect = Math.max(0, pre.sideEffect + effSideDelta);

  if (nextSideEffect > stage.overloadLimit) {
    const loc = stepLocation(stepNumber);
    return {
      stepNumber,
      moduleId: mod.id,
      conditionMet,
      shieldConsumed,
      paramsAfter: {
        energy: nextEnergy,
        output: pre.output,
        sideEffect: nextSideEffect,
        shieldActive: nextShieldActive,
        score: null,
      },
      crashedDebugLog: {
        location: loc,
        reason: 'OVERLOAD_EXCEEDED',
        expectedValue: stage.overloadLimit,
        actualValue: nextSideEffect,
        expectedText: {
          ja: `HEAT <= ${String(stage.overloadLimit)}`,
          en: `HEAT <= ${String(stage.overloadLimit)}`,
        },
        actualText: {
          ja: `HEAT = ${String(nextSideEffect)}`,
          en: `HEAT = ${String(nextSideEffect)}`,
        },
      },
    };
  }

  let nextOutput = pre.output;
  if (conditionMet) {
    switch (mod.effect.op) {
      case 'ADD':
        nextOutput = pre.output + mod.effect.value;
        break;
      case 'MUL':
        nextOutput = pre.output * mod.effect.value;
        break;
      case 'HEAT_TO_OUT':
        nextOutput = pre.output + pre.sideEffect * mod.effect.value;
        break;
      case 'ENERGY_TO_OUT':
        nextOutput = pre.output + pre.energy * mod.effect.value;
        break;
      case 'ADD_SHIELD':
        nextOutput = pre.output + mod.effect.value;
        nextShieldActive = true;
        break;
    }
  }

  return {
    stepNumber,
    moduleId: mod.id,
    conditionMet,
    shieldConsumed,
    paramsAfter: {
      energy: nextEnergy,
      output: nextOutput,
      sideEffect: nextSideEffect,
      shieldActive: nextShieldActive,
      score: null,
    },
    crashedDebugLog: null,
  };
}

export function evaluateCombinatorSequence(
  stage: CombinatorStageDefinition,
  moduleIds: readonly [string, string, string],
): CombinatorEvaluationResult {
  const initialMeta = extractInitialParamsMeta(stage);
  let current = createInitialCombinatorParams(stage);
  const frames: CombinatorStepFrame[] = [];
  let usedSideEffectOrIf = false;

  const stepNums: readonly [1, 2, 3] = [1, 2, 3];
  for (let idx = 0; idx < 3; idx += 1) {
    const stepNum = stepNums[idx]!;
    const modId = moduleIds[idx]!;
    const mod = stage.modules.find((m) => m.id === modId);
    if (!mod) {
      throw new Error(`Unknown combinator module id "${modId}" in stage ${String(stage.stageId)}`);
    }

    const frame = stepCombinatorOnce(stage, current, mod, stepNum);
    frames.push(frame);
    current = frame.paramsAfter;

    if (
      (mod.condition.type !== 'ALWAYS' && frame.conditionMet) ||
      (mod.effect.op === 'HEAT_TO_OUT' && frame.conditionMet) ||
      mod.sideEffectDelta < 0 ||
      frame.shieldConsumed ||
      (mod.effect.op === 'ADD_SHIELD' && frame.conditionMet)
    ) {
      usedSideEffectOrIf = true;
    }

    if (frame.crashedDebugLog) {
      return {
        status: 'CRASHED',
        finalStepIndex: stepNum,
        initialParams: initialMeta,
        finalParams: current,
        frames,
        score: null,
        debugLog: frame.crashedDebugLog,
        usedSideEffectOrIf,
      };
    }
  }

  if (current.output >= stage.targetOutput) {
    const score = Math.max(
      500,
      1000 + current.output * 10 + current.energy * 25 - current.sideEffect * 15,
    );
    const clearedParams: CombinatorCurrentParams = {
      ...current,
      score,
    };
    return {
      status: 'STAGE CLEAR',
      finalStepIndex: 3,
      initialParams: initialMeta,
      finalParams: clearedParams,
      frames,
      score,
      debugLog: null,
      usedSideEffectOrIf,
    };
  }

  const failedLog: CombinatorDebugLog = {
    location: 'FINAL CHECK',
    reason: 'TARGET_UNMET',
    expectedValue: stage.targetOutput,
    actualValue: current.output,
    expectedText: {
      ja: `OUTPUT >= ${String(stage.targetOutput)}`,
      en: `OUTPUT >= ${String(stage.targetOutput)}`,
    },
    actualText: {
      ja: `OUTPUT = ${String(current.output)}`,
      en: `OUTPUT = ${String(current.output)}`,
    },
  };

  return {
    status: 'FAILED',
    finalStepIndex: 3,
    initialParams: initialMeta,
    finalParams: current,
    frames,
    score: null,
    debugLog: failedLog,
    usedSideEffectOrIf,
  };
}
