import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
