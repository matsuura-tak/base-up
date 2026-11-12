import { describe, expect, it } from 'vitest';
import { COMBINATOR_STAGES } from '../domain/combinatorStages';
import { FERMI_STAGES } from '../domain/fermiStages';
import { EN_DICTIONARY, JA_DICTIONARY } from '../i18n/dictionary';

function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\{[a-zA-Z0-9_]+\}/g) ?? [];
  return [...new Set(matches)].sort();
}

describe('Bilingual dictionary & stage localization parity', () => {
  it('maintains 100% key and placeholder parity across all 127 ja/en dictionary entries', () => {
    const jaKeys = Object.keys(JA_DICTIONARY).sort();
    const enKeys = Object.keys(EN_DICTIONARY).sort();

    expect(jaKeys).toHaveLength(127);
    expect(enKeys).toHaveLength(127);
    expect(jaKeys).toEqual(enKeys);

    const recordJa: Readonly<Record<string, string>> = JA_DICTIONARY;
    const recordEn: Readonly<Record<string, string>> = EN_DICTIONARY;

    for (const key of jaKeys) {
      const jaVal = recordJa[key] ?? '';
      const enVal = recordEn[key] ?? '';
      expect(jaVal.trim().length, `JA key ${key} must be non-empty`).toBeGreaterThan(0);
      expect(enVal.trim().length, `EN key ${key} must be non-empty`).toBeGreaterThan(0);
      expect(extractPlaceholders(jaVal), `Placeholder parity for ${key}`).toEqual(
        extractPlaceholders(enVal),
      );
    }
  });

  it('provides non-empty ja and en copy for all 10 Combinator stages and all 9 Fermi stages', () => {
    for (const stage of COMBINATOR_STAGES) {
      expect(stage.title.ja.trim().length).toBeGreaterThan(0);
      expect(stage.title.en.trim().length).toBeGreaterThan(0);
      expect(stage.targetConditionText.ja.trim().length).toBeGreaterThan(0);
      expect(stage.targetConditionText.en.trim().length).toBeGreaterThan(0);
      expect(stage.overloadLimitText.ja.trim().length).toBeGreaterThan(0);
      expect(stage.overloadLimitText.en.trim().length).toBeGreaterThan(0);
      for (const mod of stage.modules) {
        expect(mod.name.ja.trim().length).toBeGreaterThan(0);
        expect(mod.name.en.trim().length).toBeGreaterThan(0);
        expect(mod.sideEffectLabel.ja.trim().length).toBeGreaterThan(0);
        expect(mod.sideEffectLabel.en.trim().length).toBeGreaterThan(0);
        expect(mod.effect.label.ja.trim().length).toBeGreaterThan(0);
        expect(mod.effect.label.en.trim().length).toBeGreaterThan(0);
        expect(mod.condition.label.ja.trim().length).toBeGreaterThan(0);
        expect(mod.condition.label.en.trim().length).toBeGreaterThan(0);
      }
    }

    for (const stage of FERMI_STAGES) {
      expect(stage.question.ja.trim().length).toBeGreaterThan(0);
      expect(stage.question.en.trim().length).toBeGreaterThan(0);
      expect(stage.unitLabel.ja.trim().length).toBeGreaterThan(0);
      expect(stage.unitLabel.en.trim().length).toBeGreaterThan(0);
      expect(stage.baselineFormula.ja.trim().length).toBeGreaterThan(0);
      expect(stage.baselineFormula.en.trim().length).toBeGreaterThan(0);
      expect(stage.baselineBreakdownText.ja.trim().length).toBeGreaterThan(0);
      expect(stage.baselineBreakdownText.en.trim().length).toBeGreaterThan(0);
      for (const slot of stage.slots) {
        expect(slot.roleLabel.ja.trim().length).toBeGreaterThan(0);
        expect(slot.roleLabel.en.trim().length).toBeGreaterThan(0);
        for (const card of slot.cards) {
          expect(card.label.ja.trim().length).toBeGreaterThan(0);
          expect(card.label.en.trim().length).toBeGreaterThan(0);
          expect(card.displayValue.ja.trim().length).toBeGreaterThan(0);
          expect(card.displayValue.en.trim().length).toBeGreaterThan(0);
          if (card.isTrap) {
            expect(card.trapReason?.ja.trim().length ?? 0).toBeGreaterThan(0);
            expect(card.trapReason?.en.trim().length ?? 0).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});
