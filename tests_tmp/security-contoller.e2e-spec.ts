import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from '../src/common/exception-filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import { UsersQueryRepository } from '../src/users/providers/users.query.repository';
import { delay } from '../src/common/helpers/helpers';
import { UsersRepository } from '../src/users/providers/users.repository';
import { UsersQuerySqlRepository } from '../src/users/providers/users.query-sql.repository';
import { UsersSqlRepository } from '../src/users/providers/users.sql.repository';

const user1 = {
  login: 'user1',
  password: 'password1',
  email: 'email1@gmail.com',
};
const user2 = {
  login: 'user2',
  password: 'password2',
  email: 'email2@gmail.com',
};
const user3 = {
  login: 'user3',
  password: 'password3',
  email: 'email3@gmail.com',
};
const blog1 = {
  name: 'blog1',
  description: 'description1',
  websiteUrl: 'https://youtube1.com',
};
const blog2 = {
  name: 'blog2',
  description: 'description2',
  websiteUrl: 'https://youtube2.com',
};
const blog3 = {
  name: 'blog3',
  description: 'description3',
  websiteUrl: 'https://youtube3.com',
};

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  let cookies: string[];
  let userQueryRepository: UsersQuerySqlRepository;
  let usersRepository: UsersSqlRepository;
  let user1Id: string;
  let user2Id: string;

  let refreshToken1User1: string;
  let refreshToken2User1: string;
  let refreshToken3User1: string;
  let refreshToken1User2: string;

  let deviceId1User1: string;

  let expiredRefreshTokenUser1: string;
  let refreshTokenUser2: string;
  let refreshTokenUser3: string;
  let confirmationCode: string;
  let recoveryCode: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userQueryRepository = moduleFixture.get<UsersQuerySqlRepository>(
      UsersQuerySqlRepository,
    );
    usersRepository = moduleFixture.get<UsersSqlRepository>(UsersSqlRepository);

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        transform: true,
        exceptionFactory: (errors) => {
          const errorsForResponse = [];
          for (const e of errors) {
            const key = Object.keys(e.constraints)[0];
            errorsForResponse.push({
              message: e.constraints[key],
              field: e.property,
            });
          }
          throw new BadRequestException(errorsForResponse);
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });
  afterAll(async () => {
    await disconnect();
    await app.close();
  });

  // ********[HOST]/blogs**********

  //preparation
  it('/testing/all-data (DELETE) clear DB', async () => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });
  it('/sa/users (POST) add new users to the system', async () => {
    //create new user1
    const newUser1 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user1)
      .expect(201);
    user1Id = newUser1.body.id;

    const newUser2 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user2)
      .expect(201);
    user2Id = newUser2.body.id;
  });
  it('POST:[HOST]/auth/login: users login from different devices', async () => {
    //user1 login
    const result1LoginUser1 = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `1.2.3.4`)
      .set('User-Agent', `android`)
      .send({
        loginOrEmail: 'user1',
        password: 'password1',
      })
      .expect(200);
    cookies = result1LoginUser1.get('Set-Cookie');
    refreshToken1User1 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';

    const resultLogin2User1 = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `2.2.3.4`)
      .set('User-Agent', `winda`)
      .send({
        loginOrEmail: 'user1',
        password: 'password1',
      })
      .expect(200);
    cookies = resultLogin2User1.get('Set-Cookie');
    refreshToken2User1 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';

    const resultLogin3User1 = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `3.2.3.4`)
      .set('User-Agent', `mac`)
      .send({
        loginOrEmail: 'user1',
        password: 'password1',
      })
      .expect(200);
    cookies = resultLogin3User1.get('Set-Cookie');
    refreshToken3User1 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';

    const resultLogin1User2 = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `3.2.3.4`)
      .set('User-Agent', `mac`)
      .send({
        loginOrEmail: 'user2',
        password: 'password2',
      })
      .expect(200);
    cookies = resultLogin1User2.get('Set-Cookie');
    refreshToken1User2 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';
  });

  //Returns all devices with active sessions for current user
  it('GET:[HOST]/security/devices: should return code 400 If the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
    const result = await request(app.getHttpServer())
      .get('/security/devices')
      .expect(401);
  });
  it('GET:[HOST]/security/devices: should return code 200 and array of 3 sessions', async () => {
    const result = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', `refreshToken=${refreshToken1User1}`)
      .expect(200);
    expect(result.body).toHaveLength(3);
    deviceId1User1 = result.body[0].deviceId;
  });

  //Terminate specified device session
  it('DELETE:[HOST]/security/devices/{deviceId}: should return code 401 If the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
    await request(app.getHttpServer())
      .delete(`/security/devices/${deviceId1User1}`)
      .expect(401);
  });
  it('DELETE:[HOST]/security/devices/{deviceId}: should return code 403 If try to delete the deviceId of other user', async () => {
    await request(app.getHttpServer())
      .delete(`/security/devices/${deviceId1User1}`)
      .set('Cookie', `refreshToken=${refreshToken1User2}`)
      .expect(403);
  });
  it('DELETE:[HOST]/security/devices/{deviceId}: should return code 404', async () => {
    await request(app.getHttpServer())
      .delete(`/security/devices/5a1640d4-4526-4af0-9182-70b1baef3a77`)
      .set('Cookie', `refreshToken=${refreshToken1User2}`)
      .expect(404);
  });
  it('DELETE:[HOST]/security/devices/{deviceId}: should delete session', async () => {
    await request(app.getHttpServer())
      .delete(`/security/devices/${deviceId1User1}`)
      .set('Cookie', `refreshToken=${refreshToken1User1}`)
      .expect(204);

    await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', `refreshToken=${refreshToken1User1}`)
      .expect(401);

    const result = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', `refreshToken=${refreshToken2User1}`)
      .expect(200);
    expect(result.body).toHaveLength(2);
  });

  //Terminate all other (exclude current) device's sessions
  //preparation
  it('/testing/all-data (DELETE) clear DB again', async () => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });
  it('/sa/users (POST) add new users to the system again', async () => {
    //create new user1
    const newUser1 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user1)
      .expect(201);
    user1Id = newUser1.body.id;

    const newUser2 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user2)
      .expect(201);
    user2Id = newUser2.body.id;
  });
  it('POST:[HOST]/auth/login: users login from different devices again', async () => {
    await delay(10000);
    //user1 login
    const result1LoginUser1 = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `1.2.3.4`)
      .set('User-Agent', `android`)
      .send({
        loginOrEmail: 'user1',
        password: 'password1',
      })
      .expect(200);
    cookies = result1LoginUser1.get('Set-Cookie');
    refreshToken1User1 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';

    const resultLogin2User1 = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `2.2.3.4`)
      .set('User-Agent', `winda`)
      .send({
        loginOrEmail: 'user1',
        password: 'password1',
      })
      .expect(200);
    cookies = resultLogin2User1.get('Set-Cookie');
    refreshToken2User1 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';

    const resultLogin3User1 = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `3.2.3.4`)
      .set('User-Agent', `mac`)
      .send({
        loginOrEmail: 'user1',
        password: 'password1',
      })
      .expect(200);
    cookies = resultLogin3User1.get('Set-Cookie');
    refreshToken3User1 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';

    const resultLogin1User2 = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `3.2.3.4`)
      .set('User-Agent', `mac`)
      .send({
        loginOrEmail: 'user2',
        password: 'password2',
      })
      .expect(200);
    cookies = resultLogin1User2.get('Set-Cookie');
    refreshToken1User2 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';
  });
  //tests
  it('DELETE:[HOST]/security/devices: should return code 401 If the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
    const result1 = await request(app.getHttpServer())
      .delete('/security/devices')
      .expect(401);
  });
  it('DELETE:[HOST]/security/devices: should return code 204', async () => {
    const result1 = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', `refreshToken=${refreshToken1User1}`)
      .expect(200);
    expect(result1.body).toHaveLength(3);
    await request(app.getHttpServer())
      .delete(`/security/devices`)
      .set('Cookie', `refreshToken=${refreshToken1User1}`)
      .expect(204);

    const result = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', `refreshToken=${refreshToken1User1}`)
      .expect(200);
    expect(result.body).toHaveLength(1);
  });
});
