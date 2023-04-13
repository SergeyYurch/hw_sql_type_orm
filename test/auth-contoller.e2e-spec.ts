import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { delay } from '../src/common/helpers/helpers';
import { user1 } from './tsts-input-data';
import { getApp } from './test-utils';
import { UsersQueryTypeormRepository } from '../src/users/providers/users.query-typeorm.repository';
import { UsersTypeOrmRepository } from '../src/users/providers/users.typeorm.repository';

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  let cookies: string[];
  let userQueryRepository: UsersQueryTypeormRepository;
  let usersRepository: UsersTypeOrmRepository;
  let user1Id: string;
  let accessTokenUser1: string;
  let refreshTokenUser1: string;
  let expiredRefreshTokenUser1: string;
  let confirmationCode: string;
  let recoveryCode: string;

  beforeAll(async () => {
    app = await getApp();
    userQueryRepository = await app.resolve(UsersQueryTypeormRepository);
    usersRepository = await app.resolve(UsersTypeOrmRepository);
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
  it('/sa/users (POST) add new user to the system', async () => {
    //create new user1
    const newUser1 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user1)
      .expect(201);
    user1Id = newUser1.body.id;
  });

  //Registration in the system. Email with confirmation code will be send to passed email address
  it('POST:[HOST]/auth/registration: should return code 400 If the inputModel has incorrect values', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        email: 'string',
        password: 'password1',
      })
      .expect(400);
  });
  it('POST:[HOST]/auth/registration: should return code 204 if input model is correct', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: 'user21',
        password: 'password21',
        email: 'user21@mail.ru',
      })
      .expect(204);
  });
  // it('POST:[HOST]/auth/registration: should return code 429 if access attempt limit exceeded', async () => {
  //   await request(app.getHttpServer()).post('/auth/registration').send({
  //     login: 'user11',
  //     password: 'string11',
  //     email: 'user11@mail.ru',
  //   });
  //
  //   await request(app.getHttpServer()).post('/auth/registration').send({
  //     login: 'user2',
  //     password: 'string2',
  //     email: 'user2@mail.ru',
  //   });
  //   await request(app.getHttpServer()).post('/auth/registration').send({
  //     login: 'user11',
  //     password: 'string11',
  //     email: 'user11@mail.ru',
  //   });
  //
  //   await request(app.getHttpServer()).post('/auth/registration').send({
  //     login: 'user2',
  //     password: 'string2',
  //     email: 'user2@mail.ru',
  //   });
  //
  //   await request(app.getHttpServer()).post('/auth/registration').send({
  //     login: 'user3',
  //     password: 'string3',
  //     email: 'user3@mail.ru',
  //   });
  //
  //   await request(app.getHttpServer())
  //     .post('/auth/registration')
  //     .send({
  //       login: 'user6',
  //       password: 'string6',
  //       email: 'user6@mail.ru',
  //     })
  //     .expect(429);
  // });

  //Try login user to the system
  it('POST:[HOST]/auth/login: should return code 400 If the inputModel has incorrect values', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        password: 'password1',
      })
      .expect(400);
  });
  it('POST:[HOST]/auth/login: should return code 401 if the password or login is wrong', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'wwwwwwwwwwww',
        password: 'password1',
      })
      .expect(401);
  });
  it('POST:[HOST]/auth/login: should return code 200 and pair of JWT-tokens', async () => {
    const result = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', `1.2.3.4`)
      .set('User-Agent', `android`)
      .send({
        loginOrEmail: 'user1',
        password: 'password1',
      })
      .expect(200);
    cookies = result.get('Set-Cookie');
    refreshTokenUser1 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';
    expiredRefreshTokenUser1 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';

    accessTokenUser1 = result.body.accessToken;
  });
  it('POST:[HOST]/auth/login: should return code 429 to more than 5 attempts from one IP-address during 10 seconds', async () => {
    // await delay(10000);
    await request(app.getHttpServer()).post('/auth/login').send({
      loginOrEmail: 'user111',
      password: 'password111',
    });
    await request(app.getHttpServer()).post('/auth/login').send({
      loginOrEmail: 'user111',
      password: 'password111',
    });
    await request(app.getHttpServer()).post('/auth/login').send({
      loginOrEmail: 'user111',
      password: 'password111',
    });
    await request(app.getHttpServer()).post('/auth/login').send({
      loginOrEmail: 'user111',
      password: 'password111',
    });
    await request(app.getHttpServer()).post('/auth/login').send({
      loginOrEmail: 'user111',
      password: 'password111',
    });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'user111',
        password: 'password111',
      })
      .expect(429);
  });

  //Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
  // Device LastActiveDate should be overrode by issued Date of new refresh token
  it('POST:[HOST]/auth/refresh-token: should return code 401 no refreshToken', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('X-Forwarded-For', `1.2.3.4`)
      .set('User-Agent', `android`)
      .expect(401);
  });
  it('POST:[HOST]/auth/refresh-token: should return code 200 and pair of JWT-tokens', async () => {
    await delay(3000);
    const result = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .set('X-Forwarded-For', `100.100.100.100`)
      .set('User-Agent', `test`)
      .expect(200);
    const cookies = result.get('Set-Cookie');
    refreshTokenUser1 =
      cookies[0]
        .split(';')
        .find((c) => c.includes('refreshToken'))
        ?.split('=')[1] || 'no token';

    accessTokenUser1 = result.body.accessToken;
    await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', `refreshToken=${expiredRefreshTokenUser1}`)
      .set('X-Forwarded-For', `1.2.3.4`)
      .set('User-Agent', `android`)
      .expect(401);
  });

  //Confirm registration
  it('POST:[HOST]/auth/registration-confirmation: should return code 400 If the confirmation code is incorrect, expired or already been applied', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: 'fake',
      })
      .expect(400);
  });
  it('POST:[HOST]/auth/registration-confirmation: should return code 204 If the confirmation code is correct', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: 'userR',
        password: 'passwordR',
        email: 'emailR@gmail.com',
      })
      .expect(204);
    console.log(
      '#################################################################',
    );
    const userR = await userQueryRepository.findUserByLoginOrEmail('userR');
    console.log(userR);
    confirmationCode = (await userQueryRepository.getUserModelById(userR.id))
      .emailConfirmation.confirmationCode;
    console.log('confirmationCode');
    console.log(confirmationCode);
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode,
      })
      .expect(204);
  });
  it('POST:[HOST]/auth/registration-confirmation: should return code 400 If the confirmation code is already been applied', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode,
      })
      .expect(400);
  });

  // Resend confirmation registration Email if user exists
  it('POST:[HOST]/auth/registration-email-resending: should return code 400 If email is incorrect', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'fake@gmail.com',
      })
      .expect(400);
  });
  it('POST:[HOST]/auth/registration-email-resending: should return code 204 If the email is correct', async () => {
    await request(app.getHttpServer()).post('/auth/registration').send({
      login: 'userE',
      password: 'passwordE',
      email: 'emailE@gmail.com',
    });

    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'emailE@gmail.com',
      })
      .expect(204);
  });
  it('POST:[HOST]/auth/registration-email-resending:  should return status code 429 if more than 5 requests were sent within 10 seconds', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'emailE@gmail.com',
      })
      .expect(204);
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'emailE@gmail.com',
      })
      .expect(204);
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'emailE@gmail.com',
      })
      .expect(204);
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'emailE@gmail.com',
      })
      .expect(429);
  });
  //logout
  it('POST:[HOST]/auth/logout: should return code 401 no refreshToken', async () => {
    await request(app.getHttpServer()).post('/auth/logout').expect(401);
  });
  it('POST:[HOST]/auth/logout:should return code 204 and logout and return code 401 if user send correct refreshToken after logout', async () => {
    const result = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .expect(204);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshTokenUser1}`)
      .expect(401);
  });

  //password recovery
  it('POST:[HOST]/auth/password-recovery: should return code 400 If email is incorrect', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'fake^^gmail.com',
      })
      .expect(400);
  });
  it('POST:[HOST]/auth/password-recovery: should return code 204 If the email is correct', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'email1@gmail.com',
      })
      .expect(204);
    const userInDb = await usersRepository.getUserModel(user1Id);
    recoveryCode = userInDb!.passwordRecoveryInformation!.recoveryCode;
  });
  it('POST:[HOST]/auth/password-recovery: should return code 204 If the email is correct but email is not in dataBase', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'email1111@gmail.com',
      })
      .expect(204);
  });

  //new password
  it('POST:[HOST]/auth/new-password: should return code 400 If the inputModel is incorrect', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        newPassword: 'string',
      })
      .expect(400);
  });
  it('POST:[HOST]/auth/new-password: should return code 400 If the inputModel has incorrect value (for incorrect password length) ', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        newPassword: 'st',
        recoveryCode: recoveryCode,
      })
      .expect(400);
  });
  it('POST:[HOST]/auth/new-password: should return code 400 If  RecoveryCode is incorrect', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        newPassword: 'string',
        recoveryCode: 'recoveryCode',
      })
      .expect(400);
  });
  it('POST:[HOST]/auth/new-password: should return code 204 If code is valid and new password is accepted', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        newPassword: 'newPassword',
        recoveryCode: recoveryCode,
      })
      .expect(204);
  });
  it('POST:[HOST]/auth/login: should return code 200 when user login with new password', async () => {
    await delay(10000);

    const result = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1',
        password: 'newPassword',
      })
      .expect(200);
    accessTokenUser1 = result.body.accessToken;
  });
  it('POST:[HOST]/auth/login: should return code 401 when user login with old password', async () => {
    const result = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1',
        password: 'password1',
      })
      .expect(401);
  });

  it('POST:[HOST]/auth/me: should return code 200 and users data', async () => {
    // await delay(10000);

    const result = await request(app.getHttpServer())
      .get('/auth/me')
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);
    expect(result.body).toEqual({
      login: 'user1',
      email: 'email1@gmail.com',
      userId: user1Id,
    });
  });

  //
});
