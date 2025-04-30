import { Injectable, NotFoundException } from '@nestjs/common';
import { NlpService } from '../nlp/nlp.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { randomUUID } from 'crypto';
import { BayesianService, Ranking } from '../bayesian/bayesian.service';
import { SymptomInstanceDto } from './dto/symptom-instance.dto';
import { DialogAnswerResponse } from './interfaces/dialog-response.interface';

interface Session {
  scenarioId: string;
  facts: string[]; // подтверждённые симптомы
  negFacts: string[]; // опровергнутые симптомы
}

@Injectable()
export class DialogService {
  private sessions = new Map<string, Session>();

  constructor(
    private readonly symptomsSvc: NlpService,
    private readonly scenariosSvc: ScenariosService,
    private readonly bayesianSvc: BayesianService,
  ) {}

  /** Начало диалога */
  async start(text: string) {
    const symptoms = this.symptomsSvc.extract(text); // string[]

    const instances: SymptomInstanceDto[] = symptoms.map((name) => ({
      name,
      presence: true,
    }));

    const scenarios = await this.scenariosSvc.findRelevant(symptoms);
    if (scenarios.length === 0) {
      return { message: 'Подходящие сценарии не найдены', symptoms };
    }
    const scenario = scenarios[0];

    const ranking: Ranking[] =
      await this.bayesianSvc.calculateScores(instances);

    const dialogId = randomUUID();
    this.sessions.set(dialogId, {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      scenarioId: scenario._id.toString(),
      facts: [...symptoms],
      negFacts: [],
    });

    // первый вопрос, пропуская уже упомянутые симптомы
    const nextQuestion =
      scenario.questions.find((q) => !symptoms.includes(q.key)) || null;

    return { dialogId, symptoms, scenario, nextQuestion, ranking };
  }

  /** Продолжение диалога */
  async next(
    dialogId: string,
    key: string,
    answer: string,
  ): Promise<DialogAnswerResponse> {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    const ans = answer.trim().toLowerCase();
    if (ans === 'yes') {
      if (!session.facts.includes(key)) session.facts.push(key);
    } else {
      if (!session.negFacts.includes(key)) session.negFacts.push(key);
    }

    const scenario = await this.scenariosSvc.findById(session.scenarioId);
    if (!scenario)
      throw new NotFoundException(`Scenario ${session.scenarioId} not found`);

    // следующий вопрос — первый ещё не заданный и не опровергнутый
    const asked = new Set([...session.facts, ...session.negFacts]);
    const nextQuestion =
      scenario.questions.find((q) => !asked.has(q.key)) || null;
    const finished = nextQuestion === null;

    // собираем все факты в DTO
    const instances: SymptomInstanceDto[] = [
      ...session.facts.map((name) => ({ name, presence: true })),
      ...session.negFacts.map((name) => ({ name, presence: false })),
    ];

    const ranking: Ranking[] =
      await this.bayesianSvc.calculateScores(instances);

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
