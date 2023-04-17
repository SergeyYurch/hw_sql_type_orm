import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { getApp } from './test-utils';
import { blog1, blog2, blog3, user1, user2, user3 } from './tsts-input-data';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;
  let blog1Id: string;
  let blog2Id: string;
  let blog3Id: string;
  let blog1View: any;
  let blog2View: any;
  let blog3View: any;
  let post1Id: string;
  let post2Id: string;
  let post3Id: string;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await disconnect();
    await app.close();
  });
  // ********[HOST]/sa/blogs**********

  //preparation
  it('/testing/all-data (DELETE) clear DB', async () => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });
  it('/sa/users (POST) Add new user to the system. Should return 201 and add new user to db', async () => {
    //create new user2
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
      .send(user2)
      .expect(201);
    user2Id = newUser2.body.id;

    //create new user3
    const newUser3 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user3)
      .expect(201);
    user3Id = newUser3.body.id;
  });
  it('POST:[HOST]/auth/login: should return code 200 and JWT-tokens if user signIn', async () => {
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
    app.getHttpServer().close();
  });
  it('POST:[HOST]/sa/blogs: create blog1 without owner for tests', async () => {
    const newBlog1 = await request(app.getHttpServer())
      .post('/sa/blogs')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(blog1)
      .expect(201);
    blog1View = newBlog1.body;
    blog1Id = newBlog1.body.id;
  });

  //GET: [HOST]/sa/blogs
  it('GET: [HOST]/sa/blogs/ should return code 201 and all blogs with pagination in sa.BlogViewModel type', async () => {
    const getBlogsResult = await request(app.getHttpServer())
      .get(`/sa/blogs`)
      .auth('admin', 'qwerty', { type: 'basic' });
    const blog1InDb = getBlogsResult.body.items[0];
    expect(blog1InDb.blogOwnerInfo.userId).toBeUndefined();
    expect(blog1InDb.id).toBe(blog1Id);
  });

  // PUT: [HOST]sa/blogs/{id}/bind-with-user/{userId} Bind BlogEntity with user
  it('PUT: [HOST]/sa/blogs/{:id}/bind-with-user/{:userId} should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .put(`/sa/blogs/${blog1Id}/bind-with-user/${user1Id}`)
      .expect(401);
  });
  it('PUT: [HOST]/sa/blogs/{:id}/bind-with-user/{:userId}: should return code 204 for correct userId and user should be bound', async () => {
    await request(app.getHttpServer())
      .put(`/sa/blogs/${blog1Id}/bind-with-user/${user1Id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(204);

    const getBlogsResult = await request(app.getHttpServer())
      .get(`/sa/blogs`)
      .auth('admin', 'qwerty', { type: 'basic' });
    const blog1InDb = getBlogsResult.body.items[0];
    //check userId in blogOwnerInfo
    expect(blog1InDb.blogOwnerInfo.userId).toBe(user1Id);
  });
  it('PUT: [HOST]/sa/blogs/{:id}/bind-with-user/{:userId}: should return code 400 if the blog already bound to any user', async () => {
    await request(app.getHttpServer())
      .put(`/sa/blogs/${blog1Id}/bind-with-user/${user1Id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(400);
  });

  //GET: [HOST]/sa/blogs
  //preparation
  it('DELETE:[HOST]/blogger/blogs/{:id}: delete blog1', async () => {
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blog1Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(204);
  });
  it('POST:[HOST]/blogger/blogs: create user1/blog1, user2/blog2, user3/blog3', async () => {
    const newBlog1 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send(blog1)
      .expect(201);
    blog1View = newBlog1.body;
    blog1Id = newBlog1.body.id;

    const newBlog2 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser2, { type: 'bearer' })
      .send(blog2)
      .expect(201);
    blog2View = newBlog2.body;
    blog2Id = newBlog2.body.id;

    const newBlog3 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser3, { type: 'bearer' })
      .send(blog3)
      .expect(201);
    blog3View = newBlog3.body;
    blog3Id = newBlog3.body.id;
  });
  it('POST:[HOST]/blogger/blogs/{:blogId}/posts: user1 create blog1/post1,  user2 create posts for blog2/post2/post3', async () => {
    const newPost1 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog1Id}/posts`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'title-post1',
        shortDescription: 'created user2 for blog2',
        content: 'content1',
      })
      .expect(201);
    post1Id = newPost1.body.id;

    const newPost2 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog2Id}/posts`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        title: 'title-post2',
        shortDescription: 'created user2 for blog2',
        content: 'content2',
      })
      .expect(201);
    post2Id = newPost2.body.id;

    const newPost3 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog2Id}/posts`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        title: 'title-post3',
        shortDescription: 'created user2 for blog2',
        content: 'content3',
      })
      .expect(201);
    post3Id = newPost3.body.id;
  });
  it('GET: [HOST]/posts should return 3 posts', async () => {
    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts`)
      .expect(200);
    expect(getPostsResult.body.totalCount).toBe(3);
    expect(getPostsResult.body.items.length).toBe(3);
  });
  it('GET:[HOST]/blogs: should return array with 3 blogs', async () => {
    const blogs = await request(app.getHttpServer()).get('/blogs').expect(200);
    expect(blogs.body.totalCount).toBe(3);
    expect(blogs.body.items).toHaveLength(3);
  });
  it('GET:[HOST]/blogs/id: should return blog1', async () => {
    const blogs = await request(app.getHttpServer())
      .get(`/blogs/${blog1Id}`)
      .expect(200);
    expect(blogs.body.id).toBe(blog1Id);
  });

  //checking pagination
  it('GET: [HOST]/sa/blogs/ should return code 201 and all blogs with sortDirection=asc', async () => {
    const getBlogsResult = await request(app.getHttpServer())
      .get(`/sa/blogs?sortDirection=asc`)
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(getBlogsResult.body.totalCount).toBe(3);
    expect(getBlogsResult.body.items.length).toBe(3);
    expect(getBlogsResult.body.items[0].name).toBe('blog1');
    expect(getBlogsResult.body.items[0]).toEqual({
      id: expect.any(String),
      name: 'blog1',
      description: 'description1',
      websiteUrl: 'https://youtube1.com',
      createdAt: expect.any(String),
      isMembership: false,
      blogOwnerInfo: {
        userId: user1Id,
        userLogin: 'user1',
      },
      banInfo: {
        isBanned: false,
        banDate: null,
      },
    });
  });
  it('GET: [HOST]/sa/blogs/ should return code 201 and  blog2 if query has searchNameTerm = og2', async () => {
    const getBlogsResult = await request(app.getHttpServer())
      .get(`/sa/blogs?searchNameTerm=og2`)
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(getBlogsResult.body.items[0]?.name).toBe('blog2');
  });

  //ban blog
  it('PUT: [HOST]/sa/blogs/{:id}/ban: should return should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .put(`/sa/blogs/${blog1Id}/ban`)
      .send({ isBanned: true })
      .expect(401);
  });
  it('PUT: [HOST]/sa/blogs/{:id}/ban: should return should return code 400 if input data is incorrect', async () => {
    const errorMessage = await request(app.getHttpServer())
      .put(`/sa/blogs/${blog1Id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ isBanne: true })
      .expect(400);
    expect(errorMessage.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'isBanned',
        },
      ],
    });
  });
  it('PUT: [HOST]/sa/blogs/{:id}/ban: should return code 204 for correct data and blog should be banned', async () => {
    await request(app.getHttpServer())
      .put(`/sa/blogs/${blog1Id}/ban`)
      .send({ isBanned: true })
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(204);
  });

  //check allowed blogs/posts
  it('GET: [HOST]/sa/blogs/ check if blog1 is banned', async () => {
    const getBlogsResult = await request(app.getHttpServer())
      .get(`/sa/blogs?searchNameTerm=blog1`)
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(getBlogsResult.body.items[0]?.banInfo.isBanned).toBe(true);
  });
  it('GET: [HOST]/posts/{:id} should return 404 for post1/blog if blog1 is banned', async () => {
    await request(app.getHttpServer()).get(`/posts/${post1Id}/`).expect(404);
  });
  it('GET: [HOST]/posts should return code 200 and posts(unauthorized user)', async () => {
    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts`)
      .expect(200);
    expect(getPostsResult.body.totalCount).toBe(2);
    expect(getPostsResult.body.items.length).toBe(2);
  });
  it('GET:[HOST]/blogs: should return array with 2 blogs', async () => {
    const blogs = await request(app.getHttpServer()).get('/blogs').expect(200);
    expect(blogs.body.totalCount).toBe(2);
    expect(blogs.body.items).toHaveLength(2);
  });
  it('GET:[HOST]/blogs/id: should return 404', async () => {
    await request(app.getHttpServer()).get(`/blogs/${blog1Id}`).expect(404);
  });

  //unban blog
  it('PUT: [HOST]/sa/blogs/{:id}/ban: should return code 204, and blog1 should be unbanned', async () => {
    await request(app.getHttpServer())
      .put(`/sa/blogs/${blog1Id}/ban`)
      .send({ isBanned: false })
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(204);
  });

  //check allowed unbanned blogs/posts
  it('GET:[HOST]/blogs/id: should return blog1', async () => {
    const blogs = await request(app.getHttpServer())
      .get(`/blogs/${blog1Id}`)
      .expect(200);
    expect(blogs.body.id).toBe(blog1Id);
  });
  it('GET:[HOST]/blogs: should return array with 3 blogs', async () => {
    const blogs = await request(app.getHttpServer()).get('/blogs').expect(200);
    expect(blogs.body.totalCount).toBe(3);
    expect(blogs.body.items).toHaveLength(3);
  });
  it('GET: [HOST]/sa/blogs/ check if blog1 is banned', async () => {
    const getBlogsResult = await request(app.getHttpServer())
      .get(`/sa/blogs?searchNameTerm=blog1`)
      .auth('admin', 'qwerty', { type: 'basic' });
    expect(getBlogsResult.body.items[0]?.banInfo.isBanned).toBe(false);
  });
  it('GET: [HOST]/posts/{:id} should return 404 for post1/blog if blog1 is banned', async () => {
    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/`)
      .expect(200);
    expect(getPostsResult.body.title).toBe('title-post1');
  });
  it('GET: [HOST]/posts should return code 200 and posts(unauthorized user)', async () => {
    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts`)
      .expect(200);
    expect(getPostsResult.body.totalCount).toBe(3);
    expect(getPostsResult.body.items.length).toBe(3);
  });
});
