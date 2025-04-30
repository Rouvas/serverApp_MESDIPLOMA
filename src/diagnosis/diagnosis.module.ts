import { Module } from '@nestjs/common';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';
import { NlpModule } from '../nlp/nlp.module';
import { ScenariosModule } from '../scenarios/scenarios.module';
import { BayesianModule } from '../bayesian/bayesian.module';

@Module({
  imports: [
    NlpModule, // модуль для извлечения симптомов из текста
    ScenariosModule, // модуль логических сценариев
    BayesianModule, // модуль байесовского ранжирования
  ],
  controllers: [DiagnosisController],
  providers: [DiagnosisService],
})
export class DiagnosisModule {}
