import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
import { pipeSetup } from './pipe.setup';
import { exceptionFilterSetup } from './exception-filter.setup';
import { swaggerSetup } from './swagger-setup';

export function configApp(app: INestApplication) {
  app.enableCors();
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  pipeSetup(app);
  exceptionFilterSetup(app);
  swaggerSetup(app);
}
