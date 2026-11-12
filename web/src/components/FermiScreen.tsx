import type { MouseEvent, ReactElement } from 'react';
import {
  formatFermiCompactValue,
  formatSignedLogError,
} from '../domain/fermiEngine';
import { FERMI_STAGES, getFermiStage } from '../domain/fermiStages';
import type {
  FermiExecutionState,
  FermiRunStatus,
  FermiStageRecord,
  FermiTier,
  Locale,
} from '../domain/types';
import { pickText, t } from '../i18n/dictionary';
import {
  IconCheck,
  IconCrossCrash,
  IconDiamond,
  IconTriangleWarn,
} from './Icons';
import { SimulationCanvas } from './SimulationCanvas';

interface FermiScreenProps {
  readonly locale: Locale;
  readonly stageId: number;
  readonly stageFallbackNotice: boolean;
  readonly execution: FermiExecutionState;
  readonly stageRecords: Readonly<Record<string, FermiStageRecord>>;
  readonly combinatorClearedCount: number;
  readonly onSelectStage: (stageId: number) => void;
  readonly onToggleCard: (slotIndex: 0 | 1 | 2, cardId: string) => void;
  readonly onFire: () => void;
  readonly onReset: () => void;
  readonly onNavigate: (href: string, ev: MouseEvent<HTMLAnchorElement>) => void;
}

function getTierLabel(tier: FermiTier, locale: Locale): string {
  switch (tier) {
    case 'beginner':
      return t(locale, 'fermi.tier.beginner');
    case 'intermediate':
      return t(locale, 'fermi.tier.intermediate');
    case 'advanced':
      return t(locale, 'fermi.tier.advanced');
  }
}

function getFermiStatusCode(execution: FermiExecutionState): FermiRunStatus {
  switch (execution.kind) {
    case 'idle':
      return 'IDLE';
    case 'running':
      return 'RUNNING';
    case 'completed':
      return execution.judgment;
  }
}

