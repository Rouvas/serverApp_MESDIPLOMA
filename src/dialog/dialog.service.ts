import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NlpService } from '../nlp/nlp.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { BayesianService } from '../bayesian/bayesian.service';
import { SymptomInstanceDto } from './dto/symptom-instance.dto';
import { Scenario } from '../scenarios/scenario.schema';
import { ScenarioTrack, Session } from './interfaces/session.interface';
import { StoriesService } from '../stories/services/stories.service';

// ограничитель ranking
const MAX_RANKING = 4;

@Injectable()
export class DialogService {
  private sessions = new Map<string, Session>();

  constructor(
    private readonly nlp: NlpService,
    private readonly scenariosSvc: ScenariosService,
    private readonly bayes: BayesianService,
    private readonly story: StoriesService,
  ) {}

  async start(text: string) {
    const instances = await this.nlp.extract(text);
    const fullRanking = await this.bayes.calculateScores(instances);
    const topDiseases = fullRanking.slice(0, MAX_RANKING).map((r) => r.disease);

    const scenarioArrays = await Promise.all(
      topDiseases.map((d) => this.scenariosSvc.findByDiseaseKey(d)),
    );

    const uniqueScenarios = Array.from(
      new Map<string, Scenario>(
        scenarioArrays
          .flat()
          .map((s) => [(s as any)._id.toString(), s] as [string, Scenario]),
      ).values(),
    );

    const instanceKeys = new Set(instances.map((i) => i.key));
    const goodScenarios = uniqueScenarios
      .map((s) => {
        const hits = s.ruleKeys.filter((k) => instanceKeys.has(k)).length;
        return { scenario: s, coverage: hits / s.ruleKeys.length };
      })
      .filter((x) => x.coverage > 0)
      .sort((a, b) => b.coverage - a.coverage)
      .slice(0, 3)
      .map((x) => x.scenario);

    const tracks: ScenarioTrack[] = goodScenarios.map((s) => ({
      scenarioId: (s as any)._id.toString(),
      askedKeys: new Set(instanceKeys),
    }));

    const dialogId = randomUUID();
    this.sessions.set(dialogId, { instances, tracks, questionHistory: [] });

    const percentComplete = 0;

    const nextQuestion = this.pickNextQuestion(goodScenarios, instanceKeys);
    return {
      dialogId,
      instances,
      ranking: fullRanking.slice(0, MAX_RANKING),
      scenarios: goodScenarios,
      nextQuestion,
      percentComplete,
    };
  }

  async next(dialogId: string, key: string, answer: string) {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    // определяем наличие симптома
    const presence = answer.trim().toLowerCase() === 'yes';

    // обновляем или добавляем новую запись
    const newInst: SymptomInstanceDto = { key, presence };
    const idx = session.instances.findIndex((i) => i.key === key);
    if (idx >= 0) session.instances[idx] = newInst;
    else session.instances.push(newInst);

    // отмечаем ключ как заданный во всех треках
    for (const track of session.tracks) {
      track.askedKeys.add(key);
    }

    // пересчитываем полный рейтинг и обрезаем до топ-N
    const fullRanking = await this.bayes.calculateScores(session.instances);
    const ranking = fullRanking.slice(0, MAX_RANKING);

    // загружаем объекты сценариев
    const scenarioObjs = await Promise.all(
      session.tracks.map((t) => this.scenariosSvc.findById(t.scenarioId)),
    );

    // находим текст последнего вопроса для истории
    const questionText =
      scenarioObjs.flatMap((s) => s.questions).find((q) => q.key === key)
        ?.text ?? key;

    // сохраняем историю вопросов
    session.questionHistory.push({
      key,
      text: questionText,
      answer: presence,
    });

    // ключи уже отвеченных вопросов
    const askedKeys = new Set(session.instances.map((i) => i.key));
    const nextQuestion = this.pickNextQuestion(
      scenarioObjs.filter((s) => !!s) as any,
      askedKeys,
    );
    const finished = nextQuestion === null;

    // собираем все уникальные ключи вопросов из всех сценариев
    const allKeys = new Set<string>();
    scenarioObjs.forEach((s) => s.questions.forEach((q) => allKeys.add(q.key)));

    const answeredCount = askedKeys.size;
    const totalQuestions = allKeys.size;
    const percentComplete = finished
      ? 100
      : totalQuestions
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0;

    return {
      dialogId,
      instances: session.instances,
      ranking,
      scenarios: scenarioObjs,
      nextQuestion,
      percentComplete,
      finished: percentComplete === 100,
    };
  }

  async saveDialog(dialogId: string, userId: string) {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    const statistics = {
      questionCount: session.questionHistory.length,
      scenarioCount: session.tracks.length,
    };
    const scenarioIds = session.tracks.map((t) => t.scenarioId);
    const ranking = await this.bayes.calculateScores(session.instances);

    // сохраняем: в поле createdAt автоматически запишется время сохранения
    const dialog = await this.story.saveStory({
      dialogId,
      userId,
      scenarioIds,
      questionHistory: session.questionHistory,
      instances: session.instances,
      ranking,
      statistics,
    });

    this.sessions.delete(dialogId);
    return dialog;
  }

  private pickNextQuestion(
    scenarios: Array<{ questions: Array<{ key: string; text: string }> }>,
    askedKeys: Set<string>,
  ): { key: string; text: string } | null {
    for (const scen of scenarios) {
      const q = scen.questions.find((q) => !askedKeys.has(q.key));
      if (q) return q;
    }
    return null;
  }
}
