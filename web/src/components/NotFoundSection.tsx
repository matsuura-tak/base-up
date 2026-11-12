import type { MouseEvent, ReactElement } from 'react';
import type { Locale } from '../domain/types';
import { t } from '../i18n/dictionary';

interface NotFoundSectionProps {
  readonly locale: Locale;
  readonly onNavigate: (href: string, ev: MouseEvent<HTMLAnchorElement>) => void;
}

export function NotFoundSection({ locale, onNavigate }: NotFoundSectionProps): ReactElement {
  return (
    <section className="hero-panel" data-testid="not-found-section">
      <h1>{t(locale, 'error.notFound.heading')}</h1>
      <p className="prose-measure secondary-text">{t(locale, 'error.notFound.message')}</p>
      <a
        href="/"
        className="btn-primary"
        data-testid="not-found-home-link"
        onClick={(ev) => onNavigate('/', ev)}
      >
        {t(locale, 'error.notFound.backToLobby')}
      </a>
    </section>
  );
}
