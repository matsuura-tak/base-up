import type { MouseEvent, ReactElement } from 'react';
import type { DiagnosticProfile, LobbyProgressPhase, Locale } from '../domain/types';
import { t } from '../i18n/dictionary';

interface LobbyScreenProps {
  readonly locale: Locale;
  readonly profile: DiagnosticProfile;
  readonly phase: LobbyProgressPhase;
  readonly onNavigate: (href: string, ev: MouseEvent<HTMLAnchorElement>) => void;
}

export function LobbyScreen({
  locale,
  profile,
  phase,
  onNavigate,
}: LobbyScreenProps): ReactElement {
  let primaryHref = '/combinator?stage=1';
  let primaryLabel = t(locale, 'lobby.cta.startCombinator');

  switch (phase.kind) {
    case 'empty':
    case 'fermiOnly':
      primaryHref = '/combinator?stage=1';
      primaryLabel = t(locale, 'lobby.cta.startCombinator');
      break;
    case 'combinatorOnly':
      primaryHref = '/fermi?stage=1';
      primaryLabel = t(locale, 'lobby.cta.startFermi');
      break;
    case 'rankUnlocked':
      primaryHref = '/diagnostic';
      primaryLabel = t(locale, 'lobby.cta.openDiagnostic');
      break;
  }

  return (
    <div className="screen-stack" data-testid="screen-lobby">
      <section className="hero-panel">
        <h1>{t(locale, 'app.name')}</h1>
        <p className="subtitle-text">{t(locale, 'app.subtitle')}</p>
        <p className="prose-measure secondary-text">{t(locale, 'lobby.lead')}</p>
        {phase.kind === 'empty' && (
          <p className="secondary-text">{t(locale, 'lobby.emptyHint')}</p>
        )}
        <a
          href={primaryHref}
          className="btn-primary"
          data-testid="lobby-primary-start-button"
          onClick={(ev) => onNavigate(primaryHref, ev)}
        >
          {primaryLabel}
        </a>
      </section>

      <div className="lobby-grid">
        <section className="panel-card">
          <h2>{t(locale, 'nav.combinator')}</h2>
          <p className="secondary-text">{t(locale, 'lobby.card.combinator.desc')}</p>
          <div className="mode-card-footer">
            <p className="progress-pill tabular-nums" data-testid="lobby-progress-combinator">
              {t(locale, 'common.progressCleared', {
                cleared: profile.combinatorClearedCount,
                total: 10,
              })}
            </p>
            <a
              href="/combinator"
              className="btn-secondary"
              data-testid="lobby-mode-combinator"
              onClick={(ev) => onNavigate('/combinator', ev)}
            >
              {t(locale, 'lobby.card.openCombinator')}
            </a>
          </div>
        </section>

        <section className="panel-card">
          <h2>{t(locale, 'nav.fermi')}</h2>
          <p className="secondary-text">{t(locale, 'lobby.card.fermi.desc')}</p>
          <div className="mode-card-footer">
            <p className="progress-pill tabular-nums" data-testid="lobby-progress-fermi">
              {t(locale, 'common.progressCleared', {
                cleared: profile.fermiClearedCount,
                total: 9,
              })}
            </p>
            <a
              href="/fermi"
              className="btn-secondary"
              data-testid="lobby-mode-fermi"
              onClick={(ev) => onNavigate('/fermi', ev)}
            >
              {t(locale, 'lobby.card.openFermi')}
            </a>
          </div>
        </section>

        <section className="panel-card">
          <h2>{t(locale, 'nav.diagnostic')}</h2>
          <p className="secondary-text">{t(locale, 'lobby.card.diagnostic.desc')}</p>
          <div className="mode-card-footer">
            <p className="progress-pill tabular-nums" data-testid="lobby-rank-badge">
              {t(locale, 'diagnostic.rankLabel', { rank: profile.overallRank })}
            </p>
            <a
              href="/diagnostic"
              className="btn-secondary"
              data-testid="lobby-mode-diagnostic"
              onClick={(ev) => onNavigate('/diagnostic', ev)}
            >
              {t(locale, 'lobby.card.openDiagnostic')}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