export function FermiScreen({
  locale,
  stageId,
  stageFallbackNotice,
  execution,
  stageRecords,
  combinatorClearedCount,
  onSelectStage,
  onToggleCard,
  onFire,
  onReset,
  onNavigate,
}: FermiScreenProps): ReactElement {
  const stage = getFermiStage(stageId);
  const statusCode = getFermiStatusCode(execution);
  const isRunning = execution.kind === 'running';
  const currentShake = execution.kind === 'running' ? execution.currentShakeOffsetPx : 0;
  const stepIndex =
    execution.kind === 'idle' ? 0 : execution.kind === 'running' ? execution.stepIndex : 3;

  const selectedCards = stage.slots.map((slot, idx) => {
    const id = execution.selectedCardIds[idx];
    return id ? slot.cards.find((c) => c.id === id) : undefined;
  });

  const unassignedSlotNames: string[] = [];
  for (let idx = 0; idx < 3; idx += 1) {
    if (!selectedCards[idx]) {
      unassignedSlotNames.push(`ACT ${String(idx + 1)}`);
    }
  }
  const hasUnselected = unassignedSlotNames.length > 0;
  const selectedCount = 3 - unassignedSlotNames.length;

  const emptyToken = t(locale, 'fermi.formula.emptySlot');
  const term1 = selectedCards[0] ? pickText(selectedCards[0].displayValue, locale) : emptyToken;
  const term2 = selectedCards[1] ? pickText(selectedCards[1].displayValue, locale) : emptyToken;
  const term3 = selectedCards[2] ? pickText(selectedCards[2].displayValue, locale) : emptyToken;
  const unitText = pickText(stage.unitLabel, locale);

  const previewEstimate =
    selectedCards[0] && selectedCards[1] && selectedCards[2]
      ? `${formatFermiCompactValue(
          selectedCards[0].numericValue *
            selectedCards[1].numericValue *
            selectedCards[2].numericValue,
          locale,
        )} ${unitText}`
      : emptyToken;

  const formulaPreview = `ACT 1 × ACT 2 × ACT 3 = ${term1} × ${term2} × ${term3} ≈ ${previewEstimate}`;

  let statusText: string;
  let statusClass = 'status-box';
  switch (statusCode) {
    case 'IDLE':
      statusText = t(locale, 'fermi.status.idle');
      break;
    case 'RUNNING':
      statusText = t(locale, 'fermi.status.running');
      statusClass = 'status-box status-box-info';
      break;
    case 'PERFECT ORDER':
      statusText = t(locale, 'fermi.status.perfect');
      statusClass = 'status-box status-box-success';
      break;
    case 'GOOD RANGE':
      statusText = t(locale, 'fermi.status.good');
      statusClass = 'status-box status-box-info';
      break;
    case 'OVERKILL':
      statusText = t(locale, 'fermi.status.overkill');
      statusClass = 'status-box status-box-warning';
      break;
    case 'UNDERESTIMATE':
      statusText = t(locale, 'fermi.status.underestimate');
      statusClass = 'status-box status-box-danger';
      break;
  }

  const isClearedRun =
    execution.kind === 'completed' &&
    (execution.judgment === 'PERFECT ORDER' || execution.judgment === 'GOOD RANGE');

  const bothUnlockedAfterClear = isClearedRun && combinatorClearedCount >= 1;
  const nextHref =
    stage.stageId < 9
      ? `/fermi?stage=${String(stage.stageId + 1)}`
      : bothUnlockedAfterClear
        ? '/diagnostic'
        : '/combinator?stage=1';
  const nextLabel =
    stage.stageId < 9
      ? t(locale, 'combinator.action.nextStage')
      : bothUnlockedAfterClear
        ? t(locale, 'lobby.cta.openDiagnostic')
        : t(locale, 'lobby.cta.startCombinator');

  return (
    <div className="screen-stack" data-testid="screen-fermi">
      <section className="panel-card">
        <h1>{t(locale, 'nav.fermi')}</h1>

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

        <h2>
          {`${t(locale, 'fermi.tier.beginner')} / ${t(locale, 'fermi.tier.intermediate')} / ${t(locale, 'fermi.tier.advanced')}`}
        </h2>

        <div className="stage-selector-grid">
          {FERMI_STAGES.map((s) => {
            const isCleared = stageRecords[String(s.stageId)]?.cleared === true;
            const tierWord = getTierLabel(s.tier, locale);
            const visibleLabel = isCleared
              ? t(locale, 'fermi.stage.labelCleared', { n: s.stageId })
              : t(locale, 'fermi.stage.label', { n: s.stageId });
            const ariaLabel = isCleared
              ? t(locale, 'fermi.stage.ariaCleared', { n: s.stageId, tier: tierWord })
              : t(locale, 'fermi.stage.aria', { n: s.stageId, tier: tierWord });

            return (
              <button
                key={s.stageId}
                type="button"
                className="stage-btn tabular-nums"
                data-testid={`fermi-stage-${String(s.stageId)}`}
                data-stage-id={String(s.stageId)}
                data-tier={s.tier}
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
            <h2 data-testid="fermi-question-heading">{pickText(stage.question, locale)}</h2>

            <p className="fermi-formula-box tabular-nums" data-testid="fermi-formula-preview">
              {formulaPreview}
            </p>

            <SimulationCanvas
              mode="fermi"
              testId="fermi-simulation-canvas"
              ariaLabel={t(locale, 'fermi.canvas.aria', { status: statusCode })}
              status={statusCode}
              stepIndex={stepIndex}
              selectedCount={selectedCount}
              logError={execution.kind === 'completed' ? execution.explanation.logError : null}
              judgment={execution.kind === 'completed' ? execution.judgment : null}
              shakeOffsetPx={currentShake}
            />

            <div className="result-row">
              <div
                className={statusClass}
                role="status"
                data-testid="fermi-result-status"
                data-status={statusCode}
              >
                {statusCode === 'PERFECT ORDER' && <IconDiamond />}
                {statusCode === 'GOOD RANGE' && <IconCheck />}
                {statusCode === 'OVERKILL' && <IconTriangleWarn />}
                {statusCode === 'UNDERESTIMATE' && <IconCrossCrash />}
                <span>{statusText}</span>
              </div>

              {isClearedRun && (
                <a
                  href={nextHref}
                  className="btn-secondary"
                  data-testid="fermi-next-stage-button"
                  onClick={(ev) => onNavigate(nextHref, ev)}
                >
                  {nextLabel}
                </a>
              )}
            </div>
          </section>

          {execution.kind === 'completed' && (
            <section className="panel-card" data-testid="fermi-explanation-panel">
              <h3>{t(locale, 'fermi.explain.heading')}</h3>

              <p className="spec-badge tabular-nums" data-testid="fermi-comparison-values">
                {t(locale, 'fermi.explain.comparison', {
                  estimate: `${formatFermiCompactValue(execution.explanation.estimateValue, locale)} ${unitText}`,
                  baseline: `${formatFermiCompactValue(execution.explanation.baselineValue, locale)} ${unitText}`,
                  logError: formatSignedLogError(execution.explanation.logError),
                })}
              </p>

              <div className="panel-card" data-testid="fermi-baseline-breakdown">
                <h3>{t(locale, 'fermi.explain.formulaHeading')}</h3>
                <p className="tabular-nums">
                  {pickText(execution.explanation.baselineFormula, locale)}
                </p>
                <p className="secondary-text">
                  {pickText(execution.explanation.baselineBreakdownText, locale)}
                </p>
              </div>

              <div className="panel-card" data-testid="fermi-trap-notes">
                <h3>{t(locale, 'fermi.explain.trapHeading')}</h3>
                <ul className="trap-list">
                  {execution.explanation.trapNotes.map((note) => (
                    <li
                      key={note.cardId}
                      className={
                        note.triggeredInCurrentRun
                          ? 'trap-item trap-item-triggered'
                          : 'trap-item'
                      }
                    >
                      {note.triggeredInCurrentRun && (
                        <span className="trap-triggered-badge">
                          <IconCrossCrash />
                          <span>{t(locale, 'fermi.explain.trapTriggeredBadge')}</span>
                        </span>
                      )}
                      <strong>
                        {`ACT ${String(note.actIndex)}: ${pickText(note.cardLabel, locale)}`}
                      </strong>
                      <span className="secondary-text">{pickText(note.reason, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {execution.explanation.showRetryHint && (
                <p
                  className="status-box status-box-warning"
                  data-testid="fermi-retry-hint"
                >
                  <IconTriangleWarn />
                  <span>{t(locale, 'fermi.explain.retryHint')}</span>
                </p>
              )}
            </section>
          )}
        </div>

        <div className="pane-column">
          {stage.slots.map((slot, slotIdx) => {
            const actIdx: 0 | 1 | 2 = slotIdx === 0 ? 0 : slotIdx === 1 ? 1 : 2;
            const currentSelectedId = execution.selectedCardIds[actIdx];

            return (
              <fieldset
                key={slot.slotCode}
                className="fermi-fieldset"
                data-testid={`fermi-slot-act-${String(slot.actIndex)}`}
              >
                <legend className="fermi-legend">
                  {`${slot.slotCode}：${pickText(slot.roleLabel, locale)}`}
                </legend>

                <div className="fermi-cards-grid">
                  {slot.cards.map((c, cIdx) => {
                    const cardNum = cIdx + 1;
                    const isSelected = currentSelectedId === c.id;
                    const formatted = t(locale, 'fermi.card.labelFormat', {
                      label: pickText(c.label, locale),
                      value: pickText(c.displayValue, locale),
                    });

                    return (
                      <button
                        key={c.id}
                        type="button"
                        className="fermi-card-btn tabular-nums"
                        data-testid={`fermi-card-act${String(slot.actIndex)}-${String(cardNum)}`}
                        data-card-id={c.id}
                        aria-pressed={isSelected}
                        disabled={isRunning}
                        onClick={() => onToggleCard(actIdx, c.id)}
                      >
                        <span>{formatted}</span>
                        {isSelected && (
                          <span className="selected-pill">
                            <IconCheck />
                            <span>{t(locale, 'fermi.card.selectedBadge')}</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <section className="panel-card">
            {hasUnselected && (
              <p
                className="status-box status-box-info"
                role="status"
                data-testid="fermi-slot-guidance"
              >
                {t(locale, 'fermi.guidance.unassigned', {
                  slots: unassignedSlotNames.join(', '),
                })}
              </p>
            )}

            <div className="action-bar">
              <button
                type="button"
                className="btn-primary"
                data-testid="fermi-fire-button"
                disabled={hasUnselected || isRunning}
                onClick={onFire}
              >
                {t(locale, 'fermi.action.fire')}
              </button>

              <button
                type="button"
                className="btn-secondary"
                data-testid="fermi-reset-button"
                disabled={isRunning}
                onClick={onReset}
              >
                {t(locale, 'fermi.action.reset')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
