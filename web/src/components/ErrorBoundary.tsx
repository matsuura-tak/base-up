import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { Locale } from '../domain/types';
import { t } from '../i18n/dictionary';
import { IconCrossCrash } from './Icons';

interface ErrorBoundaryProps {
  readonly locale: Locale;
  readonly onRuntimeError: () => void;
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(_error: Error, _info: ErrorInfo): void {
    this.props.onRuntimeError();
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      const { locale } = this.props;
      return (
        <section className="panel-card status-box-danger" role="alert">
          <p className="debug-log-heading">
            <IconCrossCrash />
            <span>{t(locale, 'error.boundary.message')}</span>
          </p>
          <div>
            <button
              type="button"
              className="btn-primary"
              data-testid="error-reload-button"
              onClick={this.handleReload}
            >
              {t(locale, 'error.boundary.reload')}
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
