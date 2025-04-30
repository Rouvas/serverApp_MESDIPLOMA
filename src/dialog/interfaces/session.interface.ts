import { SymptomInstanceDto } from '../dto/symptom-instance.dto';

export interface ScenarioTrack {
  scenarioId: string;
  askedKeys: Set<string>;
}

export interface Session {
  instances: SymptomInstanceDto[]; // все факты: yes/no
  tracks: ScenarioTrack[]; // по одному треку на сценарий
}
