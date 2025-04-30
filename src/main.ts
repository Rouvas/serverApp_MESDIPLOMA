import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1) Защита HTTP-заголовков
  app.use(helmet());

  // 2) Логирование всех входящих запросов
  app.use(morgan('combined'));

  // 3) Разрешить CORS (при необходимости указать настройки доменов)
  app.enableCors();

  // 4) Глобальная валидация входящих DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // отбрасывает неизвестные поля
      forbidNonWhitelisted: true, // бросает ошибку при неизвестных полях
      transform: true, // автоматически преобразует payload в нужные типы
    }),
  );

  app.use(passport.initialize());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Приложение запущено на http://localhost:${port}`);
}
bootstrap();
