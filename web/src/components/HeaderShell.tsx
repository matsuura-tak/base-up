import type { MouseEvent, ReactElement } from 'react';
import type { Locale, RouteId } from '../domain/types';
import { t } from '../i18n/dictionary';
import { IconSoundOff, IconSoundOn, IconTriangleWarn } from './Icons';

interface HeaderShellProps {
  readonly locale: Locale;
  readonly activeRoute: RouteId;
  readonly soundEnabled: boolean;
  readonly fallbackBannerVisible: boolean;
  readonly staleTabDetected: boolean;
  readonly onNavigate: (href: string, ev: MouseEvent<HTMLAnchorElement>) => void;
  readonly onToggleSound: () => void;
  readonly onSelectLocale: (next: Locale) => void;
}

export function HeaderShell({
  locale,
  activeRoute,
  soundEnabled,
  fallbackBannerVisible,
  staleTabDetected,
  onNavigate,
  onToggleSound,
  onSelectLocale,
}: HeaderShellProps): ReactElement {
  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
        data-testid="skip-to-main-link"
      >
        {t(locale, 'nav.skipToMain')}
      </a>

      <header className="site-header">
        <div className="site-header-inner">
          <a
            href="/"
            className="brand-link"
            data-testid="header-home-link"
            aria-label={t(locale, 'nav.homeAria')}
            aria-current={activeRoute === 'lobby' ? 'page' : undefined}
            onClick={(ev) => onNavigate('/', ev)}
          >
            <span>{t(locale, 'app.name')}</span>
          </a>

          <nav
            className="mode-nav"
            data-testid="header-mode-nav"
            aria-label={t(locale, 'nav.modeSwitcherAria')}
          >
            <a
              href="/combinator"
              className="mode-nav-link"
              data-testid="nav-mode-combinator"
              aria-current={activeRoute === 'combinator' ? 'page' : undefined}
              onClick={(ev) => onNavigate('/combinator', ev)}
            >
              {t(locale, 'nav.combinator')}
            </a>
            <a
              href="/fermi"
              className="mode-nav-link"
              data-testid="nav-mode-fermi"
              aria-current={activeRoute === 'fermi' ? 'page' : undefined}
              onClick={(ev) => onNavigate('/fermi', ev)}
            >
              {t(locale, 'nav.fermi')}
            </a>
            <a
              href="/diagnostic"
              className="mode-nav-link"
              data-testid="nav-mode-diagnostic"
              aria-current={activeRoute === 'diagnostic' ? 'page' : undefined}
              onClick={(ev) => onNavigate('/diagnostic', ev)}
            >
              {t(locale, 'nav.diagnostic')}
            </a>
          </nav>

          <div className="header-utilities">
            <div className="sound-group">
              <button
                type="button"
                className="btn-utility"
                data-testid="header-sound-toggle"
                aria-pressed={soundEnabled}
                data-sound-state={soundEnabled ? 'on' : 'off'}
                aria-describedby="header-sound-state"
                onClick={onToggleSound}
              >
                {soundEnabled ? <IconSoundOn /> : <IconSoundOff />}
                <span>{t(locale, 'header.sound.toggle')}</span>
              </button>
              <span
                id="header-sound-state"
                data-testid="header-sound-state"
                className={soundEnabled ? 'sound-badge sound-badge-on' : 'sound-badge'}
              >
                {soundEnabled ? t(locale, 'header.sound.on') : t(locale, 'header.sound.off')}
              </span>
            </div>

            <div className="lang-group">
              <button
                type="button"
                className="btn-utility"
                data-testid="header-lang-ja"
                aria-pressed={locale === 'ja'}
                aria-label={t(locale, 'header.lang.switchJa')}
                onClick={() => onSelectLocale('ja')}
              >
                {t(locale, 'header.lang.ja')}
              </button>
              <button
                type="button"
                className="btn-utility"
                data-testid="header-lang-en"
                aria-pressed={locale === 'en'}
                aria-label={t(locale, 'header.lang.switchEn')}
                onClick={() => onSelectLocale('en')}
              >
                {t(locale, 'header.lang.en')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {fallbackBannerVisible && (
        <div className="banner-bar">
          <div
            className="status-box status-box-warning"
            role="status"
            data-testid="storage-fallback-banner"
          >
            <IconTriangleWarn />
            <span>{t(locale, 'banner.storageFallback')}</span>
          </div>
        </div>
      )}

      {staleTabDetected && (
        <div className="banner-bar">
          <div className="status-box status-box-warning" role="status">
            <IconTriangleWarn />
            <span>{t(locale, 'error.boundary.message')}</span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.location.reload()}
            >
              {t(locale, 'error.boundary.reload')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
