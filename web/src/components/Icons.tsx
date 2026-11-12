import type { ReactElement } from 'react';

export function IconSoundOn(): ReactElement {
  return (
    <svg
      className="ui-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="3,7 7,7 11,3 11,17 7,13 3,13" />
      <path d="M14 7.5a3.5 3.5 0 0 1 0 5" />
      <path d="M16.5 5a7 7 0 0 1 0 10" />
    </svg>
  );
}

export function IconSoundOff(): ReactElement {
  return (
    <svg
      className="ui-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="3,7 7,7 11,3 11,17 7,13 3,13" />
      <line x1="14" y1="7" x2="18" y2="13" />
      <line x1="18" y1="7" x2="14" y2="13" />
    </svg>
  );
}

export function IconCheck(): ReactElement {
  return (
    <svg
      className="ui-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="4,10.5 8.2,14.5 16,5.5" />
    </svg>
  );
}

export function IconDiamond(): ReactElement {
  return (
    <svg
      className="ui-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="10,2.5 17.5,10 10,17.5 2.5,10" />
    </svg>
  );
}

export function IconTriangleWarn(): ReactElement {
  return (
    <svg
      className="ui-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="10,3 18,17 2,17" />
      <line x1="10" y1="8.5" x2="10" y2="12.5" />
      <circle cx="10" cy="14.8" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconCrossCrash(): ReactElement {
  return (
    <svg
      className="ui-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  );
}
