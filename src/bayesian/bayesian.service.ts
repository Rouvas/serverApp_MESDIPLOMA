import { Injectable } from '@nestjs/common';
import { DiseasesService } from '../diseases/diseases.service';
import { Disease } from '../diseases/disease.schema';

export interface Ranking {
  disease: Disease;
  score: number;
}

@Injectable()
export class BayesianService {
  constructor(private readonly diseaseService: DiseasesService) {}

  /**
   * Ранжирует заболевания по апостериорной вероятности
   */
  async calculateScores(symptoms: string[]): Promise<Ranking[]> {
    const diseases = await this.diseaseService.findAllDiseases();
    const results = diseases.map((d) => {
      let score = d.prior;
      // если d.symptoms — Map<string, number>:
      for (const [symptom, p] of d.symptoms) {
        score *= symptoms.includes(symptom) ? p : 1 - p;
      }
      return { disease: d, score };
    });
    return results.sort((a, b) => b.score - a.score);
  }
}
