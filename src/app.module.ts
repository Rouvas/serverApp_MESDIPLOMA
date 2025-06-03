import { Module } from '@nestjs/common';
import { DiseasesModule } from './diseases/diseases.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NlpModule } from './nlp/nlp.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { BayesianModule } from './bayesian/bayesian.module';
import { DialogModule } from './dialog/dialog.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { SessionModule } from './session/session.module';
import { AdminModule } from './admin/admin.module';
import { StoriesModule } from './stories/stories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: config.get<string>('MAIL_CREDS'),
        defaults: {
          from: `"${config.get<string>('MAIL_FROM_NAME')}" <${config.get<string>('MAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
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
