import type { MouseEvent, ReactElement } from 'react';
import {
  COMBINATOR_STAGES,
  formatEnergyCost,
  getCombinatorStage,
} from '../domain/combinatorStages';
import type {
  CombinatorDebugLog,
  CombinatorExecutionState,
  CombinatorRunStatus,
  CombinatorStageRecord,
  Locale,
} from '../domain/types';
import { pickText, t } from '../i18n/dictionary';
import { IconCheck, IconCrossCrash, IconTriangleWarn } from './Icons';
import { SimulationCanvas } from './SimulationCanvas';

interface CombinatorScreenProps {
  readonly locale: Locale;
  readonly stageId: number;
  readonly stageFallbackNotice: boolean;
  readonly execution: CombinatorExecutionState;
  readonly stageRecords: Readonly<Record<string, CombinatorStageRecord>>;
  readonly onSelectStage: (stageId: number) => void;
  readonly onToggleSlot: (slotIndex: 0 | 1 | 2) => void;
  readonly onClickModule: (moduleId: string) => void;
  readonly onRun: () => void;
  readonly onStep: () => void;
  readonly onReset: () => void;
  readonly onNavigate: (href: string, ev: MouseEvent<HTMLAnchorElement>) => void;
}

function getStatusCode(execution: CombinatorExecutionState): CombinatorRunStatus {
  switch (execution.kind) {
    case 'idle':
      return 'IDLE';
    case 'stepping':
      return 'STEPPING';
    case 'running':
      return 'RUNNING';
    case 'cleared':
      return 'STAGE CLEAR';
    case 'crashed':
      return 'CRASHED';
    case 'failed':
      return 'FAILED';
  }
}

function getStepIndex(execution: CombinatorExecutionState): number {
  switch (execution.kind) {
    case 'idle':
      return 0;
    case 'stepping':
    case 'running':
    case 'cleared':
    case 'crashed':
    case 'failed':
      return execution.stepIndex;
  }
}

function formatFailureReason(log: CombinatorDebugLog, locale: Locale): string {
  switch (log.reason) {
    case 'ENERGY_DEPLETED':
      return t(locale, 'combinator.debug.reason.energy');
    case 'OVERLOAD_EXCEEDED':
      return t(locale, 'combinator.debug.reason.overheat');
    case 'TARGET_UNMET':
      return t(locale, 'combinator.debug.reason.unmet');
  }
}

