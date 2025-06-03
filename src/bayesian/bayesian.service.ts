// src/bayesian/bayesian.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Disease } from '../diseases/schemas/disease.schema';
import { SymptomInstanceDto } from '../dialog/dto/symptom-instance.dto';

export interface Ranking {
  disease: string;
  score: number;
}

@Injectable()
export class BayesianService {
  constructor(
    @InjectModel(Disease.name)
    private readonly diseaseModel: Model<Disease>,
  ) {}

  /**
   * Ранжирует заболевания по апостериорной вероятности,
   * учитывая штраф за нехарактерные симптомы и клинические предикаты,
   * но фильтруя болезни по исходным ключам initialKeys.
   */
  async calculateScores(
    instances: SymptomInstanceDto[],
    initialKeys: string[],
  ): Promise<Ranking[]> {
    const diseases = await this.diseaseModel.find().lean().exec();

    // 1. Оставляем только болезни, у которых есть правило хотя бы по одному из initialKeys
    const relevantDiseases = diseases.filter((d) =>
      d.symptomRules.some((rule) => initialKeys.includes(rule.name)),
    );

    const MISSING_PRESENCE_PENALTY = 0.01;

    // 2. Расчёт логарифмического счёта (logScore) для каждого релевантного диагноза
    const rawScores = relevantDiseases.map((d) => {
      let logScore = Math.log(d.prior);

      for (const inst of instances) {
        const rule = d.symptomRules.find((r) => r.name === inst.key);

        if (inst.presence) {
          if (rule) {
            // Проверяем клинические предикаты (minSeverity, minDurationDays)
            const okSeverity =
              rule.minSeverity == null ||
              (inst.severity ?? 0) >= rule.minSeverity;
            const okDuration =
              rule.minDurationDays == null ||
              (inst.durationDays ?? 0) >= rule.minDurationDays;
            // Если оба ограничения соблюдены — полная вероятность, иначе половинная
            const p =
              okSeverity && okDuration
                ? rule.probability
                : rule.probability * 0.5;
            logScore += Math.log(p);
          } else {
            // Штраф за нехарактерный симптом
            logScore += Math.log(MISSING_PRESENCE_PENALTY);
          }
        } else {
          // Отсутствие симптома — учитывается только если есть правило
          if (rule) {
            logScore += Math.log(1 - rule.probability);
          }
        }
      }

      return { disease: d.name, logScore };
    });

    // 3. Если не осталось ни одной релевантной болезни, возвращаем пустой массив
    if (rawScores.length === 0) {
      return [];
    }

    // 4. Softmax-нормализация для числовой устойчивости
    const maxLog = Math.max(...rawScores.map((r) => r.logScore));
    const exps = rawScores.map((r) => ({
      disease: r.disease,
      exp: Math.exp(r.logScore - maxLog),
    }));
    const sumExp = exps.reduce((sum, x) => sum + x.exp, 0);

    const rankings: Ranking[] = exps.map((x) => ({
      disease: x.disease,
      score: x.exp / sumExp,
    }));

    return rankings.sort((a, b) => b.score - a.score);
  }
}
