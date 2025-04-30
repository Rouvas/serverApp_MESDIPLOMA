import { Module } from '@nestjs/common';
import { BayesianService } from './bayesian.service';
import { DiseasesModule } from '../diseases/diseases.module';

@Module({
  imports: [DiseasesModule],
  providers: [BayesianService],
  exports: [BayesianService],
})
export class BayesianModule {}
