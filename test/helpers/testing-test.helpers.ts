import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export class TestingTestHelpers {
  constructor(private app: INestApplication) {}
  async clearDb() {
    return request(this.app.getHttpServer())
      .delete('/testing/all-data')
      .expect(204);
  }
}
