import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { configApp } from './config/config-app';
import { TelegramAdapter } from './adapters/telegram/telegram.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 0);
  // app.setGlobalPrefix('api');
  configApp(app);
  const port = process.env.PORT;
  await app.listen(port);
  const telegramAdapter = await app.resolve<TelegramAdapter>(TelegramAdapter);
  await telegramAdapter.setWebhook();
}
bootstrap();
