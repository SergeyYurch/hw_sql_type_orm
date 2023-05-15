import { INestApplication } from '@nestjs/common';
import { UserInputModel } from '../../src/features/users/dto/input-models/user-input-model';
import request from 'supertest';

export class UsersTestHelpers {
  constructor(private app: INestApplication) {}

  async createUser(user: UserInputModel, statusCode: number) {
    console.log('t11');
    console.log(user);
    return request(this.app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user)
      .expect(statusCode);
  }
}