export function CombinatorScreen({
  locale,
  stageId,
  stageFallbackNotice,
  execution,
  stageRecords,
  onSelectStage,
  onToggleSlot,
  onClickModule,
  onRun,
  onStep,
  onReset,
  onNavigate,
}: CombinatorScreenProps): ReactElement {
  const stage = getCombinatorStage(stageId);
  const statusCode = getStatusCode(execution);
  const stepIndex = getStepIndex(execution);
  const isRunning = execution.kind === 'running';
  const currentShake = execution.kind === 'running' ? execution.currentShakeOffsetPx : 0;

  const unassignedSlotNames: string[] = [];
  for (let idx = 0; idx < 3; idx += 1) {
    if (execution.slots[idx] === null) {
      unassignedSlotNames.push(`STEP ${String(idx + 1)}`);
    }
  }
  const hasUnassigned = unassignedSlotNames.length > 0;
  const assignedCount = 3 - unassignedSlotNames.length;

  const stepFinishedOrHalted =
    execution.kind === 'cleared' ||
    execution.kind === 'crashed' ||
    execution.kind === 'failed' ||
    (execution.kind === 'stepping' && execution.stepIndex >= 3);

  let statusText: string;
  let statusClass = 'status-box';
  switch (execution.kind) {
    case 'idle':
      statusText = t(locale, 'combinator.status.idle');
      break;
    case 'stepping':
      statusText = t(locale, 'combinator.status.stepping', { step: execution.stepIndex });
      statusClass = 'status-box status-box-info';
      break;
    case 'running':
      statusText = t(locale, 'combinator.status.running');
      statusClass = 'status-box status-box-info';
      break;
    case 'cleared':
      statusText = t(locale, 'combinator.status.clear');
      statusClass = 'status-box status-box-success';
      break;
    case 'crashed':
      statusText = t(locale, 'combinator.status.crashed');
      statusClass = 'status-box status-box-danger';
      break;
    case 'failed':
      statusText = t(locale, 'combinator.status.failed');
      statusClass = 'status-box status-box-danger';
      break;
  }

  const nextStageHref =
    stage.stageId < 10 ? `/combinator?stage=${String(stage.stageId + 1)}` : '/fermi';
  const nextStageLabel =
    stage.stageId < 10
      ? t(locale, 'combinator.action.nextStage')
      : t(locale, 'lobby.card.openFermi');

  const debugLog: CombinatorDebugLog | null =
    execution.kind === 'crashed' || execution.kind === 'failed' ? execution.debugLog : null;

  return (
    <div className="screen-stack" data-testid="screen-combinator">
      <section className="panel-card">
        <h1>{t(locale, 'nav.combinator')}</h1>

        {stageFallbackNotice && (
          <div
            className="status-box status-box-warning"
            role="status"
            data-testid="stage-fallback-notice"
          >
            <IconTriangleWarn />
            <span>{t(locale, 'common.stageFallbackNotice')}</span>
          </div>
        )}

        <h2>{t(locale, 'combinator.section.stages')}</h2>
        <div className="stage-selector-grid">
          {COMBINATOR_STAGES.map((s) => {
            const isCleared = stageRecords[String(s.stageId)]?.cleared === true;
            const visibleLabel = isCleared
              ? t(locale, 'combinator.stage.labelCleared', { n: s.stageId })
              : t(locale, 'combinator.stage.label', { n: s.stageId });
            const ariaLabel = isCleared
              ? t(locale, 'combinator.stage.ariaCleared', { n: s.stageId })
              : t(locale, 'combinator.stage.aria', { n: s.stageId });

            return (
              <button
                key={s.stageId}
                type="button"
                className="stage-btn tabular-nums"
                data-testid={`combinator-stage-${String(s.stageId)}`}
                data-stage-id={String(s.stageId)}
                data-cleared={isCleared ? 'true' : 'false'}
                aria-pressed={s.stageId === stage.stageId}
                aria-label={ariaLabel}
                disabled={isRunning}
                onClick={() => onSelectStage(s.stageId)}
              >
                {isCleared && <IconCheck />}
                <span>{visibleLabel}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="two-pane-layout">
        <div className="pane-column">
          <section className="panel-card">
            <h2>{pickText(stage.title, locale)}</h2>

            <div className="spec-pair-grid">
              <p className="spec-badge tabular-nums" data-testid="combinator-target-condition">
                {t(locale, 'combinator.target.display', {
                  condition: pickText(stage.targetConditionText, locale),
                })}
              </p>
              <p className="spec-badge tabular-nums" data-testid="combinator-overheat-limit">
                {t(locale, 'combinator.limit.display', {
                  limit: pickText(stage.overloadLimitText, locale),
                })}
              </p>
            </div>

            <dl className="telemetry-dl tabular-nums" data-testid="combinator-telemetry-bar">
              <div className="telemetry-item">
                <dt>{t(locale, 'combinator.attr.cost')}</dt>
                <dd data-testid="combinator-param-energy">{execution.params.energy}</dd>
              </div>
              <div className="telemetry-item">
                <dt>{t(locale, 'combinator.attr.effect')}</dt>
                <dd data-testid="combinator-param-output">
                  {`${String(execution.params.output)} / ${String(stage.targetOutput)}`}
                </dd>
              </div>
              <div className="telemetry-item">
                <dt>{t(locale, 'combinator.attr.sideEffect')}</dt>
                <dd data-testid="combinator-param-side-effect">
                  {`${String(execution.params.sideEffect)} / ${String(stage.overloadLimit)}`}
                </dd>
              </div>
            </dl>

            <SimulationCanvas
              mode="combinator"
              testId="combinator-simulation-canvas"
              ariaLabel={t(locale, 'combinator.canvas.aria', {
                status: statusCode,
                step: stepIndex,
              })}
              status={statusCode}
              stepIndex={stepIndex}
              assignedCount={assignedCount}
              params={execution.params}
              targetOutput={stage.targetOutput}
              overloadLimit={stage.overloadLimit}
              shakeOffsetPx={currentShake}
            />

            <div className="result-row">
              <div
                className={statusClass}
                role="status"
                data-testid="combinator-result-status"
                data-status={statusCode}
              >
                {execution.kind === 'cleared' && <IconCheck />}
                {(execution.kind === 'crashed' || execution.kind === 'failed') && (
                  <IconCrossCrash />
                )}
                <span>{statusText}</span>
              </div>

              <p className="spec-badge tabular-nums" data-testid="combinator-score-value">
                {t(locale, 'combinator.score.label', {
                  score: execution.kind === 'cleared' ? execution.score : 0,
                })}
              </p>
            </div>

            {execution.kind === 'cleared' && (
              <div>
                <a
                  href={nextStageHref}
                  className="btn-secondary"
                  data-testid="combinator-next-stage-button"
                  onClick={(ev) => onNavigate(nextStageHref, ev)}
                >
                  {nextStageLabel}
                </a>
              </div>
            )}
          </section>

          {debugLog && (
            <section
              className="panel-card debug-log-panel"
              role="region"
              aria-labelledby="combinator-debug-heading"
              data-testid="combinator-debug-log"
            >
              <h3 id="combinator-debug-heading" className="debug-log-heading">
                <IconCrossCrash />
                <span>{t(locale, 'combinator.debug.heading')}</span>
              </h3>
              <ul className="debug-list tabular-nums">
                <li data-testid="combinator-debug-location">
                  {t(locale, 'combinator.debug.location', { location: debugLog.location })}
                </li>
                <li data-testid="combinator-debug-reason">
                  {formatFailureReason(debugLog, locale)}
                </li>
                <li data-testid="combinator-debug-values">
                  {t(locale, 'combinator.debug.values', {
                    expected: pickText(debugLog.expectedText, locale),
                    actual: pickText(debugLog.actualText, locale),
                  })}
                </li>
              </ul>
              <p className="secondary-text" data-testid="combinator-debug-retry-hint">
                {t(locale, 'combinator.debug.retryHint')}
              </p>
            </section>
          )}
        </div>

        <div className="pane-column">
          <section className="panel-card">
            <h2>{t(locale, 'combinator.section.slots')}</h2>

            <div className="slots-grid">
              {([0, 1, 2] as const).map((slotIdx) => {
                const slotNum = slotIdx + 1;
                const assignedId = execution.slots[slotIdx];
                const assignedMod = assignedId
                  ? stage.modules.find((m) => m.id === assignedId)
                  : undefined;

                return (
                  <button
                    key={slotNum}
                    type="button"
                    className={
                      assignedMod ? 'slot-btn slot-btn-assigned tabular-nums' : 'slot-btn tabular-nums'
                    }
                    data-testid={`combinator-slot-${String(slotNum)}`}
                    data-assigned-module={assignedMod ? assignedMod.id : 'empty'}
                    disabled={isRunning}
                    onClick={() => onToggleSlot(slotIdx)}
                  >
                    {assignedMod
                      ? t(locale, 'combinator.slot.assignedLabel', {
                          k: slotNum,
                          moduleName: pickText(assignedMod.name, locale),
                        })
                      : t(locale, 'combinator.slot.emptyLabel', { k: slotNum })}
                  </button>
                );
              })}
            </div>

            {hasUnassigned && (
              <p
                className="status-box status-box-info"
                role="status"
                data-testid="combinator-slot-guidance"
              >
                {t(locale, 'combinator.guidance.unassigned', {
                  slots: unassignedSlotNames.join(', '),
                })}
              </p>
            )}

            <div className="action-bar">
              <button
                type="button"
                className="btn-primary"
                data-testid="combinator-run-button"
                disabled={hasUnassigned || isRunning}
                onClick={onRun}
              >
                {t(locale, 'combinator.action.run')}
              </button>

              <button
                type="button"
                className="btn-secondary"
                data-testid="combinator-step-button"
                disabled={hasUnassigned || isRunning || stepFinishedOrHalted}
                onClick={onStep}
              >
                {t(locale, 'combinator.action.step')}
              </button>

              <button
                type="button"
                className="btn-secondary"
                data-testid="combinator-reset-button"
                disabled={isRunning}
                onClick={onReset}
              >
                {t(locale, 'combinator.action.reset')}
              </button>
            </div>
          </section>

          <section className="panel-card">
            <h2>{t(locale, 'combinator.section.modules')}</h2>

            <div className="modules-grid">
              {stage.modules.map((mod, idx) => {
                const k = idx + 1;
                const assignedSlotIndex = execution.slots.indexOf(mod.id);
                const isAssigned = assignedSlotIndex !== -1;
                const allSlotsFull = !hasUnassigned;
                const isDisabled = isRunning || (!isAssigned && allSlotsFull);

                const actionTag = isAssigned
                  ? t(locale, 'combinator.module.removeAction', {
                      k: assignedSlotIndex + 1,
                    })
                  : allSlotsFull
                    ? t(locale, 'combinator.module.fullAction')
                    : t(locale, 'combinator.module.assignAction');

                return (
                  <button
                    key={mod.id}
                    type="button"
                    className={
                      isAssigned
                        ? 'module-card-btn module-card-assigned tabular-nums'
                        : 'module-card-btn tabular-nums'
                    }
                    data-testid={`combinator-module-card-${String(k)}`}
                    data-module-id={mod.id}
                    disabled={isDisabled}
                    onClick={() => onClickModule(mod.id)}
                  >
                    <span className="module-card-header">
                      <span className="module-card-title">{pickText(mod.name, locale)}</span>
                      <span className="module-card-action-tag">{actionTag}</span>
                    </span>

                    <span className="module-attrs-grid">
                      <span
                        className="module-attr-row"
                        data-testid={`combinator-module-effect-${String(k)}`}
                      >
                        <span className="module-attr-label">
                          {`${t(locale, 'combinator.attr.effect')}:`}
                        </span>
                        <span className="module-attr-value">
                          {pickText(mod.effect.label, locale)}
                        </span>
                      </span>

                      <span
                        className="module-attr-row"
                        data-testid={`combinator-module-cost-${String(k)}`}
                      >
                        <span className="module-attr-label">
                          {`${t(locale, 'combinator.attr.cost')}:`}
                        </span>
                        <span className="module-attr-value">
                          {formatEnergyCost(mod.energyDelta, locale)}
                        </span>
                      </span>

                      <span
                        className="module-attr-row"
                        data-testid={`combinator-module-side-effect-${String(k)}`}
                      >
                        <span className="module-attr-label">
                          {`${t(locale, 'combinator.attr.sideEffect')}:`}
                        </span>
                        <span className="module-attr-value">
                          {pickText(mod.sideEffectLabel, locale)}
                        </span>
                      </span>

                      <span
                        className="module-attr-row"
                        data-testid={`combinator-module-condition-${String(k)}`}
                      >
                        <span className="module-attr-label">
                          {`${t(locale, 'combinator.attr.condition')}:`}
                        </span>
                        <span className="module-attr-value">
                          {pickText(mod.condition.label, locale)}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
