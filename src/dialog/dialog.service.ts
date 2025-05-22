import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NlpService } from '../nlp/nlp.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { BayesianService } from '../bayesian/bayesian.service';
import { SymptomInstanceDto } from './dto/symptom-instance.dto';
import { Session } from './interfaces/session.interface';
import { StoriesService } from '../stories/services/stories.service';
import { evaluateScenarioRule } from '../scenarios/functions/rule-evaluator';

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
    const instances: SymptomInstanceDto[] = await this.nlp.extract(text);
    const instanceKeys = instances.filter((i) => i.presence).map((i) => i.key);

    // Расчет базового рейтинга
    const baseRanking = await this.bayes.calculateScores(instances);

    // Полный рейтинг (fullRanking)
    const sumFull = baseRanking.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumFull = 0;
    const fullRanking = baseRanking.map((r, idx) => {
      const rawPct = (r.score / sumFull) * 100;
      const pct =
        idx === baseRanking.length - 1 ? 100 - cumFull : Math.floor(rawPct);
      cumFull += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });

    // Топ-4 рейтинг (topRanking)
    const rawTop = baseRanking.slice(0, 4);
    const sumTop = rawTop.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumTop = 0;
    const topRanking = rawTop.map((r, idx) => {
      const rawPct = (r.score / sumTop) * 100;
      const pct = idx === rawTop.length - 1 ? 100 - cumTop : Math.floor(rawPct);
      cumTop += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });

    // Загрузка сценариев по топ-болезням и по симптомам
    const topDiseases = rawTop.map((r) => r.disease);
    const byDisease = await Promise.all(
      topDiseases.map((d) => this.scenariosSvc.findByDiseaseKey(d)),
    );
    const allScenarios = await this.scenariosSvc.findAll();
    const bySymptoms = allScenarios.filter((s) =>
      s.ruleKeys.some((k) => instanceKeys.includes(k)),
    );

    const combined = new Map<string, any>();
    for (const s of [...byDisease.flat(), ...bySymptoms]) {
      combined.set(String((s as any)._id), s);
    }
    const scenarios = Array.from(combined.values());

    console.log('[Dialog] Symptoms:', instanceKeys);
    console.log('[Dialog] Top diseases:', topDiseases);
    console.log(
      '[Dialog] Selected scenarios:',
      scenarios.map((s) => s.name),
    );

    const matched = scenarios.filter((s) =>
      evaluateScenarioRule(s.rule, instances),
    );
    const dialogId = randomUUID();

    // Инициализация сессии
    const session = {
      instances,
      fullRanking,
      topRanking,
      scenarios: matched,
      tracks: matched.map((s) => ({
        scenarioId: String(s._id),
        askedKeys: new Set<string>(),
      })),
      questionHistory: [] as { key: string; text: string; answer: boolean }[],
      finished: matched.length === 0,
    };

    this.sessions.set(dialogId, session);

    const nextQuestion = matched.length ? matched[0].questions[0] : null;
    return {
      dialogId,
      instances,
      fullRanking,
      topRanking,
      scenarios: matched,
      nextQuestion,
      questionNumber: nextQuestion ? 1 : 0,
      totalQuestions: nextQuestion ? matched[0].questions.length : 0,
      percentComplete: 0,
      finished: matched.length === 0,
    };
  }

  async next(dialogId: string, key: string, answer: string) {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    // Обработка ответа
    const presence = answer.trim().toLowerCase() === 'yes';
    const idx = session.instances.findIndex((i: any) => i.key === key);
    if (idx >= 0) session.instances[idx].presence = presence;
    else session.instances.push({ key, presence });

    // Отметить вопрос в треке
    const track = session.tracks[0];
    if (!track) throw new NotFoundException(`No active track`);
    if (!track.askedKeys) track.askedKeys = new Set<string>();
    track.askedKeys.add(key);

    // Пересчет рейтингов
    const baseRanking = await this.bayes.calculateScores(session.instances);
    // fullRanking
    const sumFull = baseRanking.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumFull2 = 0;
    session.fullRanking = baseRanking.map((r, idx) => {
      const rawPct = (r.score / sumFull) * 100;
      const pct =
        idx === baseRanking.length - 1 ? 100 - cumFull2 : Math.floor(rawPct);
      cumFull2 += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });
    // topRanking
    const rawTop2 = baseRanking.slice(0, 4);
    const sumTop2 = rawTop2.reduce((sum, r) => sum + r.score, 0) || 1;
    let cumTop2 = 0;
    session.topRanking = rawTop2.map((r, idx) => {
      const rawPct = (r.score / sumTop2) * 100;
      const pct =
        idx === rawTop2.length - 1 ? 100 - cumTop2 : Math.floor(rawPct);
      cumTop2 += pct;
      return { disease: r.disease, score: r.score, percentage: pct };
    });

    // Загрузка сценариев
    const scenarioObjs = await Promise.all(
      session.tracks.map((t: any) => this.scenariosSvc.findById(t.scenarioId)),
    );

    // История вопросов
    const questionText =
      scenarioObjs
        .flatMap((s: any) => s.questions)
        .find((q: any) => q.key === key)?.text || key;
    session.questionHistory.push({ key, text: questionText, answer: presence });

    // Выбор следующего вопроса
    const askedKeys = session.tracks.reduce((set: Set<string>, t: any) => {
      t.askedKeys.forEach((k: string) => set.add(k));
      return set;
    }, new Set<string>());
    const nextQuestion = this.pickNextQuestion(scenarioObjs as any, askedKeys);
    session.finished = !nextQuestion;

    // Прогресс
    const allKeys = new Set<string>();
    scenarioObjs.forEach((s: any) =>
      s.questions.forEach((q: any) => allKeys.add(q.key)),
    );
    const answeredCount = askedKeys.size;
    const questionNumber =
      session.questionHistory.length + (nextQuestion ? 1 : 0);
    const totalQuestions = allKeys.size;
    const percentComplete = session.finished
      ? 100
      : Math.round((answeredCount / totalQuestions) * 100);

    return {
      dialogId,
      instances: session.instances,
      fullRanking: session.fullRanking,
      topRanking: session.topRanking,
      scenarios: scenarioObjs,
      nextQuestion,
      questionNumber,
      totalQuestions,
      percentComplete,
      finished: session.finished,
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
