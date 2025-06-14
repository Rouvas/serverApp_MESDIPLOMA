import { Module } from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { DiseasesController } from './diseases.controller';
import { Disease, DiseaseSchema } from './schemas/disease.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Disease.name, schema: DiseaseSchema }]),
  ],
  providers: [DiseasesService],
  controllers: [DiseasesController],
  exports: [DiseasesService],
})
export class DiseasesModule {}
