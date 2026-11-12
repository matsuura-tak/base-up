import type { components } from '../generated/contracts';

export type Locale = components['schemas']['Locale'];
export type LocalizedText = components['schemas']['LocalizedText'];
export type RouteId = components['schemas']['RouteId'];
export type ResolvedRoute = components['schemas']['ResolvedRoute'];
export type ClientErrorNoticeType = components['schemas']['ClientErrorNoticeType'];

export type CombinatorConditionType = components['schemas']['CombinatorConditionType'];
export type CombinatorCondition = components['schemas']['CombinatorCondition'];
export type CombinatorEffectOp = components['schemas']['CombinatorEffectOp'];
export type CombinatorEffect = components['schemas']['CombinatorEffect'];
export type CombinatorModule = components['schemas']['CombinatorModule'];
export type CombinatorStageDefinition = components['schemas']['CombinatorStageDefinition'];
export type CombinatorRunStatus = components['schemas']['CombinatorRunStatus'];
export type CombinatorFailureLocation = components['schemas']['CombinatorFailureLocation'];
export type CombinatorFailureReason = components['schemas']['CombinatorFailureReason'];
export type CombinatorDebugLog = components['schemas']['CombinatorDebugLog'];
export type CombinatorInitialParams = components['schemas']['CombinatorInitialParams'];
export type CombinatorCurrentParams = components['schemas']['CombinatorCurrentParams'];
export type CombinatorStageRecord = components['schemas']['CombinatorStageRecord'];
export type CombinatorStageAuditEntry = components['schemas']['CombinatorStageAuditEntry'];

export type FermiTier = components['schemas']['FermiTier'];
export type FermiHypothesisCard = components['schemas']['FermiHypothesisCard'];
export type FermiHypothesisSlot = components['schemas']['FermiHypothesisSlot'];
export type FermiStageDefinition = components['schemas']['FermiStageDefinition'];
export type FermiJudgment = components['schemas']['FermiJudgment'];
export type FermiRunStatus = components['schemas']['FermiRunStatus'];
export type FermiTrapNote = components['schemas']['FermiTrapNote'];
export type FermiExplanation = components['schemas']['FermiExplanation'];
export type FermiSimulationParams = components['schemas']['FermiSimulationParams'];
export type FermiBestJudgment = components['schemas']['FermiBestJudgment'];
export type FermiStageRecord = components['schemas']['FermiStageRecord'];
export type FermiStageAuditEntry = components['schemas']['FermiStageAuditEntry'];

export type PersistedArcadeStateV1 = components['schemas']['PersistedArcadeStateV1'];
export type StorageStatus = components['schemas']['StorageStatus'];
export type OverallRank = components['schemas']['OverallRank'];
export type DiagnosticAxisScores = components['schemas']['DiagnosticAxisScores'];
export type DiagnosticProfile = components['schemas']['DiagnosticProfile'];
export type ShareResultState = components['schemas']['ShareResultState'];
export type SimulationSnapshot = components['schemas']['SimulationSnapshot'];
export type StageAuditReport = components['schemas']['StageAuditReport'];
export type AudioStateSnapshot = components['schemas']['AudioStateSnapshot'];
export type TelemetryEvent = components['schemas']['TelemetryEvent'];

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
  }
}

/**
 * Discriminated union representing all screen states in design/001-arcade-core.md Chapter 5.
 * Impossible combinations (e.g. CRASHED without debugLog, STAGE CLEAR without score,
 * or UNRANKED with copy enabled) are prevented by the type system.
 */
export type LobbyProgressPhase =
  | { readonly kind: 'empty' }
  | { readonly kind: 'combinatorOnly' }
  | { readonly kind: 'fermiOnly' }
  | { readonly kind: 'rankUnlocked' };

export type CombinatorExecutionState =
  | {
      readonly kind: 'idle';
      readonly slots: readonly [string | null, string | null, string | null];
      readonly params: CombinatorCurrentParams;
    }
  | {
      readonly kind: 'stepping';
      readonly slots: readonly [string, string, string];
      readonly stepIndex: 1 | 2 | 3;
      readonly params: CombinatorCurrentParams;
    }
  | {
      readonly kind: 'running';
      readonly slots: readonly [string, string, string];
      readonly stepIndex: 0 | 1 | 2 | 3;
      readonly params: CombinatorCurrentParams;
      readonly currentShakeOffsetPx: number;
      readonly maxShakeOffsetPx: number;
    }
  | {
      readonly kind: 'cleared';
      readonly slots: readonly [string, string, string];
      readonly stepIndex: 3;
      readonly params: CombinatorCurrentParams;
      readonly score: number;
      readonly maxShakeOffsetPx: number;
    }
  | {
      readonly kind: 'crashed';
      readonly slots: readonly [string, string, string];
      readonly stepIndex: 1 | 2 | 3;
      readonly params: CombinatorCurrentParams;
      readonly debugLog: CombinatorDebugLog;
      readonly maxShakeOffsetPx: number;
    }
  | {
      readonly kind: 'failed';
      readonly slots: readonly [string, string, string];
      readonly stepIndex: 3;
      readonly params: CombinatorCurrentParams;
      readonly debugLog: CombinatorDebugLog;
      readonly maxShakeOffsetPx: number;
    };

export type FermiExecutionState =
  | {
      readonly kind: 'idle';
      readonly selectedCardIds: readonly [string | null, string | null, string | null];
    }
  | {
      readonly kind: 'running';
      readonly selectedCardIds: readonly [string, string, string];
      readonly stepIndex: 0 | 1 | 2 | 3;
      readonly currentShakeOffsetPx: number;
      readonly maxShakeOffsetPx: number;
    }
  | {
      readonly kind: 'completed';
      readonly selectedCardIds: readonly [string, string, string];
      readonly stepIndex: 3;
      readonly judgment: FermiJudgment;
      readonly explanation: FermiExplanation;
      readonly maxShakeOffsetPx: number;
    };

export type DiagnosticSharePhase =
  | { readonly kind: 'idle' }
  | { readonly kind: 'copied'; readonly copiedText: string }
  | { readonly kind: 'manualFallback' };

export type DiagnosticUnlockState =
  | {
      readonly kind: 'unrankedBoth';
      readonly profile: DiagnosticProfile;
    }
  | {
      readonly kind: 'unrankedCombinatorPending';
      readonly profile: DiagnosticProfile;
    }
  | {
      readonly kind: 'unrankedFermiPending';
      readonly profile: DiagnosticProfile;
    }
  | {
      readonly kind: 'unlocked';
      readonly profile: DiagnosticProfile;
      readonly overallScore: number;
      readonly share: DiagnosticSharePhase;
    };

export type ScreenViewModel =
  | { readonly screen: 'lobby'; readonly progressPhase: LobbyProgressPhase }
  | {
      readonly screen: 'combinator';
      readonly stageId: number;
      readonly stageFallbackNotice: boolean;
      readonly execution: CombinatorExecutionState;
    }
  | {
      readonly screen: 'fermi';
      readonly stageId: number;
      readonly stageFallbackNotice: boolean;
      readonly execution: FermiExecutionState;
    }
  | {
      readonly screen: 'diagnostic';
      readonly unlock: DiagnosticUnlockState;
    }
  | { readonly screen: 'notFound' };
