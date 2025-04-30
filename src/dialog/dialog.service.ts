import { Injectable, NotFoundException } from '@nestjs/common';
import { NlpService } from '../nlp/nlp.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { BayesianService } from '../bayesian/bayesian.service';
import { DialogAnswerResponse } from './interfaces/dialog-response.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class DialogService {
  // Хранилище сессий: scenarioId → массив подтверждённых симптомов
  private sessions = new Map<string, { scenarioId: string; facts: string[] }>();

  constructor(
    private readonly symptomsSvc: NlpService,
    private readonly scenariosSvc: ScenariosService,
    private readonly bayesianSvc: BayesianService,
  ) {}

  /**
   * Начало диалога: из текста извлекаем симптомы, находим сценарий и первый вопрос
   */
  async start(text: string) {
    // 1) Разбор свободного текста в список симптомов
    const symptoms = this.symptomsSvc.extract(text);

    // 2) Поиск релевантных сценариев
    const scenarios = await this.scenariosSvc.findRelevant(symptoms);
    if (scenarios.length === 0) {
      return { message: 'Подходящие сценарии не найдены', symptoms };
    }
    const scenario = scenarios[0];

    // 3) Ранжирование диагнозов
    const ranking = await this.bayesianSvc.calculateScores(symptoms);

    // 4) Инициализация сессии
    // Генерируем уникальный dialogId
    const dialogId = randomUUID();
    // Сохраняем новую сессию
    this.sessions.set(dialogId, {
      scenarioId: scenario._id.toString(),
      facts: [...symptoms],
    });

    // 5) Первый вопрос сценария
    const nextQuestion = scenario.questions[0] || null;

    return { dialogId, symptoms, scenario, nextQuestion, ranking };
  }

  /**
   * Обработка ответа: обновляем факты и возвращаем следующий вопрос + рейтинг
   */
  async next(
    dialogId: string,
    key: string,
    answer: string,
  ): Promise<DialogAnswerResponse> {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    // Подтверждаем факт
    if (answer.trim() === 'yes') {
      if (!session.facts.includes(key)) session.facts.push(key);
    }

    // Получаем сценарий по session.scenarioId
    const scenario = await this.scenariosSvc.findById(session.scenarioId);
    if (!scenario)
      throw new NotFoundException(`Scenario ${session.scenarioId} not found`);

    // Определяем следующий вопрос
    const idx = scenario.questions.findIndex((q) => q.key === key);
    const nextQuestion =
      idx + 1 < scenario.questions.length ? scenario.questions[idx + 1] : null;
    const finished = nextQuestion === null;

    // Пересчитываем Bayes
    const ranking = await this.bayesianSvc.calculateScores(session.facts);

    return {
      dialogId,
      facts: session.facts,
      scenario,
      nextQuestion,
      ranking,
      finished,
    };
  }
}
