import { Module } from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { DiseasesController } from './diseases.controller';
import { Disease, DiseaseSchema, SymptomRule, SymptomRuleSchema } from './disease.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Disease.name, schema: DiseaseSchema }]),
    MongooseModule.forFeature([{ name: SymptomRule.name, schema: SymptomRuleSchema }]),
  ],
  providers: [DiseasesService],
  controllers: [DiseasesController],
  exports: [DiseasesService],
})
export class DiseasesModule {}
