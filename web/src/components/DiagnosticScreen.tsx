import { useRef, type MouseEvent, type ReactElement } from 'react';
import type { DiagnosticUnlockState, Locale, OverallRank } from '../domain/types';
import { pickText, t } from '../i18n/dictionary';
import {
  IconCheck,
  IconCrossCrash,
  IconDiamond,
  IconTriangleWarn,
} from './Icons';
import { RadarChartSvg } from './RadarChartSvg';

interface DiagnosticScreenProps {
  readonly locale: Locale;
  readonly unlock: DiagnosticUnlockState;
  readonly onCopySummary: () => void;
  readonly onNavigate: (href: string, ev: MouseEvent<HTMLAnchorElement>) => void;
}

function getRankEmblemClass(rank: OverallRank): string {
  switch (rank) {
    case 'S+':
    case 'S':
      return 'rank-emblem rank-emblem-high tabular-nums';
    case 'A':
    case 'B':
      return 'rank-emblem rank-emblem-mid tabular-nums';
    case 'C':
    case 'UNRANKED':
      return 'rank-emblem rank-emblem-low tabular-nums';
  }
}

export function DiagnosticScreen({
  locale,
  unlock,
  onCopySummary,
  onNavigate,
}: DiagnosticScreenProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { profile } = unlock;

  const handleSelectAll = (): void => {
    const el = textareaRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  };

  let unrankedNoticeText = '';
  if (unlock.kind === 'unrankedBoth') {
    unrankedNoticeText = t(locale, 'diagnostic.unranked.noticeBoth');
  } else if (unlock.kind === 'unrankedCombinatorPending') {
    unrankedNoticeText = t(locale, 'diagnostic.unranked.noticeCombinatorOnly');
  } else if (unlock.kind === 'unrankedFermiPending') {
    unrankedNoticeText = t(locale, 'diagnostic.unranked.noticeFermiOnly');
  }

  return (
    <div className="screen-stack" data-testid="screen-diagnostic">
      <section className="panel-card">
        <h1>{t(locale, 'nav.diagnostic')}</h1>
      </section>

      <div className="two-pane-layout">
        <div className="pane-column">
          <section className="panel-card">
            <h2>{t(locale, 'diagnostic.heading.rank')}</h2>

            <div
              className={getRankEmblemClass(profile.overallRank)}
              data-testid="diagnostic-overall-rank"
              data-rank={profile.overallRank}
            >
              {(profile.overallRank === 'S+' || profile.overallRank === 'S') && <IconDiamond />}
              {(profile.overallRank === 'A' || profile.overallRank === 'B') && <IconCheck />}
              {(profile.overallRank === 'C' || profile.overallRank === 'UNRANKED') && (
                <IconTriangleWarn />
              )}
              <span>{t(locale, 'diagnostic.rankLabel', { rank: profile.overallRank })}</span>
            </div>

            <p className="spec-badge tabular-nums" data-testid="diagnostic-overall-score">
              {unlock.kind === 'unlocked'
                ? t(locale, 'diagnostic.overallScore', { score: unlock.overallScore })
                : t(locale, 'diagnostic.overallScore.unranked')}
            </p>

            <div className="action-bar">
              <p className="progress-pill tabular-nums" data-testid="diagnostic-progress-combinator">
                {`${t(locale, 'nav.combinator')}: ${t(locale, 'common.progressCleared', {
                  cleared: profile.combinatorClearedCount,
                  total: 10,
                })}`}
              </p>
              <p className="progress-pill tabular-nums" data-testid="diagnostic-progress-fermi">
                {`${t(locale, 'nav.fermi')}: ${t(locale, 'common.progressCleared', {
                  cleared: profile.fermiClearedCount,
                  total: 9,
                })}`}
              </p>
            </div>

            <RadarChartSvg locale={locale} axes={profile.axes} />
          </section>
        </div>

        <div className="pane-column">
          <section className="panel-card">
            <h2>{t(locale, 'diagnostic.radar.title')}</h2>

            <dl className="axes-dl tabular-nums">
              <div className="axis-row" data-testid="diagnostic-axis-spec">
                <dt>{t(locale, 'diagnostic.axis.spec')}</dt>
                <dd>
                  <span className="axis-score-number" data-testid="diagnostic-axis-spec-score">
                    {profile.axes.specComprehension}
                  </span>
                  <span className="axis-score-denom">/ 100</span>
                </dd>
              </div>

              <div className="axis-row" data-testid="diagnostic-axis-sequence">
                <dt>{t(locale, 'diagnostic.axis.sequence')}</dt>
                <dd>
                  <span className="axis-score-number" data-testid="diagnostic-axis-sequence-score">
                    {profile.axes.sequenceDesign}
                  </span>
                  <span className="axis-score-denom">/ 100</span>
                </dd>
              </div>

              <div className="axis-row" data-testid="diagnostic-axis-resource">
                <dt>{t(locale, 'diagnostic.axis.resource')}</dt>
                <dd>
                  <span className="axis-score-number" data-testid="diagnostic-axis-resource-score">
                    {profile.axes.resourceControl}
                  </span>
                  <span className="axis-score-denom">/ 100</span>
                </dd>
              </div>

              <div className="axis-row" data-testid="diagnostic-axis-fermi">
                <dt>{t(locale, 'diagnostic.axis.fermi')}</dt>
                <dd>
                  <span className="axis-score-number" data-testid="diagnostic-axis-fermi-score">
                    {profile.axes.fermiSense}
                  </span>
                  <span className="axis-score-denom">/ 100</span>
                </dd>
              </div>

              <div className="axis-row" data-testid="diagnostic-axis-hypothesis">
                <dt>{t(locale, 'diagnostic.axis.hypothesis')}</dt>
                <dd>
                  <span
                    className="axis-score-number"
                    data-testid="diagnostic-axis-hypothesis-score"
                  >
                    {profile.axes.hypothesisPrecision}
                  </span>
                  <span className="axis-score-denom">/ 100</span>
                </dd>
              </div>
            </dl>

            {unlock.kind !== 'unlocked' && (
              <div className="panel-card status-box-warning" data-testid="diagnostic-unranked-notice">
                <p>{unrankedNoticeText}</p>
                <div className="action-bar">
                  {profile.combinatorClearedCount === 0 && (
                    <a
                      href="/combinator?stage=1"
                      className="btn-primary"
                      data-testid="diagnostic-start-combinator-button"
                      onClick={(ev) => onNavigate('/combinator?stage=1', ev)}
                    >
                      {t(locale, 'lobby.cta.startCombinator')}
                    </a>
                  )}
                  {profile.fermiClearedCount === 0 && (
                    <a
                      href="/fermi?stage=1"
                      className={
                        profile.combinatorClearedCount === 0 ? 'btn-secondary' : 'btn-primary'
                      }
                      data-testid="diagnostic-start-fermi-button"
                      onClick={(ev) => onNavigate('/fermi?stage=1', ev)}
                    >
                      {t(locale, 'lobby.cta.startFermi')}
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="action-bar">
              <button
                type="button"
                className={unlock.kind === 'unlocked' ? 'btn-primary' : 'btn-secondary'}
                data-testid="diagnostic-copy-button"
                disabled={unlock.kind !== 'unlocked'}
                onClick={onCopySummary}
              >
                {t(locale, 'diagnostic.action.copy')}
              </button>
            </div>

            {unlock.kind === 'unlocked' && unlock.share.kind === 'copied' && (
              <div
                className="status-box status-box-info"
                role="status"
                data-testid="diagnostic-copy-toast"
              >
                <IconCheck />
                <span>{t(locale, 'diagnostic.copy.toastSuccess')}</span>
              </div>
            )}

            {unlock.kind === 'unlocked' && unlock.share.kind === 'manualFallback' && (
              <>
                <div
                  className="status-box status-box-danger"
                  role="alert"
                  data-testid="diagnostic-copy-error"
                >
                  <IconCrossCrash />
                  <span>{t(locale, 'diagnostic.copy.errorFallback')}</span>
                </div>

                <div className="manual-copy-box">
                  <label className="manual-copy-label" htmlFor="manual-copy-textarea">
                    {t(locale, 'diagnostic.copy.manualLabel')}
                  </label>
                  <textarea
                    id="manual-copy-textarea"
                    ref={textareaRef}
                    className="manual-copy-textarea"
                    data-testid="diagnostic-manual-copy-textarea"
                    readOnly
                    value={pickText(profile.shareSummaryText, locale)}
                  />
                  <div>
                    <button
                      type="button"
                      className="btn-secondary"
                      data-testid="diagnostic-select-all-button"
                      onClick={handleSelectAll}
                    >
                      {t(locale, 'diagnostic.action.selectAll')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
