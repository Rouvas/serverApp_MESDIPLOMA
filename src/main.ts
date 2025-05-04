import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1) Защита HTTP-заголовков
  app.use(helmet());

  // 2) Логирование всех входящих запросов
  app.use(morgan('combined'));

  // 3) Разрешить CORS
  app.enableCors();

  // 4) Глобальная валидация входящих DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // отбрасывает неизвестные поля
      forbidNonWhitelisted: true, // возвращает ошибку при неизвестных полях
      transform: true, // автоматически преобразует payload в нужные типы
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Приложение запущено на http://localhost:${port}`);
}
bootstrap();
