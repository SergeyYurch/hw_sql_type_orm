import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { getApp } from './test-utils';
import {
  user1,
  user10,
  user11,
  user12,
  user2,
  user3,
  user4,
  user5,
  user6,
  user7,
  user8,
  user9,
} from './tsts-input-data';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await disconnect();
    await app.close();
  });

  //preparation
  it('/testing/all-data (DELETE) clear DB', async () => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });

  //***********[HOST]/sa/users**************
  //post
  it('POST: [HOST]/sa/users should return code 401 "Unauthorized" for unauthorized request', async () => {
    await request(app.getHttpServer())
      .post('/sa/users')
      .send(user1)
      .expect(401);
  });
  it('POST: [HOST]/sa/users (POST) Add new user to the system. Should return 201 and add new user to db', async () => {
    const newUser1 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user1)
      .expect(201);
    user1Id = newUser1.body.id;
    expect(newUser1.body).toEqual({
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

    //create new user2
    const newUser2 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user2)
      .expect(201);
    user2Id = newUser2.body.id;

    //create other users
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user3)
      .expect(201);
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user4)
      .expect(201);

    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user5)
      .expect(201);

    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user6)
      .expect(201);
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user7)
      .expect(201);
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user8)
      .expect(201);
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user9)
      .expect(201);
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user10)
      .expect(201);
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user11)
      .expect(201);
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user12)
      .expect(201);
  });
  it('POST: [HOST]/sa/users should return code 400 and error message for field login', async () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        password: 'password1',
        email: 'email221@gmail.com',
      })
      .expect(400)
      .then(({ body }: request.Response) => {
        expect(body).toEqual({
          errorsMessages: [
            {
              message: expect.any(String),
              field: 'login',
            },
          ],
        });
      });
  });

  //get
  it('GET: [HOST]/users: should return code 401 "Unauthorized" for unauthorized request', async () => {
    const users = await request(app.getHttpServer())
      .get('/sa/users')
      .expect(401);
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
      .put(`/sa/users/${user1Id}/ban`)
      .send({
        isBanned: true,
        banReason: 'banReason is stringstringstringst',
      })
      .expect(401);
  });
  it('PUT: [HOST]/users: should return code 400 If the inputModel has incorrect values', async () => {
    await request(app.getHttpServer())
      .put(`/sa/users/${user1Id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
      })
      .expect(400);
  });
  it('PUT: [HOST]/users: should return code 204 for correct userId and user should be baned', async () => {
    let users = await request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(users.body.totalCount).toBe(12);

    await request(app.getHttpServer())
      .put(`/sa/users/${user1Id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
        banReason: 'banReason is stringstringstringst',
      })
      .expect(204);

    users = await request(app.getHttpServer())
      .get('/sa/users?banStatus=banned')
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(users.body.totalCount).toBe(1);
    expect(users.body.items[0].id).toBe(user1Id);

    users = await request(app.getHttpServer())
      .get('/sa/users?banStatus=notBanned')
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(users.body.totalCount).toBe(11);
  });

  //delete
  it('DELETE: [HOST]/users: should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .delete(`/sa/users/${user1Id}`)
      .expect(401);
  });
  it('DELETE: [HOST]/users: should return code 404 for incorrect ID', async () => {
    await request(app.getHttpServer())
      .delete('/sa/users/qwe-ss---s-s-s-srty')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(404);
  });
  it('DELETE: [HOST]/users: should return code 204 for correct userId and user should be deleted', async () => {
    let users = await request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' });

    expect(users.body.totalCount).toBe(12);

    await request(app.getHttpServer())
      .delete(`/sa/users/${user1Id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(204);

    users = await request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' });

    expect(users.body.totalCount).toBe(11);
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
