import type { Locale, OverallRank, RouteId, TelemetryEvent } from '../domain/types';

const MAX_BUFFER_EVENTS = 200;

export class TelemetryCollector {
  private readonly events: TelemetryEvent[] = [];
  private readonly sessionBootPerfMs: number;
  private readonly isFirstVisitSession: boolean;
  private hasExecutedRunOrFire = false;
  private hasViewedQualifiedInSession = false;
  private hasCopiedInSession = false;
  private hasErroredInSession = false;

  constructor(isFirstVisitSession: boolean, sessionBootPerfMs: number) {
    this.isFirstVisitSession = isFirstVisitSession;
    this.sessionBootPerfMs = sessionBootPerfMs;
  }

  emitSessionStarted(params: {
    readonly viewportWidth: number;
    readonly locale: Locale;
    readonly reducedMotion: boolean;
    readonly nowEpochMs: number;
  }): void {
    this.pushEvent({
      event: 'Session Started',
      timestampMs: Math.max(0, Math.round(params.nowEpochMs)),
      properties: {
        viewport_category: params.viewportWidth < 768 ? 'mobile' : 'desktop',
        locale: params.locale,
        reduced_motion: params.reducedMotion,
        is_first_visit: this.isFirstVisitSession,
      },
    });
  }

  emitStageStarted(
    mode: 'combinator' | 'fermi',
    stageId: number,
    nowEpochMs: number,
  ): void {
    this.pushEvent({
      event: 'Stage Started',
      timestampMs: Math.max(0, Math.round(nowEpochMs)),
      properties: {
        mode,
        stage_id: stageId,
      },
    });
  }

  emitSimulationExecuted(params: {
    readonly mode: 'combinator' | 'fermi';
    readonly stageId: number;
    readonly executionType: 'run' | 'step' | 'fire';
    readonly attemptNumber: number;
    readonly isFirst7dReturnPlay: boolean;
    readonly nowPerfMs: number;
    readonly nowEpochMs: number;
  }): void {
    const isOfficialExec = params.executionType === 'run' || params.executionType === 'fire';
    const isFirstExecInSession = isOfficialExec && !this.hasExecutedRunOrFire;
    if (isOfficialExec) {
      this.hasExecutedRunOrFire = true;
    }
    const within60s = params.nowPerfMs - this.sessionBootPerfMs <= 60_000;

    this.pushEvent({
      event: 'Simulation Executed',
      timestampMs: Math.max(0, Math.round(params.nowEpochMs)),
      properties: {
        mode: params.mode,
        stage_id: params.stageId,
        execution_type: params.executionType,
        attempt_number: Math.max(0, params.attemptNumber),
        is_first_exec_in_session: isFirstExecInSession,
        within_60s: within60s,
        is_first_7d_return_play: params.isFirst7dReturnPlay,
      },
    });
  }

  emitStageCompleted(params: {
    readonly mode: 'combinator' | 'fermi';
    readonly stageId: number;
    readonly rankOrStatus: 'STAGE_CLEAR' | 'PERFECT_ORDER' | 'GOOD_RANGE';
    readonly attempts: number;
    readonly isFirstEverClear: boolean;
    readonly nowEpochMs: number;
  }): void {
    this.pushEvent({
      event: 'Stage Completed',
      timestampMs: Math.max(0, Math.round(params.nowEpochMs)),
      properties: {
        mode: params.mode,
        stage_id: params.stageId,
        rank_or_status: params.rankOrStatus,
        attempts: Math.max(1, params.attempts),
        is_first_ever_clear: params.isFirstEverClear,
      },
    });
  }

  emitStageFailed(params: {
    readonly mode: 'combinator' | 'fermi';
    readonly stageId: number;
    readonly failureStep: 'STEP 1' | 'STEP 2' | 'STEP 3' | 'FINAL CHECK' | 'FERMI_EVAL';
    readonly failureReason: 'CRASHED' | 'FAILED' | 'OVERKILL' | 'UNDERESTIMATE';
    readonly nowEpochMs: number;
  }): void {
    this.pushEvent({
      event: 'Stage Failed',
      timestampMs: Math.max(0, Math.round(params.nowEpochMs)),
      properties: {
        mode: params.mode,
        stage_id: params.stageId,
        failure_step: params.failureStep,
        failure_reason: params.failureReason,
      },
    });
  }

  emitDiagnosticViewed(params: {
    readonly combinatorClearedCount: number;
    readonly fermiClearedCount: number;
    readonly overallRank: OverallRank;
    readonly nowEpochMs: number;
  }): void {
    const qualified = params.overallRank !== 'UNRANKED';
    const isFirstQualified = qualified && !this.hasViewedQualifiedInSession;
    if (qualified) {
      this.hasViewedQualifiedInSession = true;
    }

    this.pushEvent({
      event: 'Diagnostic Viewed',
      timestampMs: Math.max(0, Math.round(params.nowEpochMs)),
      properties: {
        combinator_cleared_count: params.combinatorClearedCount,
        fermi_cleared_count: params.fermiClearedCount,
        overall_rank: params.overallRank,
        is_first_visit_session: this.isFirstVisitSession,
        is_first_qualified_in_session: isFirstQualified,
      },
    });
  }

  emitDiagnosticCopied(overallRank: OverallRank, nowEpochMs: number): void {
    const isFirstCopy = !this.hasCopiedInSession;
    this.hasCopiedInSession = true;
    this.pushEvent({
      event: 'Diagnostic Copied',
      timestampMs: Math.max(0, Math.round(nowEpochMs)),
      properties: {
        overall_rank: overallRank,
        is_first_copy_in_session: isFirstCopy,
      },
    });
  }

  emitAudioToggled(soundEnabled: boolean, nowEpochMs: number): void {
    this.pushEvent({
      event: 'Audio Toggled',
      timestampMs: Math.max(0, Math.round(nowEpochMs)),
      properties: {
        sound_enabled: soundEnabled,
      },
    });
  }

  emitClientError(
    errorCategory: 'runtime' | 'audio' | 'storage',
    screenName: RouteId,
    nowEpochMs: number,
  ): void {
    const isFirstErr = !this.hasErroredInSession;
    this.hasErroredInSession = true;
    this.pushEvent({
      event: 'Client Error Occurred',
      timestampMs: Math.max(0, Math.round(nowEpochMs)),
      properties: {
        error_category: errorCategory,
        screen_name: screenName,
        is_first_error_in_session: isFirstErr,
      },
    });
  }

  getEventsSnapshot(): TelemetryEvent[] {
    return [...this.events];
  }

  private pushEvent(ev: TelemetryEvent): void {
    if (this.events.length >= MAX_BUFFER_EVENTS) {
      this.events.shift();
    }
    this.events.push(ev);
  }
}
