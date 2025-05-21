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
   * обрабатывая только те правила (symptomRules), по которым есть факт.
   */
  async calculateScores(instances: SymptomInstanceDto[]): Promise<Ranking[]> {
    const diseases = await this.diseaseModel.find().lean().exec();

    // Map<симптом, DTO> фактов с presence=true/false
    const instMap = new Map(instances.map((i) => [i.key, i]));

    const raw = diseases.map((d) => {
      let score = d.prior;

      for (const rule of d.symptomRules) {
        const inst = instMap.get(rule.name);
        if (!inst) {
          // мы ещё не спрашивали про этот симптом — пропускаем его
          continue;
        }

        const p = rule.probability;
        // проверяем предикаты (severity / duration), если это положительный факт
        if (inst.presence) {
          const okSeverity =
            rule.minSeverity == null ||
            (inst.severity ?? 0) >= rule.minSeverity;
          const okDuration =
            rule.minDurationDays == null ||
            (inst.durationDays ?? 0) >= rule.minDurationDays;
          score *= okSeverity && okDuration ? p : p * 0.5;
        } else {
          // явное отсутствие симптома
          score *= 1 - p;
        }
      }

      return { name: d.name, score };
    });

    // нормализуем в [0,1]
    const total = raw.reduce((sum, x) => sum + x.score, 0) || 1;
    const normalized = raw.map((x) => ({
      name: x.name,
      score: x.score / total,
    }));

    // готовый формат Ranking
    return normalized
      .map((x) => ({ disease: x.name, score: x.score }))
      .sort((a, b) => b.score - a.score);
  }
}
