import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogController } from './dialog.controller';
import { BayesianModule } from '../bayesian/bayesian.module';
import { ScenariosModule } from '../scenarios/scenarios.module';
import { NlpModule } from '../nlp/nlp.module';

@Module({
  imports: [NlpModule, ScenariosModule, BayesianModule],
  providers: [DialogService],
  controllers: [DialogController],
})
export class DialogModule {}
