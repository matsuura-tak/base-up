import type { ReactElement } from 'react';
import type { DiagnosticAxisScores, Locale } from '../domain/types';
import { t } from '../i18n/dictionary';

interface RadarChartSvgProps {
  readonly locale: Locale;
  readonly axes: DiagnosticAxisScores;
}

const CENTER_X = 120;
const CENTER_Y = 120;
const MAX_RADIUS = 88;
const MIN_POLYGON_RADIUS = 6;
const RING_RATIOS = [0.25, 0.5, 0.75, 1.0] as const;

function polarPoint(index: number, radius: number): { readonly x: number; readonly y: number } {
  const angleRad = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
  return {
    x: Number((CENTER_X + radius * Math.cos(angleRad)).toFixed(2)),
    y: Number((CENTER_Y + radius * Math.sin(angleRad)).toFixed(2)),
  };
}

function buildRingPoints(ratio: number): string {
  const radius = MAX_RADIUS * ratio;
  const pts: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    const p = polarPoint(i, radius);
    pts.push(`${String(p.x)},${String(p.y)}`);
  }
  return pts.join(' ');
}

export function RadarChartSvg({ locale, axes }: RadarChartSvgProps): ReactElement {
  const orderedScores: readonly [number, number, number, number, number] = [
    axes.specComprehension,
    axes.sequenceDesign,
    axes.resourceControl,
    axes.fermiSense,
    axes.hypothesisPrecision,
  ];

  const vertices = orderedScores.map((score, idx) => {
    const normalized = Math.max(0, Math.min(100, score)) / 100;
    const radius = MIN_POLYGON_RADIUS + normalized * (MAX_RADIUS - MIN_POLYGON_RADIUS);
    return polarPoint(idx, radius);
  });

  const polygonPoints = vertices.map((v) => `${String(v.x)},${String(v.y)}`).join(' ');

  const outerVertices = [0, 1, 2, 3, 4].map((idx) => polarPoint(idx, MAX_RADIUS));

  return (
    <div className="radar-frame">
      <svg
        className="radar-svg"
        viewBox="0 0 240 240"
        role="img"
        aria-labelledby="radar-title radar-desc"
        data-testid="diagnostic-radar-chart"
      >
        <title id="radar-title">{t(locale, 'diagnostic.radar.title')}</title>
        <desc id="radar-desc">
          {t(locale, 'diagnostic.radar.desc', {
            s1: axes.specComprehension,
            s2: axes.sequenceDesign,
            s3: axes.resourceControl,
            s4: axes.fermiSense,
            s5: axes.hypothesisPrecision,
          })}
        </desc>

        {RING_RATIOS.map((ratio) => (
          <polygon
            key={String(ratio)}
            className="radar-grid-ring"
            points={buildRingPoints(ratio)}
          />
        ))}

        {outerVertices.map((outer, idx) => (
          <line
            key={String(idx)}
            className="radar-axis-line"
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={outer.x}
            y2={outer.y}
          />
        ))}

        <polygon
          className="radar-score-polygon"
          data-testid="diagnostic-radar-polygon"
          data-vertex-count="5"
          points={polygonPoints}
        />

        {vertices.map((vertex, idx) => (
          <circle
            key={String(idx)}
            className="radar-vertex-dot"
            cx={vertex.x}
            cy={vertex.y}
            r="4"
          />
        ))}
      </svg>
    </div>
  );
}
