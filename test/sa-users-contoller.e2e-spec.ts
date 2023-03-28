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
import { BlogViewModel } from '../src/blogs/dto/view-models/blog.view.model';

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
const user4 = {
  login: 'user4',
  password: 'password4',
  email: 'email4@gmail.com',
};
const user5 = {
  login: 'user5',
  password: 'password5',
  email: 'email5@gmail.com',
};
const user6 = {
  login: 'user6',
  password: 'password6',
  email: 'email6@gmail.com',
};
const user7 = {
  login: 'user7',
  password: 'password7',
  email: 'email7@gmail.com',
};
const user8 = {
  login: 'user8',
  password: 'password8',
  email: 'email8@gmail.com',
};
const user9 = {
  login: 'user9',
  password: 'password9',
  email: 'email9@gmail.com',
};
const user10 = {
  login: 'user10',
  password: 'password10',
  email: 'email10@gmail.com',
};

const user11 = {
  login: 'user11',
  password: 'password11',
  email: 'email11@gmail.com',
};

const user12 = {
  login: 'user12',
  password: 'password12',
  email: 'email12@gmail.com',
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

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;
  let blog1Id: string;
  let blog2Id: string;
  let blog3Id: string;
  let blog1View: BlogViewModel;
  let blog2View: BlogViewModel;
  let blog3View: BlogViewModel;
  let post1Id: string;
  let post2Id: string;
  let post3Id: string;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
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
