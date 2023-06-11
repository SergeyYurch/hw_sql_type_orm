import { INestApplication } from '@nestjs/common';
import { UserInputModel } from '../../src/features/users/dto/input-models/user-input-model';
import request from 'supertest';
import { UserViewModel } from '../../src/features/users/dto/view-models/user.view.model';

export class UsersTestHelpers {
  constructor(private app: INestApplication) {}
  async createUser(user: any, statusCode: number): Promise<UserViewModel> {
    console.log('t11');
    console.log(user);
    const result = await request(this.app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user)
      .expect(statusCode);
    return result.body;
  }

  async createSetOfUsers(countOfUserInSet: number, numberOfFirstUserInSet = 1) {
    for (let i = 0; i < countOfUserInSet; i++) {
      const user = this.getUserInputModel(numberOfFirstUserInSet);
      await this.createUser(user, 201);
      numberOfFirstUserInSet++;
    }
  }

  getUserInputModel(number: number): UserInputModel {
    return {
      login: `user${number}`,
      email: `email${number}@gmail.com`,
      password: `password${number}`,
    };
  }
}
