import { describe, expect, it } from 'vitest';
import { computeDiagnosticProfile, resolveRankFromScore } from '../domain/diagnostic';
import type { CombinatorStageRecord, FermiStageRecord } from '../domain/types';
import { createDefaultPersistedState } from '../storage/safeStorage';

describe('Diagnostic 5-axis engine & rank thresholds (AC-10, AC-12)', () => {
  it('resolves exact boundary scores for C, B, A, S, and S+', () => {
    expect(resolveRankFromScore(0)).toBe('C');
    expect(resolveRankFromScore(49)).toBe('C');
    expect(resolveRankFromScore(50)).toBe('B');
    expect(resolveRankFromScore(64)).toBe('B');
    expect(resolveRankFromScore(65)).toBe('A');
    expect(resolveRankFromScore(79)).toBe('A');
    expect(resolveRankFromScore(80)).toBe('S');
    expect(resolveRankFromScore(89)).toBe('S');
    expect(resolveRankFromScore(90)).toBe('S+');
    expect(resolveRankFromScore(100)).toBe('S+');
  });

  it('returns UNRANKED with all 0 axes on empty and failed-only histories', () => {
    const emptyProfile = computeDiagnosticProfile(createDefaultPersistedState(null));
    expect(emptyProfile.rankUnlocked).toBe(false);
    expect(emptyProfile.overallRank).toBe('UNRANKED');
    expect(emptyProfile.overallScore).toBeNull();
    expect(emptyProfile.axes).toEqual({
      specComprehension: 0,
      sequenceDesign: 0,
      resourceControl: 0,
      fermiSense: 0,
      hypothesisPrecision: 0,
    });

    const failedOnly = createDefaultPersistedState(1000);
    failedOnly.combinatorTotalRuns = 3;
    failedOnly.combinatorCrashedRuns = 2;
    failedOnly.combinatorStages['1'] = {
      stageId: 1,
      cleared: false,
      runAttemptsBeforeFirstClear: null,
      totalRunAttempts: 3,
      bestScore: null,
    };
    failedOnly.fermiTotalFires = 2;
    failedOnly.fermiTrapFires = 1;
    failedOnly.fermiStages['1'] = {
      stageId: 1,
      cleared: false,
      bestJudgment: null,
      totalFireAttempts: 2,
    };

    const failedProfile = computeDiagnosticProfile(failedOnly);
    expect(failedProfile.overallRank).toBe('UNRANKED');
    expect(failedProfile.axes).toEqual({
      specComprehension: 0,
      sequenceDesign: 0,
      resourceControl: 0,
      fermiSense: 0,
      hypothesisPrecision: 0,
    });
  });

  it('keeps UNRANKED while calculating cleared-mode axes when only one mode is cleared', () => {
    const combOnly = createDefaultPersistedState(1000);
    combOnly.combinatorTotalRuns = 2;
    combOnly.combinatorStages['1'] = {
      stageId: 1,
      cleared: true,
      runAttemptsBeforeFirstClear: 1,
      totalRunAttempts: 1,
      bestScore: 1105,
    };
    combOnly.combinatorStages['2'] = {
      stageId: 2,
      cleared: true,
      runAttemptsBeforeFirstClear: 1,
      totalRunAttempts: 1,
      bestScore: 1150,
    };
    const p1 = computeDiagnosticProfile(combOnly);
    expect(p1.overallRank).toBe('UNRANKED');
    expect(p1.axes).toEqual({
      specComprehension: 68,
      sequenceDesign: 76,
      resourceControl: 76,
      fermiSense: 0,
      hypothesisPrecision: 0,
    });

    const fermiOnly = createDefaultPersistedState(1000);
    fermiOnly.fermiTotalFires = 3;
    for (const s of [1, 2, 3]) {
      fermiOnly.fermiStages[String(s)] = {
        stageId: s,
        cleared: true,
        bestJudgment: 'PERFECT_ORDER',
        totalFireAttempts: 1,
      };
    }
    const p2 = computeDiagnosticProfile(fermiOnly);
    expect(p2.overallRank).toBe('UNRANKED');
    expect(p2.axes).toEqual({
      specComprehension: 0,
      sequenceDesign: 0,
      resourceControl: 0,
      fermiSense: 80,
      hypothesisPrecision: 80,
    });
  });

  it('computes exact integer scores, rank A (71), and S+ (100) when both modes are cleared', () => {
    const rankAState = createDefaultPersistedState(1000);
    rankAState.combinatorTotalRuns = 2;
    rankAState.combinatorCrashedRuns = 0;
    rankAState.combinatorStages['1'] = {
      stageId: 1,
      cleared: true,
      runAttemptsBeforeFirstClear: 1,
      totalRunAttempts: 2,
      bestScore: 1105,
    };
    rankAState.fermiTotalFires = 1;
    rankAState.fermiTrapFires = 0;
    rankAState.fermiStages['1'] = {
      stageId: 1,
      cleared: true,
      bestJudgment: 'PERFECT_ORDER',
      totalFireAttempts: 1,
    };

    const profileA = computeDiagnosticProfile(rankAState);
    expect(profileA.rankUnlocked).toBe(true);
    expect(profileA.axes).toEqual({
      specComprehension: 64,
      sequenceDesign: 73,
      resourceControl: 73,
      fermiSense: 73,
      hypothesisPrecision: 73,
    });
    expect(profileA.overallScore).toBe(71);
    expect(profileA.overallRank).toBe('A');
    expect(profileA.shareSummaryText.ja).toContain('A');
    expect(profileA.shareSummaryText.ja).toContain('71');
    expect(profileA.shareSummaryText.en).toContain('Overall Rank: A');

    const combinatorAll: Record<string, CombinatorStageRecord> = {};
    for (let s = 1; s <= 10; s += 1) {
      combinatorAll[String(s)] = {
        stageId: s,
        cleared: true,
        runAttemptsBeforeFirstClear: 1,
        totalRunAttempts: 1,
        bestScore: 1500,
      };
    }
    const fermiAll: Record<string, FermiStageRecord> = {};
    for (let s = 1; s <= 9; s += 1) {
      fermiAll[String(s)] = {
        stageId: s,
        cleared: true,
        bestJudgment: 'PERFECT_ORDER',
        totalFireAttempts: 1,
      };
    }
    const perfectState = {
      ...createDefaultPersistedState(1000),
      combinatorTotalRuns: 10,
      combinatorStages: combinatorAll,
      fermiTotalFires: 9,
      fermiStages: fermiAll,
    };
    const profileSPlus = computeDiagnosticProfile(perfectState);
    expect(profileSPlus.overallScore).toBe(100);
    expect(profileSPlus.overallRank).toBe('S+');
  });
});
