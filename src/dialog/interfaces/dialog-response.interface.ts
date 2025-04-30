import { Ranking } from '../../bayesian/bayesian.service';
import { Scenario } from '../../scenarios/scenario.schema';

export interface DialogStartResponse {
  dialogId: string;
  symptoms: string[];
  scenario: Scenario;
  nextQuestion: { text: string; key: string; } | null;
  ranking: Ranking[];
}

export interface DialogAnswerResponse {
  dialogId: string;
  facts: string[];
  scenario: Scenario;
  nextQuestion: { text: string; key: string; } | null;
  ranking: Ranking[];
  finished: boolean;
}
