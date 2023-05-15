import { LoginInputModel } from '../../src/features/auth/dto/login.input.model';
import request from 'supertest';
import { UsersTestHelpers } from './users.test.helpers';
import { INestApplication } from '@nestjs/common';

export class AuthTestHelpers {
  usersTestService: UsersTestHelpers;
  constructor(private app: INestApplication) {
    this.usersTestService = new UsersTestHelpers(app);
  }
  async loginUser(loginData: LoginInputModel) {
    const result = await request(this.app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `1.2.3.4`)
      .set('User-Agent', `android`)
      .send(loginData)
      .expect(200);
    const cookies = result.get('Set-Cookie');
    const refreshToken =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';
    const accessToken = result.body.accessToken;
    return { refreshToken, accessToken };
  }
}
