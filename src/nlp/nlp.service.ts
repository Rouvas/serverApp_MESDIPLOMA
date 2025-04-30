// src/symptoms/symptoms.service.ts
import { Injectable } from '@nestjs/common';

interface SymptomPattern {
  key: string; // canonical name, e.g. "кашель"
  patterns: RegExp[]; // regex-список синонимов
}

const SYMPTOM_PATTERNS: SymptomPattern[] = [
  {
    key: 'лихорадка',
    patterns: [/\b(лихорадк[аи]|жар|температур[аи])\b/gi],
  },
  {
    key: 'кашель',
    patterns: [/\b(кашель|кашляю|кашляешь)\b/gi],
  },
  {
    key: 'боль_в_горле',
    patterns: [/\b(боль в горле|горло болит|комок в горле)\b/gi],
  },
  // …допиши остальные симптомы…
];

@Injectable()
export class NlpService {
  /**
   * Возвращает массив фактов-симптомов (strings) и их контекст:
   * [ { key, presence, severity?, durationDays? } ]
   */
  extract(text: string): Array<{
    key: string;
    presence: boolean;
    severity?: number;
    durationDays?: number;
  }> {
    const lower = text.toLowerCase();
    const results: Map<
      string,
      { severity?: number; durationDays?: number; presence: boolean }
    > = new Map();

    // 1) Ищем отрицания: «не кашляю», «без кашля»
    const negations = [
      /\bне\s+(кашляю|кашляешь|кашляют|кашлял[аи]?)\b/gi,
      /\bбез\s+кашля\b/gi,
      // …и т. д. для других симптомов…
    ];

    // 2) Для каждого шаблона симптома
    for (const { key, patterns } of SYMPTOM_PATTERNS) {
      let found = false;
      for (const re of patterns) {
        if (re.test(lower)) {
          found = true;
          break;
        }
      }
      if (!found) continue;

      // 3) Определяем presence: если нашли отрицание конкретно этого симптома — presence=false
      const isNegated = negations.some((re) => re.test(lower));
      const presence = !isNegated;

      // 4) Ищем «severity» (цифры + слова «сильный», «легкий»)
      const sevMatch = /(\d+)\s*дн(я|ей)/.exec(lower);
      const durationDays = sevMatch ? parseInt(sevMatch[1], 10) : undefined;

      const strengthMatch = /\b(сильн[а-я]*)\s+/.exec(lower);
      const severity = strengthMatch
        ? strengthMatch[1].includes('сильн')
          ? 4
          : undefined
        : undefined;

      results.set(key, { presence, severity, durationDays });
    }

    // Превращаем в массив ключей
    return Array.from(results.entries()).map(([key, ctx]) => ({
      key,
      presence: ctx.presence,
      severity: ctx.severity,
      durationDays: ctx.durationDays,
    }));
  }
}
