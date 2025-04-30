// src/dialog/nlp/nlp.service.ts
import { Injectable } from '@nestjs/common';
import { SYMPTOM_PATTERNS } from './symptom-patterns';
import { SymptomInstanceDto } from '../dialog/dto/symptom-instance.dto';

@Injectable()
export class NlpService {
  extract(text: string): SymptomInstanceDto[] {
    const lower = text.toLowerCase();
    const results = new Map<string, SymptomInstanceDto>();

    for (const { key, patterns, negations } of SYMPTOM_PATTERNS) {
      // Проверяем, есть ли совпадение
      let found = false;
      for (const re of patterns) {
        re.lastIndex = 0;
        if (re.test(lower)) {
          found = true;
          break;
        }
      }
      if (!found) continue;

      // Проверяем отрицания
      let isNeg = false;
      for (const re of negations) {
        re.lastIndex = 0;
        if (re.test(lower)) {
          isNeg = true;
          break;
        }
      }

      // Определяем severity и duration, как раньше
      const sevMatch = /\b(сильн[а-я]*)\b/i.exec(lower);
      const severity = sevMatch
        ? sevMatch[1].includes('силь')
          ? 4
          : sevMatch[1].includes('легк')
            ? 2
            : 3
        : undefined;

      const durMatch = /(\d+)\s*дн(я|ей)/i.exec(lower);
      const durationDays = durMatch ? parseInt(durMatch[1], 10) : undefined;

      results.set(key, {
        key,
        presence: !isNeg,
        severity,
        durationDays,
      });
    }

    return Array.from(results.values());
  }
}
