import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { getApp } from './test-utils';

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

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  let user1Id: string;
  let user2Id: string;
  let user3Id: string;
  let user4Id: string;
  let user5Id: string;
  let user6Id: string;
  let user7Id: string;
  let user8Id: string;
  let user9Id: string;
  let user10Id: string;
  let user11Id: string;
  let user12Id: string;

  let blog1Id: string;
  let blog2Id: string;

  let post1Id: string;
  let post2Id: string;
  let post3Id: string;

  let comment1Id: string;
  let comment2Id: string;
  let comment3Id: string;
  let comment4Id: string;
  let comment5Id: string;

  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;
  let accessTokenUser4: string;
  let accessTokenUser5: string;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await disconnect();
    await app.close();
  });

  //preparation
  // USER1 -blogger, USER2, USER3 - good users,  USER4, USER5 - bad boys
  it('/testing/all-data (DELETE) clear DB', async () => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });
  it('POST: [HOST]/sa/users (POST) Add new users to the system.', async () => {
    const newUser1 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user1)
      .expect(201);
    user1Id = newUser1.body.id;

    //create new user2
    const newUser2 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user2);
    user2Id = newUser2.body.id;

    //create new user3
    const newUser3 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user3);
    user3Id = newUser3.body.id;

    //create new user4
    const newUser4 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user4);
    user4Id = newUser4.body.id;

    //create new user5
    const newUser5 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user5);
    user5Id = newUser5.body.id;

    //create new user6
    const newUser6 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user6);
    user6Id = newUser6.body.id;

    //create new user7
    const newUser7 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user7);
    user7Id = newUser7.body.id;

    //create new user8
    const newUser8 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user8);
    user8Id = newUser8.body.id;

    //create new user9
    const newUser9 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user9);
    user9Id = newUser9.body.id;

    //create new user10
    const newUser10 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user10);
    user10Id = newUser10.body.id;

    //create new user11
    const newUser11 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user11);
    user11Id = newUser11.body.id;

    //create new user12
    const newUser12 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user12);
    user12Id = newUser12.body.id;
  });
  it('POST:[HOST]/auth/login: all users login to system', async () => {
    const sigInUser1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1',
        password: 'password1',
      })
      .expect(200);
    accessTokenUser1 = sigInUser1.body.accessToken;

    const sigInUser2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'user2',
        password: 'password2',
      })
      .expect(200);
    accessTokenUser2 = sigInUser2.body.accessToken;

    const sigInUser3 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'user3',
        password: 'password3',
      })
      .expect(200);
    accessTokenUser3 = sigInUser3.body.accessToken;

    const sigInUser4 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'user4',
        password: 'password4',
      })
      .expect(200);
    accessTokenUser4 = sigInUser4.body.accessToken;

    const sigInUser5 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'user5',
        password: 'password5',
      })
      .expect(200);
    accessTokenUser5 = sigInUser5.body.accessToken;
  });
  it('POST:[HOST]/blogger/blogs: user1 create blog1, user2 create blog2 ', async () => {
    const newBlog1 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send(blog1)
      .expect(201);
    blog1Id = newBlog1.body.id;

    const newBlog2 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser2, { type: 'bearer' })
      .send(blog1)
      .expect(201);
    blog2Id = newBlog2.body.id;
  });
  it('POST:[HOST]/blogger/blogs: user1 as blogger create posts for blog1', async () => {
    const newPost1 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog1Id}/posts`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'title1',
        shortDescription: 'shortDescription1',
        content: 'content1',
      })
      .expect(201);
    post1Id = newPost1.body.id;

    const newPost2 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog1Id}/posts`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'title2',
        shortDescription: 'shortDescription2',
        content: 'content2',
      })
      .expect(201);
    post2Id = newPost2.body.id;

    const newPost3 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog1Id}/posts`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'title3',
        shortDescription: 'shortDescription3',
        content: 'content3',
      })
      .expect(201);
    post3Id = newPost3.body.id;
  });
  it('POST:[HOST]/blogger/blogs: user2 as blogger create posts for blog2', async () => {
    const newPost3 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog2Id}/posts`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        title: 'title3',
        shortDescription: 'shortDescription3',
        content: 'content3',
      })
      .expect(201);
    post3Id = newPost3.body.id;
  });
  it('POST: [HOST]/posts/{:postId}/comments -USER1, USER2, USER4 created comment for blog1/post1, USER3, USER5 created comment for blog1/post2', async () => {
    const newComment1 = await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        content: 'user1 -comment1 for blog1/post 1',
      })
      .expect(201);
    comment1Id = newComment1.body.id;

    const newComment2 = await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        content: 'user2 -comment2 for blog1/post 1',
      })
      .expect(201);
    comment2Id = newComment2.body.id;

    const newComment3 = await request(app.getHttpServer())
      .post(`/posts/${post2Id}/comments`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .send({
        content: 'user3 -comment3 for blog1/post 1',
      })
      .expect(201);
    comment3Id = newComment3.body.id;

    const newComment4 = await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser4, { type: 'bearer' })
      .send({
        content: 'user4 -comment4 for blog1/post 1',
      })
      .expect(201);
    comment4Id = newComment4.body.id;

    const newComment5 = await request(app.getHttpServer())
      .post(`/posts/${post2Id}/comments`)
      .auth(accessTokenUser5, { type: 'bearer' })
      .send({
        content: 'user5 -comment5 for blog1/post 1',
      })
      .expect(201);
    comment5Id = newComment5.body.id;

    const getCommentForPost1Result = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/comments`)
      .expect(200);
    expect(getCommentForPost1Result.body.items.length).toBe(3);

    const getCommentForPost2Result = await request(app.getHttpServer())
      .get(`/posts/${post2Id}/comments`)
      .expect(200);
    expect(getCommentForPost2Result.body.items.length).toBe(2);
  });

  //Put (ban/unban)
  it('PUT: [HOST]/blogger/users/${userId}/ban: should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/users/${user4Id}/ban`)
      .send({
        isBanned: true,
        banReason: 'banReason is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(401);
  });
  it('PUT: [HOST]/blogger/users/${userId}/ban: should return code 400 If the inputModel has incorrect values', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/users/${user4Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        blogId: blog1Id,
      })
      .expect(400);
  });
  it('PUT: [HOST]/blogger/users/${userId}/ban: should return code 403 if authorized user, who try ban other user, does not own blog', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/users/${user4Id}/ban`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(403);
  });
  it('PUT: [HOST]/blogger/users/${:userId}/ban: ban USER4, USER5, user6-user7 - should return code 204  and users should be banned', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/users/${user4Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason for user2 is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/blogger/users/${user5Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason for user2 is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/blogger/users/${user6Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason for user6 is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/blogger/users/${user7Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason for user7 is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/blogger/users/${user8Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason for user8 is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/blogger/users/${user9Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason for user9 is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/blogger/users/${user10Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason for user10 is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/blogger/users/${user11Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason for user11 is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/blogger/users/${user12Id}/ban`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'banReason for user12 is stringstringstringst',
        blogId: blog1Id,
      })
      .expect(204);
  });

  //try to get comments
  it('GET: /comments/{:commentId}  /posts/${post1Id}/comments - unauthorized user should get not banned users for blog1/post1, blog1/post2', async () => {
    const getCommentResult1 = await request(app.getHttpServer())
      .get(`/comments/${comment1Id}`)
      .expect(200);
    expect(getCommentResult1.body.commentatorInfo.userId).toBe(user1Id);

    const getCommentResult2 = await request(app.getHttpServer())
      .get(`/comments/${comment2Id}`)
      .expect(200);
    expect(getCommentResult2.body.commentatorInfo.userId).toBe(user2Id);

    const getCommentResult3 = await request(app.getHttpServer())
      .get(`/comments/${comment3Id}`)
      .expect(200);
    expect(getCommentResult3.body.commentatorInfo.userId).toBe(user3Id);

    const getCommentForPost1Result = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/comments`)
      .expect(200);
    expect(getCommentForPost1Result.body.items.length).toBe(2);

    const getCommentForPost2Result = await request(app.getHttpServer())
      .get(`/posts/${post2Id}/comments`)
      .expect(200);
    expect(getCommentForPost2Result.body.items.length).toBe(1);
  });
  it('GET: /comments/{:commentId}  /posts/${post1Id}/comments - unauthorized user should get 404 for banned users comments for blog1/post1, blog1/post2', async () => {
    await request(app.getHttpServer())
      .get(`/comments/${comment4Id}`)
      .expect(404);

    await request(app.getHttpServer())
      .get(`/comments/${comment5Id}`)
      .expect(404);
  });

  //try to create comments
  it('POST: [HOST]/posts/{:postId}/comments -USER5 try created comment for blog1/post1, blog1/post2 should return 403', async () => {
    await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser5, { type: 'bearer' })
      .send({
        content: 'user5 -comment for blog1/post 1',
      })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/posts/${post2Id}/comments`)
      .auth(accessTokenUser5, { type: 'bearer' })
      .send({
        content: 'user5 -comment for blog1/post 1',
      })
      .expect(403);
  });
  it('POST: [HOST]/posts/{:postId}/comments -USER5 should create comment (return 201) for blog2/post3,', async () => {
    await request(app.getHttpServer())
      .post(`/posts/${post3Id}/comments`)
      .auth(accessTokenUser5, { type: 'bearer' })
      .send({
        content: 'user5 -comment for blog2/post 3',
      })
      .expect(201);
  });
  //
  // //get
  it('GET: [HOST]/blogger/users/blog/:blogId: should return code 401 "Unauthorized" for unauthorized request', async () => {
    const users = await request(app.getHttpServer())
      .get(`/blogger/users/blog/${blog1Id}`)
      .expect(401);
  });
  it('GET: [HOST]/blogger/users/blog/:blogId: should return code 403 "Unauthorized" for unauthorized request', async () => {
    const users = await request(app.getHttpServer())
      .get(`/blogger/users/blog/${blog1Id}`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(403);
  });
  it('GET: [HOST]/blogger/users/blog/:blogId: should return code 404 ', async () => {
    const users = await request(app.getHttpServer())
      .get(`/blogger/users/blog/$23222222`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(404);
  });
  it('GET: [HOST]/blogger/users/blog/:blogId: should return code 200 and array with 2 elements (banned users) with default paginator', async () => {
    const users = await request(app.getHttpServer())
      .get(`/blogger/users/blog/${blog1Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);

    expect(users.body.totalCount).toBe(9);
    expect(users.body.items.length).toBe(9);
    expect(users.body.items[0]).toEqual({
      id: user12Id,
      login: 'user12',
      banInfo: {
        isBanned: true,
        banDate: expect.any(String),
        banReason: expect.any(String),
      },
    });

    expect(users.body.items[1]).toEqual({
      id: user11Id,
      login: 'user11',
      banInfo: {
        isBanned: true,
        banDate: expect.any(String),
        banReason: expect.any(String),
      },
    });
  });
  it('GET: [HOST]/blogger/users/blog/:blogId: should return code 200 and array with 1 elements with queryParams:pageSize=1&sortDirection=asc', async () => {
    const users = await request(app.getHttpServer())
      .get(`/blogger/users/blog/${blog1Id}?pageSize=1&sortDirection=asc`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);

    expect(users.body.totalCount).toBe(9);
    expect(users.body.pageSize).toBe(1);
    expect(users.body.items.length).toBe(1);
    expect(users.body.items[0]).toEqual({
      id: user4Id,
      login: 'user4',
      banInfo: {
        isBanned: true,
        banDate: expect.any(String),
        banReason: expect.any(String),
      },
    });
  });
  it('GET: [HOST]/blogger/users/blog/:blogId: should return code 200 and array with 1 elements with searchLoginTerm=ser6', async () => {
    const users = await request(app.getHttpServer())
      .get(`/blogger/users/blog/${blog1Id}?searchLoginTerm=ser6`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);

    expect(users.body.totalCount).toBe(1);
    expect(users.body.pageSize).toBe(10);
    expect(users.body.items.length).toBe(1);
    expect(users.body.items[0]).toEqual({
      id: user6Id,
      login: 'user6',
      banInfo: {
        isBanned: true,
        banDate: expect.any(String),
        banReason: expect.any(String),
      },
    });
  });

  it('GET: [HOST]/blogger/users/blog/:blogId: should return code 200 and array with 1 elements with queryParams:pageSize=8&pageNumber=1&sortBy=login&sortDirection=asc', async () => {
    const users = await request(app.getHttpServer())
      .get(
        `/blogger/users/blog/${blog1Id}?pageSize=6&pageNumber=1&sortBy=login&sortDirection=asc`,
      )
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);

    expect(users.body.totalCount).toBe(9);
    expect(users.body.pageSize).toBe(6);
    expect(users.body.items).toHaveLength(6);
    expect(users.body.items[0]).toEqual({
      id: user10Id,
      login: 'user10',
      banInfo: {
        isBanned: true,
        banDate: expect.any(String),
        banReason: expect.any(String),
      },
    });
  });
});
