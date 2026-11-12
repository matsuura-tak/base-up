import { t } from '../i18n/dictionary';
import type {
  DiagnosticAxisScores,
  DiagnosticProfile,
  OverallRank,
  PersistedArcadeStateV1,
} from './types';

function clampScore(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

export function resolveRankFromScore(overallScore: number): OverallRank {
  if (overallScore >= 90) {
    return 'S+';
  }
  if (overallScore >= 80) {
    return 'S';
  }
  if (overallScore >= 65) {
    return 'A';
  }
  if (overallScore >= 50) {
    return 'B';
  }
  return 'C';
}

export function computeDiagnosticProfile(state: PersistedArcadeStateV1): DiagnosticProfile {
  const combinatorClearedRecords = Object.values(state.combinatorStages).filter(
    (rec) => rec.cleared && rec.stageId >= 1 && rec.stageId <= 10,
  );
  const fermiClearedRecords = Object.values(state.fermiStages).filter(
    (rec) => rec.cleared && rec.stageId >= 1 && rec.stageId <= 9,
  );

  const c1 = Math.min(10, combinatorClearedRecords.length);
  const c2 = Math.min(9, fermiClearedRecords.length);

  let specComprehension = 0;
  let sequenceDesign = 0;
  let resourceControl = 0;

  if (c1 >= 1) {
    const firstTryClears = combinatorClearedRecords.filter(
      (rec) => rec.runAttemptsBeforeFirstClear === 1,
    ).length;
    specComprehension = clampScore(40 * (c1 / 10) + 60 * (firstTryClears / c1));

    const sumEfficiency = combinatorClearedRecords.reduce((acc, rec) => {
      const attempts = Math.max(1, rec.runAttemptsBeforeFirstClear ?? 1);
      const eff = Math.max(0, 1 - 0.25 * (attempts - 1));
      return acc + eff;
    }, 0);
    const avgEfficiency = sumEfficiency / c1;
    sequenceDesign = clampScore(30 * (c1 / 10) + 70 * avgEfficiency);

    const r1 = Math.max(1, state.combinatorTotalRuns);
    const k1 = Math.max(0, Math.min(r1, state.combinatorCrashedRuns));
    resourceControl = clampScore(30 * (c1 / 10) + 70 * (1 - k1 / r1));
  }

  let fermiSense = 0;
  let hypothesisPrecision = 0;

  if (c2 >= 1) {
    const sumQuality = fermiClearedRecords.reduce((acc, rec) => {
      const q = rec.bestJudgment === 'PERFECT_ORDER' ? 1.0 : 0.6;
      return acc + q;
    }, 0);
    const avgQuality = sumQuality / c2;
    fermiSense = clampScore(30 * (c2 / 9) + 70 * avgQuality);

    const f2 = Math.max(1, state.fermiTotalFires);
    const t2 = Math.max(0, Math.min(f2, state.fermiTrapFires));
    hypothesisPrecision = clampScore(30 * (c2 / 9) + 70 * (1 - t2 / f2));
  }

  const axes: DiagnosticAxisScores = {
    specComprehension,
    sequenceDesign,
    resourceControl,
    fermiSense,
    hypothesisPrecision,
  };

  const rankUnlocked = c1 >= 1 && c2 >= 1;
  let overallScore: number | null = null;
  let overallRank: OverallRank = 'UNRANKED';

  if (rankUnlocked) {
    overallScore = clampScore(
      (specComprehension +
        sequenceDesign +
        resourceControl +
        fermiSense +
        hypothesisPrecision) /
        5,
    );
    overallRank = resolveRankFromScore(overallScore);
  }

  const displayOverall = overallScore === null ? 0 : overallScore;
  const templateParams = {
    rank: overallRank,
    overall: displayOverall,
    s1: specComprehension,
    s2: sequenceDesign,
    s3: resourceControl,
    s4: fermiSense,
    s5: hypothesisPrecision,
  };

  return {
    combinatorClearedCount: c1,
    fermiClearedCount: c2,
    rankUnlocked,
    overallScore,
    overallRank,
    axes,
    shareSummaryText: {
      ja: t('ja', 'diagnostic.share.template', templateParams),
      en: t('en', 'diagnostic.share.template', templateParams),
    },
  };
}
