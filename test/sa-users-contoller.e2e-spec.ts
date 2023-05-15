import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { getApp } from './test-utils';

import { UsersTestHelpers } from './helpers/users.test.helpers';
import { TestingTestHelpers } from './helpers/testing-test.helpers';

describe('SaUsersController (e2e)', () => {
  let app: INestApplication;
  let testingTestHelpers: TestingTestHelpers;
  let usersTestService: UsersTestHelpers;
  const users = [];

  beforeAll(async () => {
    app = await getApp();
    usersTestService = new UsersTestHelpers(app);
    testingTestHelpers = new TestingTestHelpers(app);
  });

  afterAll(async () => {
    await disconnect();
    await app.close();
  });

  //preparation
  it('Preparation1', async () => {
    await testingTestHelpers.clearDb();
  });

  //***********[HOST]/sa/users**************
  //post
  it('POST: [HOST]/sa/users should return code 401 "Unauthorized" for unauthorized request', async () => {
    const user1 = usersTestService.getUserInputModel(1);
    await request(app.getHttpServer())
      .post('/sa/users')
      .send(user1)
      .expect(401);
  });
  it('POST: [HOST]/sa/users (POST) Add new user to the system. Should return 201 and add new user to db', async () => {
    const userInput1 = usersTestService.getUserInputModel(1);
    const { body: newUser1 } = await usersTestService.createUser(
      userInput1,
      201,
    );
    users[0] = newUser1;
    expect(newUser1).toEqual({
      id: expect.any(String),
      login: 'user1',
      email: 'email1@gmail.com',
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });
    console.log(users[0].id);
    await usersTestService.createSetOfUsers(12, 2);
  });
  it('POST: [HOST]/sa/users should return code 400 and error message for field login', async () => {
    const { body } = await usersTestService.createUser(
      {
        password: 'password1',
        email: 'email221@gmail.com',
      },
      400,
    );
    expect(body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'login',
        },
      ],
    });

    // return request(app.getHttpServer())
    //   .post('/sa/users')
    //   .auth('admin', 'qwerty', { type: 'basic' })
    //   .send({
    //     password: 'password1',
    //     email: 'email221@gmail.com',
    //   })
    //   .expect(400)
    //   .then(({ body }: request.Response) => {
    //     expect(body).toEqual({
    //       errorsMessages: [
    //         {
    //           message: expect.any(String),
    //           field: 'login',
    //         },
    //       ],
    //     });
    //   });
  });

  //get
  it('GET: [HOST]/users: should return code 401 "Unauthorized" for unauthorized request', async () => {
    await request(app.getHttpServer()).get('/sa/users').expect(401);
  });
  it('GET: [HOST]/users: should return code 200 and array with 12 elements with default paginator', async () => {
    const users = await request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);

    expect(users.body.totalCount).toBe(12);

    expect(users.body.items[0]).toEqual({
      id: expect.any(String),
      login: 'user12',
      email: 'email12@gmail.com',
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });

    expect(users.body.items[1]).toEqual({
      id: expect.any(String),
      login: 'user11',
      email: 'email11@gmail.com',
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });
  });
  it('GET: [HOST]/users: should return code 200 and array with 1 elements with queryParams:pageSize=1&sortDirection=asc', async () => {
    const users = await request(app.getHttpServer())
      .get('/sa/users?pageSize=1&sortDirection=asc')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(users.body.items.length).toBe(1);

    expect(users.body.items[0]).toEqual({
      id: expect.any(String),
      login: 'user1',
      email: 'email1@gmail.com',
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });
  });
  it('GET: [HOST]/users: should return code 200 and array with 1 elements with queryParams:searchLoginTerm=r1', async () => {
    const users = await request(app.getHttpServer())
      .get('/sa/users?searchLoginTerm=user12')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);

    expect(users.body.items.length).toBe(1);

    expect(users.body.items[0]).toEqual({
      id: expect.any(String),
      login: 'user12',
      email: 'email12@gmail.com',
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });
  });
  //put (ban/unban)
  it('PUT: [HOST]/users: should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .put(`/sa/users/${users[0].id}/ban`)
      .send({
        isBanned: true,
        banReason: 'banReason is stringstringstringst',
      })
      .expect(401);
  });
  it('PUT: [HOST]/users: should return code 400 If the inputModel has incorrect values', async () => {
    await request(app.getHttpServer())
      .put(`/sa/users/${users[0].id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
      })
      .expect(400);
  });
  it('PUT: [HOST]/users: should return code 204 for correct userId and user should be baned', async () => {
    const { body: usersSet } = await request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(usersSet.totalCount).toBe(12);

    await request(app.getHttpServer())
      .put(`/sa/users/${users[0].id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
        banReason: 'banReason is stringstringstringst',
      })
      .expect(204);

    const { body: bannedUsers } = await request(app.getHttpServer())
      .get('/sa/users?banStatus=banned')
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(bannedUsers.totalCount).toBe(1);
    expect(bannedUsers.items[0].id).toBe(users[0].id);

    const { body: notBannedUsers } = await request(app.getHttpServer())
      .get('/sa/users?banStatus=notBanned')
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(notBannedUsers.totalCount).toBe(11);
  });

  //delete
  it('DELETE: [HOST]/users: should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .delete(`/sa/users/${users[0].id}`)
      .expect(401);
  });
  it('DELETE: [HOST]/users: should return code 404 for incorrect ID', async () => {
    await request(app.getHttpServer())
      .delete('/sa/users/qwe-ss---s-s-s-srty')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(404);
  });
  it('DELETE: [HOST]/users: should return code 204 for correct userId and user should be deleted', async () => {
    const { body: allUsers } = await request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' });

    expect(allUsers.totalCount).toBe(12);

    await request(app.getHttpServer())
      .delete(`/sa/users/${users[0].id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(204);

    const { body: allUsersAfterDelete } = await request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' });

    expect(allUsersAfterDelete.totalCount).toBe(11);
  });
});

//
// let app: INestApplication;
// let postCollection: mongoose.Collection;
// let createdPostId;
// let connection;
//
// beforeEach(async () => {
//   const moduleFixture: TestingModule = await Test.createTestingModule({
//     imports: [AppModule]
//   }).compile();
//
//   app = moduleFixture.createNestApplication();
//   await app.init();
//
//   connection = moduleFixture
//     .get<MongodbService>(MongodbService)
//     .getMongoConnection();
//
//   postCollection = await connection.collection('posts');
// });
//
// afterEach(async () => {
//
//   const collections = connection.collections;
//
//   for (const key in collections) {
//     const collection = collections[key];
//     await collection.deleteMany({});
//   }
// });
//
//
// afterAll(() => {
//   disconnect();
// });

// describe('AppController', () => {
//   let app: INestApplication;
//   let server: any;
//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//
//     await app.init();
//     server = app.getHttpServer();
//   });
//
//   afterAll(async () => {
//     app.close();
//   });

// "test:runalltests": "jest --config ./test/jest-e2e.json --watch --runInBand"
