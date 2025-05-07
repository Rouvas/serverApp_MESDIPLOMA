// src/dialog/services/dialog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NlpService } from '../nlp/nlp.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { BayesianService, Ranking } from '../bayesian/bayesian.service';
import { SymptomInstanceDto } from './dto/symptom-instance.dto';
import { Scenario } from '../scenarios/scenario.schema';
import { ScenarioTrack, Session } from './interfaces/session.interface';

@Injectable()
export class DialogService {
  private sessions = new Map<string, Session>();

  constructor(
    private readonly nlp: NlpService,
    private readonly scenariosSvc: ScenariosService,
    private readonly bayes: BayesianService,
  ) {}

  async start(text: string) {
    const instances = await this.nlp.extract(text);
    const fullRanking = await this.bayes.calculateScores(instances);
    const topDiseases = fullRanking.slice(0, 3).map((r) => r.disease);

    const scenarioArrays = await Promise.all(
      topDiseases.map((d) => this.scenariosSvc.findByDiseaseKey(d)),
    );

    // <-- Патчим здесь
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

    // <-- И патчим здесь
    const tracks: ScenarioTrack[] = goodScenarios.map((s) => ({
      scenarioId: (s as any)._id.toString(),
      askedKeys: new Set(instanceKeys),
    }));

    const dialogId = randomUUID();
    this.sessions.set(dialogId, { instances, tracks });

    const nextQuestion = this.pickNextQuestion(goodScenarios, instanceKeys);
    return {
      dialogId,
      instances,
      ranking: fullRanking,
      scenarios: goodScenarios,
      nextQuestion,
    };
  }

  async next(dialogId: string, key: string, answer: string) {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);

    const presence = answer.trim().toLowerCase() === 'yes';
    const newInst: SymptomInstanceDto = { key, presence };
    const idx = session.instances.findIndex((i) => i.key === key);
    if (idx >= 0) session.instances[idx] = newInst;
    else session.instances.push(newInst);

    for (const track of session.tracks) {
      track.askedKeys.add(key);
    }

    const fullRanking = await this.bayes.calculateScores(session.instances);
    const scenarioObjs = await Promise.all(
      session.tracks.map((t) => this.scenariosSvc.findById(t.scenarioId)),
    );

    const askedKeys = new Set(session.instances.map((i) => i.key));
    const nextQuestion = this.pickNextQuestion(
      scenarioObjs.filter((s) => !!s) as any,
      askedKeys,
    );
    const finished = nextQuestion === null;

    return {
      dialogId,
      instances: session.instances,
      ranking: fullRanking,
      scenarios: scenarioObjs,
      nextQuestion,
      finished,
    };
  }

  async saveDialog(dialogId: string, userId: string) {
    const session = this.sessions.get(dialogId);
    if (!session) throw new NotFoundException(`Session ${dialogId} not found`);
    console.log(session)
    return session;
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
