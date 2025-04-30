// src/dialog/services/dialog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { NlpService } from '../nlp/nlp.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { randomUUID } from 'crypto';
import { ScenarioTrack, Session } from './interfaces/session.interface';
import { BayesianService, Ranking } from '../bayesian/bayesian.service';
import { SymptomInstanceDto } from './dto/symptom-instance.dto';
import { Scenario } from '../scenarios/scenario.schema';

@Injectable()
export class DialogService {
  private sessions = new Map<string, Session>();

  constructor(
    private readonly nlp: NlpService,
    private readonly scenariosSvc: ScenariosService,
    private readonly bayes: BayesianService,
  ) {}

  /** Старт — запускаем сразу по нескольким сценариям */
  async start(text: string) {
    // 1) Извлекаем исходные симптомы, которые назвал пользователь
    const instances = this.nlp.extract(text);

    // 2) Полный байесовский рейтинг с учетом найденных симптомов
    const fullRanking: Ranking[] = await this.bayes.calculateScores(instances);

    // 3) Берём топ-3 диагноза согласно рейтингу
    const topDiseases = fullRanking.slice(0, 3).map((r) => r.disease);

    // 4) Для каждого диагноза получаем все вопросники
    const scenarioArrays = await Promise.all(
      topDiseases.map((d) => this.scenariosSvc.findByDiseaseKey(d)),
    );
    const uniqueScenarios = Array.from(
      new Map(
        scenarioArrays.flat().map((s: any) => [s._id.toString(), s]),
      ).values(),
    ) as Scenario[];

    // 5) Оставляем только сценарии с ненулевым покрытием ruleKeys
    const instanceKeys = new Set(instances.map((i) => i.key));
    const scenariosWithCov = uniqueScenarios
      .map((s) => {
        const hits = s.ruleKeys.filter((k) => instanceKeys.has(k)).length;
        return { scen: s, coverage: hits / s.ruleKeys.length };
      })
      .filter((x) => x.coverage > 0) // убрать те, что не покрывают ни одного ключа
      .sort((a, b) => b.coverage - a.coverage)
      .slice(0, 3) // можно ограничить число треков
      .map((x) => x.scen);

    // 6) Инициализируем треки
    const askedKeys = new Set(instances.map((i) => i.key));
    const tracks: ScenarioTrack[] = scenariosWithCov.map((s: any) => ({
      scenarioId: s._id.toString(),
      askedKeys: new Set(askedKeys),
    }));

    // 7) Сохраняем сессию
    const dialogId = randomUUID();
    this.sessions.set(dialogId, { instances, tracks });

    // 8) Первый вопрос — из первой не исчерпанной ветки
    const nextQuestion = await this.pickNextQuestion(
      scenariosWithCov,
      askedKeys,
    );

    return {
      dialogId,
      instances,
      ranking: fullRanking,
      tracks: scenariosWithCov,
      nextQuestion,
    };
  }

  /** Обработка ответа — ходим по всем веткам, обновляем факты и ищем следующий вопрос */
  async next(dialogId: string, key: string, answer: string) {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    // 1) Добавляем/обновляем факт
    const presence = answer.trim().toLowerCase() === 'yes';
    const newInst: SymptomInstanceDto = { key, presence };
    const idx = session.instances.findIndex((i) => i.key === key);
    if (idx >= 0) session.instances[idx] = newInst;
    else session.instances.push(newInst);

    // 2) Обновляем все tracks — отмечаем, что в каждой ветке мы задали этот вопрос
    for (const track of session.tracks) {
      track.askedKeys.add(key);
    }

    // 3) Пересчитываем рейтинг
    const fullRanking: Ranking[] = await this.bayes.calculateScores(
      session.instances,
    );

    // 4) Обновлённое множество заданных ключей
    const askedKeys = new Set(session.instances.map((i) => i.key));

    // 5) Снова ищем следующий вопрос по трекам
    //    + собираем сами объекты Scenario для UI
    const scenarioObjs = await Promise.all(
      session.tracks.map((t) => this.scenariosSvc.findById(t.scenarioId)),
    );
    const nextQuestion = await this.pickNextQuestion(
      scenarioObjs.filter((s) => !!s) as any,
      askedKeys,
    );

    const finished = nextQuestion === null;

    return {
      dialogId,
      instances: session.instances,
      ranking: fullRanking,
      tracks: scenarioObjs,
      nextQuestion,
      finished,
    };
  }

  /** Вспомогательный: из списка сценариев и уже заданных ключей выбирает первый вопрос */
  private async pickNextQuestion(
    scenarios: Array<{ questions: Array<{ key: string; text: string }> }>,
    askedKeys: Set<string>,
  ): Promise<{ key: string; text: string } | null> {
    for (const scen of scenarios) {
      const q = scen.questions.find((q) => !askedKeys.has(q.key));
      if (q) return q;
    }
    return null;
  }
}
