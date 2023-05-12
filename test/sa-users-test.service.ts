import { INestApplication } from '@nestjs/common';
import { UserInputModel } from '../src/features/users/dto/input-models/user-input-model';
import request from 'supertest';

export class SaUsersTestService {
  constructor(private app: INestApplication) {}
  getUserInputModel(n: number) {
    return {
      login: `user${n}`,
      password: `password${n}`,
      email: `email${n}@gmail.com`,
    };
  }
  async createUser(user: any, statusCode: number) {
    return request(this.app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user)
      .expect(statusCode);
  }
  async createSetOfUsers(startNumber: number, endNumber: number) {
    for (let i = startNumber; i <= endNumber; i++) {
      const user: UserInputModel = this.getUserInputModel(i);
      await this.createUser(user, 201);
    }
  }
}
