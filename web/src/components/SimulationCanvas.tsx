import { useEffect, useRef, type ReactElement } from 'react';
import type { CombinatorCurrentParams, FermiJudgment } from '../domain/types';

export type SimulationCanvasVariant =
  | {
      readonly mode: 'combinator';
      readonly testId: 'combinator-simulation-canvas';
      readonly ariaLabel: string;
      readonly status: string;
      readonly stepIndex: number;
      readonly assignedCount: number;
      readonly params: CombinatorCurrentParams;
      readonly targetOutput: number;
      readonly overloadLimit: number;
      readonly shakeOffsetPx: number;
    }
  | {
      readonly mode: 'fermi';
      readonly testId: 'fermi-simulation-canvas';
      readonly ariaLabel: string;
      readonly status: string;
      readonly stepIndex: number;
      readonly selectedCount: number;
      readonly logError: number | null;
      readonly judgment: FermiJudgment | null;
      readonly shakeOffsetPx: number;
    };

function readToken(style: CSSStyleDeclaration, tokenName: string, fallback: string): string {
  const val = style.getPropertyValue(tokenName).trim();
  return val.length > 0 ? val : fallback;
}

export function SimulationCanvas(props: SimulationCanvasVariant): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) {
      return;
    }

    const computed = window.getComputedStyle(canvas);
    const bgStage = readToken(computed, '--color-surface-stage', 'Canvas');
    const panelBg = readToken(computed, '--color-surface-panel', 'Canvas');
    const borderCol = readToken(computed, '--color-border-default', 'CanvasText');
    const textPrimary = readToken(computed, '--color-text-primary', 'CanvasText');
    const textSecondary = readToken(computed, '--color-text-secondary', 'CanvasText');
    const accent = readToken(computed, '--color-action-primary', 'Highlight');
    const success = readToken(computed, '--color-status-success', 'CanvasText');
    const info = readToken(computed, '--color-status-info', 'Highlight');
    const warning = readToken(computed, '--color-status-warning', 'CanvasText');
    const danger = readToken(computed, '--color-status-danger', 'CanvasText');
    const gridCol = readToken(computed, '--color-chart-grid', 'CanvasText');

    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bgStage;
    ctx.fillRect(0, 0, w, h);

    if (props.shakeOffsetPx !== 0) {
      ctx.translate(props.shakeOffsetPx, 0);
    }

    /* Subtle instrument grid lines */
    ctx.strokeStyle = gridCol;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = 0.25;
    for (let gx = 48; gx < w; gx += 48) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 42; gy < h; gy += 42) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (props.mode === 'combinator') {
      /* Draw 3-step circuit nodes & signal bus */
      const nodeXs = [110, 280, 450] as const;
      const busY = 92;

      ctx.strokeStyle = props.status === 'CRASHED' ? danger : borderCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(36, busY);
      ctx.lineTo(w - 36, busY);
      ctx.stroke();

      if (props.stepIndex >= 1) {
        const activeEndX =
          props.stepIndex >= 3 && props.status === 'STAGE CLEAR'
            ? w - 36
            : (nodeXs[Math.min(2, props.stepIndex - 1)] ?? 110);
        ctx.strokeStyle =
          props.status === 'STAGE CLEAR'
            ? success
            : props.status === 'CRASHED' || props.status === 'FAILED'
              ? danger
              : info;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(36, busY);
        ctx.lineTo(activeEndX, busY);
        ctx.stroke();
      }

      for (let i = 0; i < 3; i += 1) {
        const cx = nodeXs[i]!;
        const stepNum = i + 1;
        const reached = props.stepIndex >= stepNum;
        const isCrashStep = props.status === 'CRASHED' && props.stepIndex === stepNum;

        ctx.fillStyle = panelBg;
        ctx.strokeStyle = isCrashStep
          ? danger
          : reached
            ? props.status === 'STAGE CLEAR'
              ? success
              : accent
            : borderCol;
        ctx.lineWidth = reached ? 3 : 2;
        ctx.beginPath();
        ctx.rect(cx - 44, busY - 28, 88, 56);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = textPrimary;
        ctx.font = '700 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`STEP ${String(stepNum)}`, cx, busY - 4);

        ctx.fillStyle = isCrashStep ? danger : textSecondary;
        ctx.font = '600 12px system-ui, sans-serif';
        const subText = isCrashStep
          ? '✕ HALT'
          : reached
            ? '✓ EXEC'
            : i < props.assignedCount
              ? 'READY'
              : 'EMPTY';
        ctx.fillText(subText, cx, busY + 16);
      }

      /* Output & Heat bar gauges at bottom of board */
      const gaugeY = 168;
      const outRatio = Math.max(
        0,
        Math.min(1, props.targetOutput > 0 ? props.params.output / props.targetOutput : 0),
      );
      const heatRatio = Math.max(
        0,
        Math.min(1, props.overloadLimit > 0 ? props.params.sideEffect / props.overloadLimit : 0),
      );

      ctx.fillStyle = textSecondary;
      ctx.font = '600 12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `OUT ${String(props.params.output)} / ${String(props.targetOutput)}`,
        36,
        gaugeY - 6,
      );
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(36, gaugeY, 210, 14);
      ctx.fillStyle = outRatio >= 1 ? success : info;
      ctx.fillRect(37, gaugeY + 1, Math.round(208 * outRatio), 12);

      ctx.fillStyle = textSecondary;
      ctx.fillText(
        `HEAT ${String(props.params.sideEffect)} / ${String(props.overloadLimit)}`,
        276,
        gaugeY - 6,
      );
      ctx.strokeStyle = borderCol;
      ctx.strokeRect(276, gaugeY, 210, 14);
      ctx.fillStyle =
        props.params.sideEffect > props.overloadLimit
          ? danger
          : heatRatio >= 0.75
            ? warning
            : accent;
      ctx.fillRect(277, gaugeY + 1, Math.round(208 * heatRatio), 12);

      if (props.status === 'STAGE CLEAR' && props.params.score !== null) {
        ctx.fillStyle = success;
        ctx.font = '700 16px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`+${String(props.params.score)} PT`, w - 24, 34);
      }
    } else {
      /* Mode 2: Cluster -> Filter Gate -> Log-Order Target Meter */
      const midY = 104;

      /* Stage 1: Population cluster dots */
      ctx.strokeStyle = props.stepIndex >= 1 ? accent : borderCol;
      ctx.fillStyle = panelBg;
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 46, 112, 116);
      ctx.fillRect(29, 47, 110, 114);

      const dotCols = 4;
      const dotRows = 3;
      for (let r = 0; r < dotRows; r += 1) {
        for (let c = 0; c < dotCols; c += 1) {
          ctx.fillStyle = props.selectedCount >= 1 ? info : borderCol;
          ctx.beginPath();
          ctx.arc(50 + c * 22, 74 + r * 26, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* Stage 2: Filter funnel gate */
      ctx.strokeStyle = props.stepIndex >= 2 ? accent : borderCol;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(176, 56);
      ctx.lineTo(248, 86);
      ctx.lineTo(248, 122);
      ctx.lineTo(176, 152);
      ctx.closePath();
      ctx.fillStyle = panelBg;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textPrimary;
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ACT 1×2×3', 212, midY + 4);

      /* Stage 3: Log-order target scale (-2 .. 0 .. +2) */
      const targetX = 396;
      const scaleW = 244;
      const scaleLeft = targetX - scaleW / 2;
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 2;
      ctx.strokeRect(scaleLeft, 68, scaleW, 72);

      /* Perfect zone (|d| <= 0.5) & Good zone (|d| <= 1.0) */
      const unitPx = scaleW / 4; // -2 to +2 => 4 decades
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = info;
      ctx.fillRect(targetX - unitPx, 70, unitPx * 2, 68);
      ctx.fillStyle = success;
      ctx.fillRect(targetX - unitPx * 0.5, 70, unitPx, 68);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = success;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(targetX, 64);
      ctx.lineTo(targetX, 144);
      ctx.stroke();

      /* Laser beam when firing or judged */
      if (props.stepIndex >= 2) {
        const clampedD = Math.max(-1.85, Math.min(1.85, props.logError ?? 0));
        const impactX = targetX + clampedD * unitPx;
        const beamCol =
          props.judgment === 'PERFECT ORDER'
            ? success
            : props.judgment === 'GOOD RANGE'
              ? info
              : props.judgment === 'OVERKILL'
                ? warning
                : props.judgment === 'UNDERESTIMATE'
                  ? danger
                  : accent;

        ctx.strokeStyle = beamCol;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(248, midY);
        ctx.lineTo(props.stepIndex >= 3 ? impactX : 320, midY);
        ctx.stroke();

        if (props.stepIndex >= 3) {
          ctx.fillStyle = beamCol;
          ctx.beginPath();
          ctx.arc(impactX, midY, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = textSecondary;
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('-1.0', targetX - unitPx, 160);
      ctx.fillText('0 (TARGET)', targetX, 160);
      ctx.fillText('+1.0', targetX + unitPx, 160);
    }

    ctx.restore();
  }, [props]);

  return (
    <div className="canvas-stage-frame">
      <canvas
        ref={canvasRef}
        className="simulation-canvas"
        width={560}
        height={210}
        role="img"
        aria-label={props.ariaLabel}
        data-testid={props.testId}
      />
    </div>
  );
}
