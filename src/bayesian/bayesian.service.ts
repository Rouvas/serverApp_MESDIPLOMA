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
   * учитывая штраф за нехарактерные симптомы
   */
  async calculateScores(instances: SymptomInstanceDto[]): Promise<Ranking[]> {
    const diseases = await this.diseaseModel.find().lean().exec();

    const instMap = new Map(instances.map((i) => [i.key, i]));
    const allSymptomKeys = new Set(instances.map((i) => i.key));

    // Штраф для каждого неподтвержденного речения о наличии симптома
    const MISSING_PRESENCE_PENALTY = 0.01;

    const rawScores = diseases.map((d) => {
      let logScore = Math.log(d.prior);

      // обработка фактов о симптомах
      for (const key of allSymptomKeys) {
        const inst = instMap.get(key);
        const rule = d.symptomRules.find((r) => r.name === key);

        if (inst.presence) {
          // если болезнь связана с симптомом — добавляем log(p), иначе штраф
          logScore += Math.log(
            rule ? rule.probability : MISSING_PRESENCE_PENALTY,
          );
        } else {
          // отсутствие симптома: только если болезнь ожидает этот симптом
          if (rule) {
            logScore += Math.log(1 - rule.probability);
          }
        }
      }

      // учесть симптомы болезни, по которым факт неизвестен (разрежение)
      // при необходимости можно игнорировать

      return { disease: d.name, logScore };
    });

    // нормализация через softmax для числовой стабильности
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
