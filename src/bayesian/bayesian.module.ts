import { Module } from '@nestjs/common';
import { BayesianService } from './bayesian.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Disease,
  DiseaseSchema,
  SymptomRule,
  SymptomRuleSchema,
} from '../diseases/disease.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Disease.name, schema: DiseaseSchema }]),
    MongooseModule.forFeature([
      { name: SymptomRule.name, schema: SymptomRuleSchema },
    ]),
  ],
  // imports: [DiseasesModule],
  providers: [BayesianService],
  exports: [BayesianService],
})
export class BayesianModule {}
