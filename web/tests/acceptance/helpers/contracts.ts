export type Locale = 'ja' | 'en';

export interface LocalizedText {
  ja: string;
  en: string;
}

export type RouteId = 'lobby' | 'combinator' | 'fermi' | 'diagnostic' | 'notFound';

export type OverallRank = 'UNRANKED' | 'C' | 'B' | 'A' | 'S' | 'S+';

export interface CombinatorStageRecord {
  stageId: number;
  cleared: boolean;
  runAttemptsBeforeFirstClear: number | null;
  totalRunAttempts: number;
  bestScore: number | null;
}

export type FermiBestJudgment = 'PERFECT_ORDER' | 'GOOD_RANGE';

export interface FermiStageRecord {
  stageId: number;
  cleared: boolean;
  bestJudgment: FermiBestJudgment | null;
  totalFireAttempts: number;
}

export interface PersistedArcadeStateV1 {
  schemaVersion: 1;
  locale: Locale;
  soundEnabled: boolean;
  firstVisitedAtMs: number | null;
  firstEverClearedAtMs: number | null;
  hasRecorded7dReturnPlay: boolean;
  combinatorTotalRuns: number;
  combinatorCrashedRuns: number;
  combinatorStages: Record<string, CombinatorStageRecord>;
  fermiTotalFires: number;
  fermiTrapFires: number;
  fermiStages: Record<string, FermiStageRecord>;
}

export interface CombinatorInitialParams {
  energy: number;
  output: number;
  sideEffect: number;
  overloadLimit: number;
  targetOutput: number;
}

export interface CombinatorCurrentParams {
  energy: number;
  output: number;
  sideEffect: number;
  shieldActive: boolean;
  score: number | null;
}

export interface FermiSimulationParams {
  baselineValue: number;
  estimateValue: number | null;
  logError: number | null;
  trapTriggeredCount: number;
}

export interface CombinatorDebugLog {
  location: 'STEP 1' | 'STEP 2' | 'STEP 3' | 'FINAL CHECK';
  reason: 'ENERGY_DEPLETED' | 'OVERLOAD_EXCEEDED' | 'TARGET_UNMET';
  expectedValue: number;
  actualValue: number;
  expectedText: LocalizedText;
  actualText: LocalizedText;
}

export interface FermiTrapNote {
  cardId: string;
  actIndex: number;
  cardLabel: LocalizedText;
  reason: LocalizedText;
  triggeredInCurrentRun: boolean;
}

export type FermiJudgment = 'PERFECT ORDER' | 'GOOD RANGE' | 'OVERKILL' | 'UNDERESTIMATE';

export interface FermiExplanation {
  estimateValue: number;
  baselineValue: number;
  logError: number;
  judgment: FermiJudgment;
  trapTriggeredCount: number;
  baselineFormula: LocalizedText;
  baselineBreakdownText: LocalizedText;
  trapNotes: FermiTrapNote[];
}

export interface SimulationSnapshot {
  activeMode: 'combinator' | 'fermi' | null;
  stageId: number | null;
  status:
    | 'IDLE'
    | 'STEPPING'
    | 'RUNNING'
    | 'STAGE CLEAR'
    | 'CRASHED'
    | 'FAILED'
    | 'PERFECT ORDER'
    | 'GOOD RANGE'
    | 'OVERKILL'
    | 'UNDERESTIMATE';
  stepIndex: number;
  assignedSlots: Array<string | null>;
  unassignedSlotNames: string[];
  initialParams: CombinatorInitialParams | null;
  currentParams: CombinatorCurrentParams | null;
  fermiParams: FermiSimulationParams | null;
  officialAttemptCount: number;
  stageAttemptCount: number;
  currentShakeOffsetPx: number;
  maxShakeOffsetPx: number;
  debugLog: CombinatorDebugLog | null;
  fermiExplanation: FermiExplanation | null;
}

export interface CombinatorStageAuditEntry {
  stageId: number;
  moduleCount: number;
  totalPermutations: 60 | 120 | 210;
  clearCount: number;
  clearRatio: number;
  clearsWithoutSideEffectOrIf: number;
  representativeClearSequence: [string, string, string];
  representativeCrashSequence: [string, string, string];
  representativeFailedSequence: [string, string, string];
  passesAc4: boolean;
}

export interface FermiStageAuditEntry {
  stageId: number;
  tier: 'beginner' | 'intermediate' | 'advanced';
  totalCombinations: number;
  perfectOrderCount: number;
  perfectOrderRatio: number;
  goodRangeCount: number;
  trapCardCount: number;
  representativePerfectCards: [string, string, string];
  representativeGoodCards: [string, string, string] | null;
  representativeOverkillCards: [string, string, string];
  representativeUnderestimateCards: [string, string, string];
  passesAc19: boolean;
}

