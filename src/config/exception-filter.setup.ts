import { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/exception-filters/http-exception.filter';

export function exceptionFilterSetup(app: INestApplication) {
  app.useGlobalFilters(new HttpExceptionFilter());
}
