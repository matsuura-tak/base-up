import { describe, expect, it } from 'vitest';
import { evaluateCombinatorSequence } from '../domain/combinatorEngine';
import { COMBINATOR_STAGES } from '../domain/combinatorStages';
import { evaluateFermiSelection } from '../domain/fermiEngine';
import { FERMI_STAGES } from '../domain/fermiStages';
import { auditAllStages } from '../domain/solver';

const EXPECTED_COMBINATOR_SCORES: readonly number[] = [
  1105, 1150, 1195, 1330, 1450, 1345, 1380, 1525, 1555, 1930,
];

describe('auditAllStages exhaustive solver (AC-4 & AC-19)', () => {
  it('passes AC-4 across all 10 Combinator stages including non-trivial stages 8..10', () => {
    const report = auditAllStages();
    expect(report.allPassed).toBe(true);
    expect(report.combinatorStages).toHaveLength(10);

    for (let idx = 0; idx < 10; idx += 1) {
      const entry = report.combinatorStages[idx]!;
      const stageDef = COMBINATOR_STAGES[idx]!;

      expect(entry.stageId).toBe(idx + 1);
      expect(entry.moduleCount).toBe(stageDef.modules.length);
      expect(entry.moduleCount).toBeGreaterThanOrEqual(5);
      expect(entry.moduleCount).toBeLessThanOrEqual(7);

      const expectedPermutations =
        entry.moduleCount * (entry.moduleCount - 1) * (entry.moduleCount - 2);
      expect(entry.totalPermutations).toBe(expectedPermutations);
      expect(entry.clearCount).toBeGreaterThanOrEqual(1);
      expect(entry.clearRatio).toBeGreaterThan(0);
      expect(entry.clearRatio).toBeLessThanOrEqual(0.5);
      expect(entry.passesAc4).toBe(true);

      if (entry.stageId >= 8) {
        expect(entry.clearsWithoutSideEffectOrIf).toBe(0);
      }

      const [c0, c1, c2] = entry.representativeClearSequence;
      expect(c0).toBeTruthy();
      expect(c1).toBeTruthy();
      expect(c2).toBeTruthy();
      const clearEval = evaluateCombinatorSequence(stageDef, [c0!, c1!, c2!]);
      expect(clearEval.status).toBe('STAGE CLEAR');
      expect(clearEval.score).toBe(EXPECTED_COMBINATOR_SCORES[idx]);

      const [k0, k1, k2] = entry.representativeCrashSequence;
      const crashEval = evaluateCombinatorSequence(stageDef, [k0!, k1!, k2!]);
      expect(crashEval.status).toBe('CRASHED');

      const [f0, f1, f2] = entry.representativeFailedSequence;
      const failEval = evaluateCombinatorSequence(stageDef, [f0!, f1!, f2!]);
      expect(failEval.status).toBe('FAILED');
    }
  });

  it('passes AC-19 across all 9 Fermi stages (3 beginner, 3 intermediate, 3 advanced)', () => {
    const report = auditAllStages();
    expect(report.fermiStages).toHaveLength(9);

    const beginnerCount = report.fermiStages.filter((s) => s.tier === 'beginner').length;
    const intermediateCount = report.fermiStages.filter((s) => s.tier === 'intermediate').length;
    const advancedCount = report.fermiStages.filter((s) => s.tier === 'advanced').length;
    expect(beginnerCount).toBe(3);
    expect(intermediateCount).toBe(3);
    expect(advancedCount).toBe(3);

    for (let idx = 0; idx < 9; idx += 1) {
      const entry = report.fermiStages[idx]!;
      const stageDef = FERMI_STAGES[idx]!;

      expect(entry.stageId).toBe(idx + 1);
      expect(entry.totalCombinations).toBeGreaterThanOrEqual(27);
      expect(entry.totalCombinations).toBeLessThanOrEqual(64);
      expect(entry.perfectOrderCount).toBeGreaterThanOrEqual(1);
      expect(entry.perfectOrderRatio).toBeGreaterThan(0);
      expect(entry.perfectOrderRatio).toBeLessThanOrEqual(0.5);
      expect(entry.trapCardCount).toBeGreaterThanOrEqual(1);
      expect(entry.passesAc19).toBe(true);

      const [p0, p1, p2] = entry.representativePerfectCards;
      expect(evaluateFermiSelection(stageDef, [p0!, p1!, p2!]).judgment).toBe('PERFECT ORDER');

      if (entry.representativeGoodCards) {
        const [g0, g1, g2] = entry.representativeGoodCards;
        expect(evaluateFermiSelection(stageDef, [g0!, g1!, g2!]).judgment).toBe('GOOD RANGE');
      }

      const [o0, o1, o2] = entry.representativeOverkillCards;
      expect(evaluateFermiSelection(stageDef, [o0!, o1!, o2!]).judgment).toBe('OVERKILL');

      const [u0, u1, u2] = entry.representativeUnderestimateCards;
      expect(evaluateFermiSelection(stageDef, [u0!, u1!, u2!]).judgment).toBe('UNDERESTIMATE');
    }
  });
});