export interface StageAuditReport {
  allPassed: boolean;
  combinatorStages: CombinatorStageAuditEntry[];
  fermiStages: FermiStageAuditEntry[];
}

export interface AudioStateSnapshot {
  soundEnabled: boolean;
  masterGainValue: number;
  audioContextInitialized: boolean;
  synthTriggerCount: number;
  autoPlayBeforeGestureCount: number;
}

export interface StorageStatus {
  storageAvailable: boolean;
  fallbackBannerVisible: boolean;
  persistedKey: 'logic_arcade_state_v1';
  recoveredFromCorruption: boolean;
}

export interface DiagnosticAxisScores {
  specComprehension: number;
  sequenceDesign: number;
  resourceControl: number;
  fermiSense: number;
  hypothesisPrecision: number;
}

export interface DiagnosticProfile {
  combinatorClearedCount: number;
  fermiClearedCount: number;
  rankUnlocked: boolean;
  overallScore: number | null;
  overallRank: OverallRank;
  axes: DiagnosticAxisScores;
  shareSummaryText: LocalizedText;
}

export interface TelemetryEvent {
  event: string;
  timestampMs: number;
  properties: Record<string, unknown>;
}

export interface ArcadeTestApi {
  getSimulationSnapshot(): SimulationSnapshot;
  auditAllStages(): StageAuditReport;
  getAudioState(): AudioStateSnapshot;
  getPersistedState(): PersistedArcadeStateV1;
  getStorageStatus(): StorageStatus;
  getDiagnosticProfile(): DiagnosticProfile;
  getEmittedEvents(): TelemetryEvent[];
}

declare global {
  interface Window {
    __ARCADE_TEST_API__?: ArcadeTestApi;
    __CAPTURED_CLIPBOARD_TEXT__?: string | null;
  }
}

export const PERSISTED_STORAGE_KEY = 'logic_arcade_state_v1' as const;

export function createPersistedStateSeed(
  overrides: Partial<PersistedArcadeStateV1> = {},
): PersistedArcadeStateV1 {
  return {
    schemaVersion: 1,
    locale: 'ja',
    soundEnabled: true,
    firstVisitedAtMs: 1731369600000,
    firstEverClearedAtMs: null,
    hasRecorded7dReturnPlay: false,
    combinatorTotalRuns: 0,
    combinatorCrashedRuns: 0,
    combinatorStages: {},
    fermiTotalFires: 0,
    fermiTrapFires: 0,
    fermiStages: {},
    ...overrides,
  };
}

export interface CombinatorStageExpectation {
  stageId: number;
  moduleCount: number;
  initialEnergy: number;
  initialOutput: number;
  initialSideEffect: number;
  overloadLimit: number;
  targetOutput: number;
  clearSeq: readonly [string, string, string];
  clearOutput: number;
  clearScore: number;
}

export const COMBINATOR_STAGE_EXPECTATIONS: readonly CombinatorStageExpectation[] = [
  {
    stageId: 1,
    moduleCount: 5,
    initialEnergy: 10,
    initialOutput: 0,
    initialSideEffect: 0,
    overloadLimit: 12,
    targetOutput: 24,
    clearSeq: ['s1-seed', 's1-amp2', 's1-amp2b'],
    clearOutput: 24,
    clearScore: 1105,
  },
  {
    stageId: 2,
    moduleCount: 5,
    initialEnergy: 6,
    initialOutput: 2,
    initialSideEffect: 0,
    overloadLimit: 12,
    targetOutput: 30,
    clearSeq: ['s2-cell', 's2-boost', 's2-tri'],
    clearOutput: 30,
    clearScore: 1150,
  },
  {
    stageId: 3,
    moduleCount: 5,
    initialEnergy: 10,
    initialOutput: 0,
    initialSideEffect: 4,
    overloadLimit: 10,
    targetOutput: 32,
    clearSeq: ['s3-core', 's3-cool', 's3-dup'],
    clearOutput: 32,
    clearScore: 1195,
  },
  {
    stageId: 4,
    moduleCount: 6,
    initialEnergy: 10,
    initialOutput: 0,
    initialSideEffect: 3,
    overloadLimit: 9,
    targetOutput: 40,
    clearSeq: ['s4-init', 's4-guard', 's4-nova'],
    clearOutput: 42,
    clearScore: 1330,
  },
  {
    stageId: 5,
    moduleCount: 6,
    initialEnergy: 10,
    initialOutput: 4,
    initialSideEffect: 0,
    overloadLimit: 10,
    targetOutput: 48,
    clearSeq: ['s5-add8', 's5-gate', 's5-trim'],
    clearOutput: 50,
    clearScore: 1450,
  },
  {
    stageId: 6,
    moduleCount: 6,
    initialEnergy: 9,
    initialOutput: 0,
    initialSideEffect: 6,
    overloadLimit: 10,
    targetOutput: 45,
    clearSeq: ['s6-chill', 's6-laser', 's6-double'],
    clearOutput: 48,
    clearScore: 1345,
  },
  {
    stageId: 7,
    moduleCount: 6,
    initialEnergy: 4,
    initialOutput: 0,
    initialSideEffect: 2,
    overloadLimit: 10,
    targetOutput: 48,
    clearSeq: ['s7-charge', 's7-dynamo', 's7-amp2'],
    clearOutput: 48,
    clearScore: 1380,
  },
  {
    stageId: 8,
    moduleCount: 7,
    initialEnergy: 10,
    initialOutput: 0,
    initialSideEffect: 2,
    overloadLimit: 10,
    targetOutput: 64,
    clearSeq: ['s8-ignite', 's8-thermo', 's8-amp2'],
    clearOutput: 66,
    clearScore: 1525,
  },
  {
    stageId: 9,
    moduleCount: 7,
    initialEnergy: 5,
    initialOutput: 0,
    initialSideEffect: 5,
    overloadLimit: 9,
    targetOutput: 66,
    clearSeq: ['s9-reactor', 's9-siphon', 's9-hyper'],
    clearOutput: 69,
    clearScore: 1555,
  },
  {
    stageId: 10,
    moduleCount: 7,
    initialEnergy: 8,
    initialOutput: 2,
    initialSideEffect: 4,
    overloadLimit: 10,
    targetOutput: 105,
    clearSeq: ['s10-stoke', 's10-reclaim', 's10-overdrive'],
    clearOutput: 108,
    clearScore: 1930,
  },
] as const;

