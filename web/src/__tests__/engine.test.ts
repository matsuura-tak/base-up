import { describe, expect, it } from 'vitest';
import {
  createInitialCombinatorParams,
  evaluateCombinatorCondition,
  evaluateCombinatorSequence,
  stepCombinatorOnce,
} from '../domain/combinatorEngine';
import { getCombinatorStage } from '../domain/combinatorStages';
import {
  evaluateFermiSelection,
  formatFermiCompactValue,
  formatSignedLogError,
} from '../domain/fermiEngine';
import { getFermiStage } from '../domain/fermiStages';

describe('Combinator & Fermi simulation engines', () => {
  it('evaluates all 6 Combinator condition operators accurately', () => {
    expect(
      evaluateCombinatorCondition(
        { type: 'ALWAYS', threshold: null, label: { ja: 'a', en: 'a' } },
        5,
        10,
        3,
      ),
    ).toBe(true);
    expect(
      evaluateCombinatorCondition(
        { type: 'IF_OUTPUT_GTE', threshold: 10, label: { ja: 'a', en: 'a' } },
        5,
        10,
        3,
      ),
    ).toBe(true);
    expect(
      evaluateCombinatorCondition(
        { type: 'IF_OUTPUT_GTE', threshold: 11, label: { ja: 'a', en: 'a' } },
        5,
        10,
        3,
      ),
    ).toBe(false);
    expect(
      evaluateCombinatorCondition(
        { type: 'IF_HEAT_GTE', threshold: 3, label: { ja: 'a', en: 'a' } },
        5,
        10,
        3,
      ),
    ).toBe(true);
    expect(
      evaluateCombinatorCondition(
        { type: 'IF_HEAT_LTE', threshold: 2, label: { ja: 'a', en: 'a' } },
        5,
        10,
        3,
      ),
    ).toBe(false);
    expect(
      evaluateCombinatorCondition(
        { type: 'IF_ENERGY_GTE', threshold: 5, label: { ja: 'a', en: 'a' } },
        5,
        10,
        3,
      ),
    ).toBe(true);
    expect(
      evaluateCombinatorCondition(
        { type: 'IF_ENERGY_LTE', threshold: 4, label: { ja: 'a', en: 'a' } },
        5,
        10,
        3,
      ),
    ).toBe(false);
  });

  it('absorbs positive sideEffectDelta once when shieldActive is enabled (Stage 4)', () => {
    const stage4 = getCombinatorStage(4);
    const res = evaluateCombinatorSequence(stage4, ['s4-init', 's4-guard', 's4-nova']);
    expect(res.status).toBe('STAGE CLEAR');
    expect(res.frames).toHaveLength(3);
    expect(res.frames[1]?.paramsAfter.shieldActive).toBe(true);
    expect(res.frames[2]?.shieldConsumed).toBe(true);
    expect(res.frames[2]?.paramsAfter.shieldActive).toBe(false);
    expect(res.finalParams.sideEffect).toBe(6);
    expect(res.score).toBe(1330);
  });

  it('halts immediately at STEP 1 on energy depletion without evaluating later modules', () => {
    const stage2 = getCombinatorStage(2);
    const res = evaluateCombinatorSequence(stage2, ['s2-tri', 's2-cell', 's2-patch']);
    expect(res.status).toBe('CRASHED');
    expect(res.finalStepIndex).toBe(1);
    expect(res.frames).toHaveLength(1);
    expect(res.debugLog?.location).toBe('STEP 1');
    expect(res.debugLog?.reason).toBe('ENERGY_DEPLETED');
    expect(res.debugLog?.expectedValue).toBe(0);
    expect(res.debugLog?.actualValue).toBe(-1);
  });

  it('records OVERLOAD_EXCEEDED and TARGET_UNMET debug logs accurately', () => {
    const stage2 = getCombinatorStage(2);
    const crashed = evaluateCombinatorSequence(stage2, ['s2-cell', 's2-boost', 's2-burn']);
    expect(crashed.status).toBe('CRASHED');
    expect(crashed.debugLog?.location).toBe('STEP 3');
    expect(crashed.debugLog?.reason).toBe('OVERLOAD_EXCEEDED');
    expect(crashed.debugLog?.expectedValue).toBe(12);
    expect(crashed.debugLog?.actualValue).toBe(14);

    const failed = evaluateCombinatorSequence(stage2, ['s2-cell', 's2-boost', 's2-patch']);
    expect(failed.status).toBe('FAILED');
    expect(failed.debugLog?.location).toBe('FINAL CHECK');
    expect(failed.debugLog?.reason).toBe('TARGET_UNMET');
    expect(failed.debugLog?.expectedValue).toBe(30);
    expect(failed.debugLog?.actualValue).toBe(15);
  });

  it('supports single-step inspection via stepCombinatorOnce', () => {
    const stage1 = getCombinatorStage(1);
    const init = createInitialCombinatorParams(stage1);
    const mod1 = stage1.modules[0]!;
    const frame1 = stepCombinatorOnce(stage1, init, mod1, 1);
    expect(frame1.crashedDebugLog).toBeNull();
    expect(frame1.paramsAfter).toEqual({
      energy: 7,
      output: 6,
      sideEffect: 2,
      shieldActive: false,
      score: null,
    });
  });

  it('classifies all 4 Fermi judgments including trap downgrade to GOOD RANGE', () => {
    const stage1 = getFermiStage(1);

    const perfect = evaluateFermiSelection(stage1, ['f1-a1-1', 'f1-a2-1', 'f1-a3-1']);
    expect(perfect.judgment).toBe('PERFECT ORDER');
    expect(perfect.trapTriggeredCount).toBe(0);
    expect(perfect.explanation.showRetryHint).toBe(false);

    const goodViaTrap = evaluateFermiSelection(stage1, ['f1-a1-1', 'f1-a2-3', 'f1-a3-2']);
    expect(Math.abs(goodViaTrap.logError)).toBeLessThanOrEqual(0.5);
    expect(goodViaTrap.trapTriggeredCount).toBe(1);
    expect(goodViaTrap.judgment).toBe('GOOD RANGE');
    expect(goodViaTrap.explanation.showRetryHint).toBe(false);

    const overkill = evaluateFermiSelection(stage1, ['f1-a1-1', 'f1-a2-1', 'f1-a3-2']);
    expect(overkill.judgment).toBe('OVERKILL');
    expect(overkill.explanation.showRetryHint).toBe(true);

    const under = evaluateFermiSelection(stage1, ['f1-a1-1', 'f1-a2-3', 'f1-a3-1']);
    expect(under.judgment).toBe('UNDERESTIMATE');
    expect(under.explanation.showRetryHint).toBe(true);
  });

  it('formats compact scientific values and signed log errors cleanly', () => {
    expect(formatFermiCompactValue(6.0e9, 'ja')).toContain('6 × 10^9');
    expect(formatFermiCompactValue(6.0e9, 'en')).toContain('6B');
    expect(formatSignedLogError(0.254)).toBe('+0.25');
    expect(formatSignedLogError(-1.128)).toBe('-1.13');
    expect(formatSignedLogError(0)).toBe('0.00');
  });
});
