// src/dialog/nlp/nlp.service.ts
import { Injectable } from '@nestjs/common';
import { SYMPTOM_PATTERNS } from './symptom-patterns';
import { SymptomInstanceDto } from '../dialog/dto/symptom-instance.dto';

@Injectable()
export class NlpService {
  extract(text: string): SymptomInstanceDto[] {
    const lower = text.toLowerCase();
    const results: SymptomInstanceDto[] = [];

    for (const { key, synonyms, negations } of SYMPTOM_PATTERNS) {
      // найдём хоть один синоним
      const found = synonyms.some(s => lower.includes(s));
      if (!found) continue;

      // проверим, нет ли в тексте «не X» или «без X»
      const isNeg = negations?.some(n => lower.includes(n)) ?? false;

      results.push({ key, presence: !isNeg });
    }

    return results;
  }
}