export interface FermiStageExpectation {
  stageId: number;
  tier: 'beginner' | 'intermediate' | 'advanced';
  baselineValue: number;
  perfectChoices: readonly [number, number, number];
  goodChoices: readonly [number, number, number];
  overkillChoices: readonly [number, number, number];
  underestimateChoices: readonly [number, number, number];
}

export const FERMI_STAGE_EXPECTATIONS: readonly FermiStageExpectation[] = [
  {
    stageId: 1,
    tier: 'beginner',
    baselineValue: 6.0e9,
    perfectChoices: [1, 1, 1],
    goodChoices: [1, 3, 2],
    overkillChoices: [1, 1, 2],
    underestimateChoices: [1, 3, 1],
  },
  {
    stageId: 2,
    tier: 'beginner',
    baselineValue: 1.8e6,
    perfectChoices: [1, 1, 1],
    goodChoices: [1, 1, 2],
    overkillChoices: [1, 2, 2],
    underestimateChoices: [1, 3, 1],
  },
  {
    stageId: 3,
    tier: 'beginner',
    baselineValue: 8.6e8,
    perfectChoices: [1, 1, 1],
    goodChoices: [1, 1, 3],
    overkillChoices: [1, 1, 2],
    underestimateChoices: [1, 3, 1],
  },
  {
    stageId: 4,
    tier: 'intermediate',
    baselineValue: 1.5e5,
    perfectChoices: [1, 1, 1],
    goodChoices: [1, 2, 3],
    overkillChoices: [1, 1, 2],
    underestimateChoices: [1, 1, 3],
  },
  {
    stageId: 5,
    tier: 'intermediate',
    baselineValue: 9.0e8,
    perfectChoices: [1, 1, 1],
    goodChoices: [1, 2, 1],
    overkillChoices: [1, 1, 2],
    underestimateChoices: [1, 1, 3],
  },
  {
    stageId: 6,
    tier: 'intermediate',
    baselineValue: 3.5e4,
    perfectChoices: [1, 1, 1],
    goodChoices: [1, 2, 3],
    overkillChoices: [1, 1, 2],
    underestimateChoices: [1, 1, 3],
  },
  {
    stageId: 7,
    tier: 'advanced',
    baselineValue: 2.2e5,
    perfectChoices: [1, 1, 1],
    goodChoices: [1, 2, 1],
    overkillChoices: [1, 1, 2],
    underestimateChoices: [1, 1, 3],
  },
  {
    stageId: 8,
    tier: 'advanced',
    baselineValue: 1.6e7,
    perfectChoices: [1, 1, 1],
    goodChoices: [1, 2, 3],
    overkillChoices: [1, 1, 2],
    underestimateChoices: [1, 1, 3],
  },
  {
    stageId: 9,
    tier: 'advanced',
    baselineValue: 4.0e5,
    perfectChoices: [1, 1, 1],
    goodChoices: [1, 1, 3],
    overkillChoices: [1, 1, 2],
    underestimateChoices: [1, 3, 3],
  },
] as const;
