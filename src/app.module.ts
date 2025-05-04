import { Module } from '@nestjs/common';
import { DiseasesModule } from './diseases/diseases.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NlpModule } from './nlp/nlp.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { BayesianModule } from './bayesian/bayesian.module';
import { DialogModule } from './dialog/dialog.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { SessionModule } from './session/session.module';
import { AdminModule } from './admin/admin.module';
import { StoriesModule } from './stories/stories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost/mesdiploma'),
    MailerModule.forRoot({
      transport: 'smtps://work@gaiduchik.com:tboiprfxcoskcfnp@smtp.yandex.ru',
      defaults: {
        from: '"МЭС" <work@gaiduchik.com>',
      },
    }),
    DiseasesModule,
    NlpModule,
    ScenariosModule,
    BayesianModule,
    DialogModule,
    AuthModule,
    UsersModule,
    SessionModule,
    AdminModule,
    StoriesModule,
  ],
})
export class AppModule {}
