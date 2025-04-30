import { Injectable } from '@nestjs/common';
import { NlpService } from '../nlp/nlp.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { BayesianService } from '../bayesian/bayesian.service';

@Injectable()
export class DiagnosisService {
  constructor(
    private readonly symptomsService: NlpService,
    private readonly scenariosService: ScenariosService,
    private readonly bayesianService: BayesianService,
  ) {}

  /** Вспомогательный метод для извлечения по тексту */
  extractFromText(text: string): string[] {
    return this.symptomsService.extract(text);
  }

  /** Основной метод для списка симптомов */
  async diagnoseBySymptoms(symptoms: string[]) {
    const scenarios = await this.scenariosService.findRelevant(symptoms);
    const bayesResults = await this.bayesianService.calculateScores(symptoms);
    const followUpQuestions = scenarios.map((s) => ({
      scenarioId: s._id,
      questions: s.questions
        .filter((q) => !symptoms.includes(q.key))
        .map((q) => ({ text: q.text, key: q.key })),
    }));
    return { symptoms, scenarios, bayesResults, followUpQuestions };
  }

  // /**
  //  * Основной метод:
  //  * 1) Извлекает симптомы из текста;
  //  * 2) Отбирает релевантные сценарии по булевым правилам;
  //  * 3) Ранжирует все болезни по байесовским вероятностям.
  //  */
  // async diagnose(text: string) {
  //   // 1. Извлечение симптомов (пример: ['кашель','лихорадка',...])
  //   const symptoms = this.symptomsService.extract(text);
  //
  //   // 2. Логическая фильтрация - возвращает сценарии, удовлетворяющие правилам
  //   const scenarios = await this.scenariosService.findRelevant(symptoms);
  //
  //   // 3. Байесовское ранжирование всех болезней по симптомам
  //   const bayesResults = await this.bayesianService.calculateScores(symptoms);
  //
  //   const followUpQuestions = scenarios.map((s) => ({
  //     scenarioId: s._id,
  //     questions: s.questions
  //       .filter((q) => !symptoms.includes(q.key))
  //       .map((q) => ({ text: q.text, key: q.key })),
  //   }));
  //
  //   return { symptoms, scenarios, bayesResults, followUpQuestions };
  // }
}
