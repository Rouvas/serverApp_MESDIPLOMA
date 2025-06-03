import { SymptomInstanceDto } from '../dto/symptom-instance.dto';

export interface ScenarioTrack {
  scenarioId: string;
  askedKeys: Set<string>;
}

export interface Session {
  instances: SymptomInstanceDto[];
  initialKeys: string[]; // Массив ключей симптомов из начального ввода
  fullRanking: { disease: string; score: number; percentage: number }[];
  topRanking: { disease: string; score: number; percentage: number }[];
  scenarios: any[]; // Список подходящих сценариев после evaluateScenarioRule
  tracks: Array<{ scenarioId: string; askedKeys: Set<string> }>;
  questionHistory: { key: string; text: string; answer: boolean }[];
  finished: boolean;
}

export interface QuestionHistoryItem {
  key: string;
  text: string;
  answer: boolean;
}
