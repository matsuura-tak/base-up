import type {
  FermiExplanation,
  FermiHypothesisCard,
  FermiJudgment,
  FermiStageDefinition,
  FermiTrapNote,
  Locale,
} from './types';

export interface FermiEvaluationResult {
  readonly judgment: FermiJudgment;
  readonly estimateValue: number;
  readonly baselineValue: number;
  readonly logError: number;
  readonly trapTriggeredCount: number;
  readonly explanation: FermiExplanation;
  readonly selectedCards: readonly [FermiHypothesisCard, FermiHypothesisCard, FermiHypothesisCard];
}

export function evaluateFermiSelection(
  stage: FermiStageDefinition,
  cardIds: readonly [string, string, string],
): FermiEvaluationResult {
  const slot1 = stage.slots[0];
  const slot2 = stage.slots[1];
  const slot3 = stage.slots[2];

  const c1 = slot1?.cards.find((c) => c.id === cardIds[0]);
  const c2 = slot2?.cards.find((c) => c.id === cardIds[1]);
  const c3 = slot3?.cards.find((c) => c.id === cardIds[2]);

  if (!c1 || !c2 || !c3) {
    throw new Error(
      `Invalid Fermi card selection [${cardIds.join(', ')}] in stage ${String(stage.stageId)}`,
    );
  }

  const selectedCards: readonly [FermiHypothesisCard, FermiHypothesisCard, FermiHypothesisCard] = [
    c1,
    c2,
    c3,
  ];
  const estimateValue = c1.numericValue * c2.numericValue * c3.numericValue;
  const logError = Math.log10(estimateValue / stage.baselineValue);
  const trapTriggeredCount = selectedCards.filter((c) => c.isTrap).length;

  let judgment: FermiJudgment;
  const absLogError = Math.abs(logError);
  if (absLogError <= 0.5 && trapTriggeredCount === 0) {
    judgment = 'PERFECT ORDER';
  } else if (absLogError <= 1.0) {
    judgment = 'GOOD RANGE';
  } else if (logError > 1.0) {
    judgment = 'OVERKILL';
  } else {
    judgment = 'UNDERESTIMATE';
  }

  const selectedSet = new Set<string>(cardIds);
  const trapNotes: FermiTrapNote[] = [];
  for (const s of stage.slots) {
    for (const candidate of s.cards) {
      if (candidate.isTrap && candidate.trapReason) {
        trapNotes.push({
          cardId: candidate.id,
          actIndex: s.actIndex,
          cardLabel: candidate.label,
          reason: candidate.trapReason,
          triggeredInCurrentRun: selectedSet.has(candidate.id),
        });
      }
    }
  }

  const showRetryHint = judgment === 'OVERKILL' || judgment === 'UNDERESTIMATE';

  const explanation: FermiExplanation = {
    estimateValue,
    baselineValue: stage.baselineValue,
    logError,
    judgment,
    trapTriggeredCount,
    baselineFormula: stage.baselineFormula,
    baselineBreakdownText: stage.baselineBreakdownText,
    trapNotes,
    showRetryHint,
  };

  return {
    judgment,
    estimateValue,
    baselineValue: stage.baselineValue,
    logError,
    trapTriggeredCount,
    explanation,
    selectedCards,
  };
}

export function formatFermiCompactValue(value: number, locale: Locale): string {
  if (!Number.isFinite(value) || value === 0) {
    return '0';
  }
  const absVal = Math.abs(value);
  if (absVal >= 1000 || absVal < 0.01) {
    const exp = Math.floor(Math.log10(absVal));
    const mantissa = value / Math.pow(10, exp);
    const mantissaText = Number(mantissa.toFixed(2)).toString();
    const sci = `${mantissaText} × 10^${String(exp)}`;

    if (locale === 'ja') {
      if (absVal >= 1e12) {
        return `${sci}（約${Number((value / 1e12).toFixed(2)).toString()}兆）`;
      }
      if (absVal >= 1e8) {
        return `${sci}（約${Number((value / 1e8).toFixed(2)).toString()}億）`;
      }
      if (absVal >= 1e4) {
        return `${sci}（約${Number((value / 1e4).toFixed(2)).toString()}万）`;
      }
      return sci;
    }

    if (absVal >= 1e9) {
      return `${sci} (${Number((value / 1e9).toFixed(2)).toString()}B)`;
    }
    if (absVal >= 1e6) {
      return `${sci} (${Number((value / 1e6).toFixed(2)).toString()}M)`;
    }
    if (absVal >= 1e3) {
      return `${sci} (${Number((value / 1e3).toFixed(2)).toString()}K)`;
    }
    return sci;
  }

  return Number(value.toFixed(4)).toString();
}

export function formatSignedLogError(logError: number): string {
  const rounded = Number(logError.toFixed(2));
  if (rounded > 0) {
    return `+${rounded.toFixed(2)}`;
  }
  return rounded.toFixed(2);
}
