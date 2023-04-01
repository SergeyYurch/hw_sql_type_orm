import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { BlogViewModel } from '../src/blogs/dto/view-models/blog.view.model';
import { getApp } from './test-utils';
import { blog1, blog2, blog3, user1, user2, user3 } from './tsts-input-data';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;
  let blog1Id: string;
  let blog2Id: string;
  let blog3Id: string;
  let post1Id: string;
  let post2Id: string;
  let post3Id: string;
  let blog1View: BlogViewModel;
  let blog2View: BlogViewModel;
  let blog3View: BlogViewModel;
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

  // ********[HOST]/blogs**********

  //preparation
  it('/testing/all-data (DELETE) clear DB', async () => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });
  it('/sa/users (POST) add new user to the system', async () => {
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
  it('POST:[HOST]/auth/login: signIn users', async () => {
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
  });
  it('POST:[HOST]/blogger/blogs: create newBlogs', async () => {
    const newBlog1 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send(blog1)
      .expect(201);
    blog1View = newBlog1.body;
    blog1Id = newBlog1.body.id;
    const newBlog2 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send(blog2)
      .expect(201);
    blog2View = newBlog2.body;
    blog2Id = newBlog2.body.id;

    const newBlog3 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send(blog3)
      .expect(201);
    blog3View = newBlog3.body;
    blog3Id = newBlog3.body.id;
  });
  it('POST:[HOST]/blogger/blogs: create newPosts', async () => {
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
      .post(`/blogger/blogs/${blog2Id}/posts`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'title3',
        shortDescription: 'shortDescription3',
        content: 'content3',
      })
      .expect(201);
    post3Id = newPost3.body.id;
  });

  //GET: [HOST]/posts - Returns all posts
  it('GET: [HOST]/posts should return code 200 and posts(unauthorized user)', async () => {
    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts`)
      .expect(200);
    expect(getPostsResult.body.totalCount).toBe(3);
    expect(getPostsResult.body.items[2]).toEqual({
      id: expect.any(String),
      title: 'title1',
      shortDescription: 'shortDescription1',
      content: 'content1',
      blogId: blog1Id,
      blogName: blog1.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });
  });

  //GET: [HOST]/posts/{:id} - Return post by id
  it('GET: [HOST]/posts/{:id} should return code 200 and posts(unauthorized user)', async () => {
    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/`)
      .expect(200);
    expect(getPostsResult.body).toEqual({
      id: expect.any(String),
      title: 'title1',
      shortDescription: 'shortDescription1',
      content: 'content1',
      blogId: blog1Id,
      blogName: blog1.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });
  });
  it('GET: [HOST]/posts/{:id} should return code 200 and posts(authorized user2)', async () => {
    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(200);
    expect(getPostsResult.body).toEqual({
      id: expect.any(String),
      title: 'title1',
      shortDescription: 'shortDescription1',
      content: 'content1',
      blogId: blog1Id,
      blogName: blog1.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });
  });

  //posts/{postId}/like-status Make like/unlike/dislike/undislike operation
  it("PUT: [HOST]/posts/{:postId}/like-status - should return code 404 if post with specified postId doesn't exists", async () => {
    await request(app.getHttpServer())
      .put(`/posts/63f0dafc0278c74bf6967726/like-status`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(404);
  });
  it('PUT: [HOST]/posts/{:postId}/like-status - should return code 400 if the inputModel has incorrect values', async () => {
    const likePostResult = await request(app.getHttpServer())
      .put(`/posts/${post1Id}/like-status`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        like: 'Like',
      })
      .expect(400);
    expect(likePostResult.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'likeStatus',
        },
      ],
    });
  });
  it('PUT: [HOST]/posts/{:postId}/like-status - should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .put(`/posts/${post1Id}/like-status`)
      .expect(401);
  });
  it('PUT: [HOST]/posts/{:postId}/like-status -LIKE- should return code 204 nad change posts like-status', async () => {
    await request(app.getHttpServer())
      .put(`/posts/${post1Id}/like-status`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);

    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(200);
    expect(getPostsResult.body).toEqual({
      id: expect.any(String),
      title: 'title1',
      shortDescription: 'shortDescription1',
      content: 'content1',
      blogId: blog1Id,
      blogName: blog1.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: [
          {
            addedAt: expect.any(String),
            login: user2.login,
            userId: user2Id,
          },
        ],
      },
    });
  });
  it('GET: [HOST]/posts/{:id} should return code 200 and post1 myStatus:NONE (authorized user2)', async () => {
    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .expect(200);
    expect(getPostsResult.body).toEqual({
      id: expect.any(String),
      title: 'title1',
      shortDescription: 'shortDescription1',
      content: 'content1',
      blogId: blog1Id,
      blogName: blog1.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [
          {
            addedAt: expect.any(String),
            login: user2.login,
            userId: user2Id,
          },
        ],
      },
    });
  });
  it('PUT: [HOST]/posts/{:postId}/like-status -DISLIKE- should return code 204 nad change posts like-status', async () => {
    await request(app.getHttpServer())
      .put(`/posts/${post1Id}/like-status`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        likeStatus: 'Dislike',
      })
      .expect(204);

    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(200);
    expect(getPostsResult.body).toEqual({
      id: expect.any(String),
      title: 'title1',
      shortDescription: 'shortDescription1',
      content: 'content1',
      blogId: blog1Id,
      blogName: blog1.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 1,
        myStatus: 'Dislike',
        newestLikes: [],
      },
    });
  });
  it('PUT: [HOST]/posts/{:postId}/like-status -NONE- should return code 204 nad change posts like-status', async () => {
    await request(app.getHttpServer())
      .put(`/posts/${post1Id}/like-status`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        likeStatus: 'None',
      })
      .expect(204);

    const getPostsResult = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(200);
    expect(getPostsResult.body).toEqual({
      id: expect.any(String),
      title: 'title1',
      shortDescription: 'shortDescription1',
      content: 'content1',
      blogId: blog1Id,
      blogName: blog1.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });
  });

  //POST: posts/{postId}/comments Create new comment
  it("POST: [HOST]/posts/{:postId}/comments - should return code 404 if post with specified postId doesn't exists", async () => {
    await request(app.getHttpServer())
      .post(`/posts/63f0dafc0278c74bf6967726/comments`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        content: 'string of comments content',
      })
      .expect(404);
  });
  it('POST: [HOST]/posts/{:postId}/comments - should return code 400 if the inputModel has incorrect values', async () => {
    const createCommentResult = await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        content: 'st',
      })
      .expect(400);

    expect(createCommentResult.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'content',
        },
      ],
    });
  });
  it('POST: [HOST]/posts/{:postId}/comments- should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .send({
        content: 'string of comments content',
      })
      .expect(401);
  });
  it('POST: [HOST]/posts/{:postId}/comments - should return code 201 & newly comment', async () => {
    const createCommentResult = await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        content: 'string of comment1 content',
      })
      .expect(201);
    expect(createCommentResult.body).toEqual({
      id: expect.any(String),
      content: 'string of comment1 content',
      commentatorInfo: {
        userId: user2Id,
        userLogin: user2.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });

    await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .send({
        content: 'string of comment2 content',
      })
      .expect(201);
  });

  //GET: posts/{postId}/comments - Returns comments for specified post
  it("GET: [HOST]/posts/{:postId}/comments - should return code 404 if post with specified postId doesn't exists", async () => {
    await request(app.getHttpServer())
      .get(`/posts/63f0dafc0278c74bf6967726/comments`)
      .expect(404);
  });
  it('GET: [HOST]/posts/{:postId}/comments - should return code 200 and comments', async () => {
    const getCommentResult = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(200);
    expect(getCommentResult.body.items[0]).toEqual({
      id: expect.any(String),
      content: 'string of comment2 content',
      commentatorInfo: {
        userId: user3Id,
        userLogin: user3.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });
  it('GET: [HOST]/posts/{:postId}/comments - should return code 200 and comments with pagination', async () => {
    const getCommentResult = await request(app.getHttpServer())
      .get(`/posts/${post1Id}/comments?pageSize=1&pageNumber=1`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(200);
    expect(getCommentResult.body.items[0]).toEqual({
      id: expect.any(String),
      content: 'string of comment2 content',
      commentatorInfo: {
        userId: user3Id,
        userLogin: user3.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });
});
