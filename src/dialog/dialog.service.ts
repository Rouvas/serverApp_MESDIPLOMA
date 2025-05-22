import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NlpService } from '../nlp/nlp.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { BayesianService } from '../bayesian/bayesian.service';
import { SymptomInstanceDto } from './dto/symptom-instance.dto';
import { Scenario } from '../scenarios/scenario.schema';
import { ScenarioTrack, Session } from './interfaces/session.interface';
import { StoriesService } from '../stories/services/stories.service';

// Максимальное количество элементов для top-ranking
const MAX_RANKING = 4;

@Injectable()
export class DialogService {
  // Хранилище сессий диалога: dialogId -> Session
  private sessions = new Map<string, Session>();

  constructor(
    private readonly nlp: NlpService,
    private readonly scenariosSvc: ScenariosService,
    private readonly bayes: BayesianService,
    private readonly story: StoriesService,
  ) {}

  /**
   * Старт нового диалога: анализируем ввод текста, вычисляем вероятности,
   * выбираем сценарии и готовим первый вопрос
   */
  async start(text: string) {
    // Извлечение симптомов из текста пользователя
    const instances = await this.nlp.extract(text);

    // Получаем полный рейтинг вероятностей всех заболеваний
    const baseRanking = await this.bayes.calculateScores(instances);

    // Пересчет процентов для fullRanking с суммой ровно 100%
    const sumFull = baseRanking.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumulativeFull = 0;
    const fullRanking = baseRanking.map((r, idx) => {
      const rawPct = (r.score / sumFull) * 100;
      // Для последнего элемента компенсируем остаток, чтобы сумма была 100
      const pct =
        idx === baseRanking.length - 1
          ? 100 - cumulativeFull
          : Math.floor(rawPct);
      cumulativeFull += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });

    // Выбираем топ-N заболеваний для более детального рассмотрения
    const rawTop = baseRanking.slice(0, MAX_RANKING);
    const sumTop = rawTop.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumulativeTop = 0;
    const topRanking = rawTop.map((r, idx) => {
      const rawPct = (r.score / sumTop) * 100;
      // Аналогично компенсируем остаток в топ-рейтинге
      const pct =
        idx === rawTop.length - 1 ? 100 - cumulativeTop : Math.floor(rawPct);
      cumulativeTop += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });

    // Определяем ключи топ-заболеваний для поиска соответствующих сценариев
    const topDiseases = rawTop.map((r) => r.disease);
    const scenarioArrays = await Promise.all(
      topDiseases.map((d) => this.scenariosSvc.findByDiseaseKey(d)),
    );

    // Формируем уникальный список сценариев
    const uniqueScenarios = Array.from(
      new Map<string, Scenario>(
        scenarioArrays
          .flat()
          .map((s) => [(s as any)._id.toString(), s] as [string, Scenario]),
      ).values(),
    );

    // Отбираем релевантные сценарии на основе совпадения ключей симптомов
    const instanceKeys = new Set(instances.map((i) => i.key));
    const goodScenarios = uniqueScenarios
      .map((s) => {
        // Доля покрытия: сколько ключей сценария уже встречено
        const hits = s.ruleKeys.filter((k) => instanceKeys.has(k)).length;
        return { scenario: s, coverage: hits / s.ruleKeys.length };
      })
      .filter((x) => x.coverage > 0) // Оставляем те, что хоть по чему-то совпали
      .sort((a, b) => b.coverage - a.coverage)
      .slice(0, 3) // Берем топ-3 сценария
      .map((x) => x.scenario);

    // Инициализация треков: для каждого сценария хранится set заданных вопросов
    const tracks: ScenarioTrack[] = goodScenarios.map((s) => ({
      scenarioId: (s as any)._id.toString(),
      askedKeys: new Set(instanceKeys),
    }));

    // Создаем новую сессию диалога и сохраняем ее
    const dialogId = randomUUID();
    this.sessions.set(dialogId, { instances, tracks, questionHistory: [] });

    // Подсчет общего числа уникальных вопросов по всем выбранным сценариям
    const allQuestionKeys = new Set<string>();
    goodScenarios.forEach((s) =>
      s.questions.forEach((q) => allQuestionKeys.add(q.key)),
    );
    const totalQuestions = allQuestionKeys.size;

    // Номер текущего вопроса (первый шаг)
    const questionNumber = 1;
    const percentComplete = 0; // пока нет ответов, процент = 0

    // Определяем текст и ключ следующего вопроса
    const nextQuestion = this.pickNextQuestion(goodScenarios, instanceKeys);
    const finished = nextQuestion === null;

    return {
      dialogId,
      instances,
      fullRanking,
      topRanking,
      scenarios: goodScenarios,
      nextQuestion,
      questionNumber,
      totalQuestions,
      percentComplete,
      finished,
    };
  }

