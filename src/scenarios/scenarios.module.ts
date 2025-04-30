import { Module } from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { ScenariosController } from './scenarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Scenario, ScenarioSchema } from './scenario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scenario.name, schema: ScenarioSchema },
    ]),
  ],
  providers: [ScenariosService],
  controllers: [ScenariosController],
  exports: [ScenariosService],
})
export class ScenariosModule {}
