import { Module } from '@nestjs/common';
import { NlpService } from './nlp.service';
import { NlpController } from './nlp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Nlp, NlpSchema } from './schemas/nlp.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Nlp.name, schema: NlpSchema }])],
  providers: [NlpService],
  exports: [NlpService],
  controllers: [NlpController],
})
export class NlpModule {}
