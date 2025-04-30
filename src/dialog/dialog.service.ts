import { Injectable, NotFoundException } from '@nestjs/common';
import { NlpService } from '../nlp/nlp.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { randomUUID } from 'crypto';
import { BayesianService, Ranking } from '../bayesian/bayesian.service';
import { SymptomInstanceDto } from './dto/symptom-instance.dto';
import { DialogAnswerResponse } from './interfaces/dialog-response.interface';

interface Session {
  scenarioId: string;
  instances: SymptomInstanceDto[];
}

@Injectable()
export class DialogService {
  private sessions = new Map<string, Session>();

  constructor(
    private readonly nlp: NlpService,
    private readonly scenariosSvc: ScenariosService,
    private readonly bayesianSvc: BayesianService,
  ) {}

  /** Начало диалога */
  async start(text: string) {
    const instances = this.nlp.extract(text);
    const keys = instances.map((i) => i.key);

    const scenarios = await this.scenariosSvc.findRelevant(keys);
    if (!scenarios.length) return { message: 'Сценарии не найдены', instances };

    const scenario = scenarios[0];
    const ranking: Ranking[] =
      await this.bayesianSvc.calculateScores(instances);

    const dialogId = randomUUID();
    this.sessions.set(dialogId, {
      scenarioId: scenario._id.toString(),
      instances,
    });

    // первый вопрос, чей key ещё не в keys
    const nextQuestion =
      scenario.questions.find((q) => !keys.includes(q.key)) || null;

    return { dialogId, instances, scenario, nextQuestion, ranking };
  }

  /** Продолжение диалога */
  async next(
    dialogId: string,
    key: string,
    answer: string,
  ): Promise<DialogAnswerResponse> {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    const presence = answer.trim().toLowerCase() === 'yes';
    const newInst: SymptomInstanceDto = { key, presence };

    // обновляем или добавляем
    const idx = session.instances.findIndex((i) => i.key === key);
    if (idx >= 0) session.instances[idx] = newInst;
    else session.instances.push(newInst);

    const scenario = await this.scenariosSvc.findById(session.scenarioId);
    if (!scenario) throw new NotFoundException();

    const askedKeys = session.instances.map((i) => i.key);
    const nextQuestion =
      scenario.questions.find((q) => !askedKeys.includes(q.key)) || null;
    const finished = nextQuestion === null;

    // пересчёт рейтинга
    const ranking = await this.bayesianSvc.calculateScores(session.instances);

    return {
      dialogId,
      facts: session.instances.filter((i) => i.presence).map((i) => i.key),
      scenario,
      nextQuestion,
      ranking,
      finished,
    };
  }
}