  /**
   * Обработка ответа пользователя: обновляем инстансы, рейтинги,
   * историю вопросов и вычисляем следующий вопрос
   */
  async next(dialogId: string, key: string, answer: string) {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    // Интерпретируем ответ как да/нет
    const presence = answer.trim().toLowerCase() === 'yes';
    const newInst: SymptomInstanceDto = { key, presence };

    // Обновляем или добавляем новую запись о симптоме
    const idx = session.instances.findIndex((i) => i.key === key);
    if (idx >= 0) session.instances[idx] = newInst;
    else session.instances.push(newInst);

    // Отмечаем вопрос как заданный во всех треках сценариев
    for (const track of session.tracks) track.askedKeys.add(key);

    // Пересчет рейтингов
    const baseRanking = await this.bayes.calculateScores(session.instances);

    // fullRanking с процентами
    const sumFull = baseRanking.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumulativeFull = 0;
    const fullRanking = baseRanking.map((r, idx) => {
      const rawPct = (r.score / sumFull) * 100;
      const pct =
        idx === baseRanking.length - 1
          ? 100 - cumulativeFull
          : Math.floor(rawPct);
      cumulativeFull += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });

    // topRanking с относительными процентами внутри топ-4
    const rawTop = baseRanking.slice(0, MAX_RANKING);
    const sumTop = rawTop.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumulativeTop = 0;
    const topRanking = rawTop.map((r, idx) => {
      const rawPct = (r.score / sumTop) * 100;
      const pct =
        idx === rawTop.length - 1 ? 100 - cumulativeTop : Math.floor(rawPct);
      cumulativeTop += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });

    // Загрузка сценариев для текущей сессии
    const scenarioObjs = await Promise.all(
      session.tracks.map((t) => this.scenariosSvc.findById(t.scenarioId)),
    );

    // Сохраняем историю вопроса и ответа
    const questionText =
      scenarioObjs.flatMap((s) => s.questions).find((q) => q.key === key)
        ?.text ?? key;
    session.questionHistory.push({ key, text: questionText, answer: presence });

    // Определяем следующий вопрос и статус завершения
    const askedKeys = new Set(session.instances.map((i) => i.key));
    const nextQuestion = this.pickNextQuestion(scenarioObjs as any, askedKeys);
    const finished = nextQuestion === null;

    // Подсчет прогресса диалога
    const allKeys = new Set<string>();
    scenarioObjs.forEach((s) => s.questions.forEach((q) => allKeys.add(q.key)));
    const answeredCount = askedKeys.size;
    const questionNumber = finished
      ? session.questionHistory.length
      : session.questionHistory.length + 1;
    const totalQuestions = allKeys.size;
    const percentComplete = finished
      ? 100
      : totalQuestions
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0;

    return {
      dialogId,
      instances: session.instances,
      fullRanking,
      topRanking,
      scenarios: scenarioObjs,
      nextQuestion,
      questionNumber,
      totalQuestions,
      percentComplete,
      finished,
    };
  }

  /**
   * Сохранение истории диалога и статистики
   */
  async saveDialog(dialogId: string, userId: string) {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    // Подготовка статистики: сколько вопросов и сценариев
    const statistics = {
      questionCount: session.questionHistory.length,
      scenarioCount: session.tracks.length,
    };
    const scenarioIds = session.tracks.map((t) => t.scenarioId);

    // Пересчет рейтингов перед сохранением
    const baseRanking = await this.bayes.calculateScores(session.instances);

    // fullRanking и topRanking с процентами (логика аналогична выше)
    const sumFull = baseRanking.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumulativeSave = 0;
    const fullRanking = baseRanking.map((r, idx) => {
      const rawPct = (r.score / sumFull) * 100;
      const pct =
        idx === baseRanking.length - 1
          ? 100 - cumulativeSave
          : Math.floor(rawPct);
      cumulativeSave += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });
    const rawTop = baseRanking.slice(0, MAX_RANKING);
    const sumTop = rawTop.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumulativeSaveTop = 0;
    const topRanking = rawTop.map((r, idx) => {
      const rawPct = (r.score / sumTop) * 100;
      const pct =
        idx === rawTop.length - 1
          ? 100 - cumulativeSaveTop
          : Math.floor(rawPct);
      cumulativeSaveTop += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });

    // Сохранение диалога в БД
    const dialog = await this.story.saveStory({
      dialogId,
      userId,
      scenarioIds,
      questionHistory: session.questionHistory,
      instances: session.instances,
      fullRanking,
      topRanking,
      statistics,
    });

    // Удаляем сессию после сохранения
    this.sessions.delete(dialogId);
    return { ...dialog, fullRanking, topRanking };
  }

  /**
   * Выбирает следующий незаданный вопрос из списка сценариев
   */
  private pickNextQuestion(
    scenarios: Array<{ questions: Array<{ key: string; text: string }> }>,
    askedKeys: Set<string>,
  ): { key: string; text: string } | null {
    for (const scen of scenarios) {
      const q = scen.questions.find((q) => !askedKeys.has(q.key));
      if (q) return q;
    }
    return null; // вопросов больше нет
  }
}
