import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';
import { UsersService } from '../users/services/users.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { DiseasesService } from '../diseases/diseases.service';
import { SessionService } from '../session/services/session.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Session, SessionSchema } from '../session/schemas/session.schema';
import { Scenario, ScenarioSchema } from '../scenarios/scenario.schema';
import { Disease, DiseaseSchema } from '../diseases/schemas/disease.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    MongooseModule.forFeature([
      { name: Scenario.name, schema: ScenarioSchema },
    ]),
    MongooseModule.forFeature([{ name: Disease.name, schema: DiseaseSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService, UsersService, ScenariosService, DiseasesService, SessionService],
  exports: [AdminService],
})
export class AdminModule {}
