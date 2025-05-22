import { Module } from '@nestjs/common';
import { BayesianService } from './bayesian.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Disease,
  DiseaseSchema,
} from '../diseases/schemas/disease.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Disease.name, schema: DiseaseSchema }]),
  ],
  providers: [BayesianService],
  exports: [BayesianService],
})
export class BayesianModule {}
