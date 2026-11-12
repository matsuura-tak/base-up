import { evaluateCombinatorSequence } from './combinatorEngine';
import { COMBINATOR_STAGES } from './combinatorStages';
import { evaluateFermiSelection } from './fermiEngine';
import { FERMI_STAGES } from './fermiStages';
import type {
  CombinatorStageAuditEntry,
  FermiStageAuditEntry,
  StageAuditReport,
} from './types';

function toTotalPermutations(count: number): 60 | 120 | 210 {
  if (count === 60 || count === 120 || count === 210) {
    return count;
  }
  throw new Error(`Unexpected permutation count ${String(count)}`);
}

let cachedAuditReport: StageAuditReport | null = null;

export function auditAllStages(): StageAuditReport {
  if (cachedAuditReport) {
    return {
      allPassed: cachedAuditReport.allPassed,
      combinatorStages: cachedAuditReport.combinatorStages.map((entry) => ({
        ...entry,
        representativeClearSequence: [...entry.representativeClearSequence],
        representativeCrashSequence: [...entry.representativeCrashSequence],
        representativeFailedSequence: [...entry.representativeFailedSequence],
      })),
      fermiStages: cachedAuditReport.fermiStages.map((entry) => ({
        ...entry,
        representativePerfectCards: [...entry.representativePerfectCards],
        representativeGoodCards: entry.representativeGoodCards
          ? [...entry.representativeGoodCards]
          : null,
        representativeOverkillCards: [...entry.representativeOverkillCards],
        representativeUnderestimateCards: [...entry.representativeUnderestimateCards],
      })),
    };
  }

  const combinatorAudit: CombinatorStageAuditEntry[] = [];

  for (const stage of COMBINATOR_STAGES) {
    const mods = stage.modules;
    const n = mods.length;
    let totalCount = 0;
    let clearCount = 0;
    let clearsWithoutSideEffectOrIf = 0;

    let repClear: [string, string, string] | null = null;
    let repCrash: [string, string, string] | null = null;
    let repFailed: [string, string, string] | null = null;

    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        if (j === i) {
          continue;
        }
        for (let k = 0; k < n; k += 1) {
          if (k === i || k === j) {
            continue;
          }
          const seq: [string, string, string] = [
            mods[i]!.id,
            mods[j]!.id,
            mods[k]!.id,
          ];
          totalCount += 1;
          const res = evaluateCombinatorSequence(stage, seq);
          if (res.status === 'STAGE CLEAR') {
            clearCount += 1;
            if (!res.usedSideEffectOrIf) {
              clearsWithoutSideEffectOrIf += 1;
            }
            if (!repClear) {
              repClear = seq;
            }
          } else if (res.status === 'CRASHED') {
            if (!repCrash) {
              repCrash = seq;
            }
          } else {
            if (!repFailed) {
              repFailed = seq;
            }
          }
        }
      }
    }

    const totalPermutations = toTotalPermutations(totalCount);
    const clearRatio = clearCount / totalPermutations;
    const highStageRuleOk = stage.stageId < 8 || clearsWithoutSideEffectOrIf === 0;
    const passesAc4 =
      n >= 5 &&
      n <= 7 &&
      clearCount >= 1 &&
      clearRatio > 0 &&
      clearRatio <= 0.5 &&
      highStageRuleOk &&
      repClear !== null &&
      repCrash !== null &&
      repFailed !== null;

    combinatorAudit.push({
      stageId: stage.stageId,
      moduleCount: n,
      totalPermutations,
      clearCount,
      clearRatio,
      clearsWithoutSideEffectOrIf,
      representativeClearSequence: repClear ?? [mods[0]!.id, mods[1]!.id, mods[2]!.id],
      representativeCrashSequence: repCrash ?? [mods[0]!.id, mods[1]!.id, mods[2]!.id],
      representativeFailedSequence: repFailed ?? [mods[0]!.id, mods[1]!.id, mods[2]!.id],
      passesAc4,
    });
  }

  const fermiAudit: FermiStageAuditEntry[] = [];

  for (const stage of FERMI_STAGES) {
    const cards1 = stage.slots[0]?.cards ?? [];
    const cards2 = stage.slots[1]?.cards ?? [];
    const cards3 = stage.slots[2]?.cards ?? [];

    let totalCombinations = 0;
    let perfectOrderCount = 0;
    let goodRangeCount = 0;

    let repPerfect: [string, string, string] | null = null;
    let repGood: [string, string, string] | null = null;
    let repOverkill: [string, string, string] | null = null;
    let repUnderestimate: [string, string, string] | null = null;

    for (const c1 of cards1) {
      for (const c2 of cards2) {
        for (const c3 of cards3) {
          const combo: [string, string, string] = [c1.id, c2.id, c3.id];
          totalCombinations += 1;
          const res = evaluateFermiSelection(stage, combo);
          switch (res.judgment) {
            case 'PERFECT ORDER':
              perfectOrderCount += 1;
              if (!repPerfect) {
                repPerfect = combo;
              }
              break;
            case 'GOOD RANGE':
              goodRangeCount += 1;
              if (!repGood) {
                repGood = combo;
              }
              break;
            case 'OVERKILL':
              if (!repOverkill) {
                repOverkill = combo;
              }
              break;
            case 'UNDERESTIMATE':
              if (!repUnderestimate) {
                repUnderestimate = combo;
              }
              break;
          }
        }
      }
    }

    const trapCardCount = stage.slots.reduce(
      (acc, s) => acc + s.cards.filter((c) => c.isTrap).length,
      0,
    );
    const perfectOrderRatio = perfectOrderCount / totalCombinations;
    const passesAc19 =
      perfectOrderCount >= 1 &&
      perfectOrderRatio > 0 &&
      perfectOrderRatio <= 0.5 &&
      trapCardCount >= 1 &&
      repPerfect !== null &&
      repOverkill !== null &&
      repUnderestimate !== null;

    const fallbackCombo: [string, string, string] = [
      cards1[0]!.id,
      cards2[0]!.id,
      cards3[0]!.id,
    ];

    fermiAudit.push({
      stageId: stage.stageId,
      tier: stage.tier,
      totalCombinations,
      perfectOrderCount,
      perfectOrderRatio,
      goodRangeCount,
      trapCardCount,
      representativePerfectCards: repPerfect ?? fallbackCombo,
      representativeGoodCards: repGood,
      representativeOverkillCards: repOverkill ?? fallbackCombo,
      representativeUnderestimateCards: repUnderestimate ?? fallbackCombo,
      passesAc19,
    });
  }

  const allPassed =
    combinatorAudit.length === 10 &&
    fermiAudit.length === 9 &&
    combinatorAudit.every((e) => e.passesAc4) &&
    fermiAudit.every((e) => e.passesAc19);

  cachedAuditReport = {
    allPassed,
    combinatorStages: combinatorAudit,
    fermiStages: fermiAudit,
  };

  return auditAllStages();
}
