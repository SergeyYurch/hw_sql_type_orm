import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { BlogViewModel } from '../src/blogs/dto/view-models/blog.view.model';
import { getApp } from '../test/test-utils';
import {
  blog1,
  blog2,
  blog3,
  user1,
  user2,
  user3,
} from '../test/tsts-input-data';

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;
  let user4Id: string;
  let blog1Id: string;
  let blog2Id: string;
  let blog3Id: string;
  let post1Id: string;
  let post2Id: string;
  let post3Id: string;
  let comment1Id: string;
  let comment2Id: string;
  let comment3Id: string;
  let blog1View: BlogViewModel;
  let blog2View: BlogViewModel;
  let blog3View: BlogViewModel;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;
  let accessTokenUser4: string;
  //setup
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
  it('POST: [HOST]/posts/{:postId}/comments - create comments', async () => {
    const createCommentResult1 = await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        content: 'string of comment1 content',
      })
      .expect(201);
    comment1Id = createCommentResult1.body.id;

    const createCommentResult2 = await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        content: 'string of comment2 content',
      })
      .expect(201);
    comment2Id = createCommentResult2.body.id;

    const createCommentResult3 = await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .send({
        content: 'string of comment2 content',
      })
      .expect(201);
    comment3Id = createCommentResult3.body.id;
  });

  //comments/{:commentId}/like-status Make like/unlike/dislike/undislike operation
  it("PUT: [HOST]/comments/{:commentId}/like-status - should return code 404 if post with specified postId doesn't exists", async () => {
    await request(app.getHttpServer())
      .put(`/comments/63f0dafc0278c74bf6967726/like-status`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(404);
  });
  it('PUT: [HOST]/comments/{:commentId}/like-status - should return code 400 if the inputModel has incorrect values', async () => {
    const likePostResult = await request(app.getHttpServer())
      .put(`/comments/${comment1Id}/like-status`)
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
  it('PUT: [HOST]/comments/{:commentId}/like-status - should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .put(`/comments/${comment1Id}/like-status`)
      .send({
        like: 'Like',
      })
      .expect(401);
  });
  it('PUT: [HOST]/comments/{:commentId}/like-status - should return code 204 nad change comments like-status', async () => {
    await request(app.getHttpServer())
      .put(`/comments/${comment1Id}/like-status`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/comments/${comment1Id}/like-status`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .send({
        likeStatus: 'Dislike',
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/comments/${comment2Id}/like-status`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);
  });

  //comments/{:commentId} Update existing comment by id with InputModel
  it("PUT: [HOST]/comments/{:commentId} - should return code 404 if post with specified postId doesn't exists", async () => {
    await request(app.getHttpServer())
      .put(`/comments/63f0dafc0278c74bf6967726`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        content: 'valid edit string comment1',
      })
      .expect(404);
  });
  it('PUT: [HOST]/comments/{:commentId} - should return code 400 if the inputModel has incorrect values', async () => {
    const likePostResult = await request(app.getHttpServer())
      .put(`/comments/${comment1Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        content: 'short string',
      })
      .expect(400);
    expect(likePostResult.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'content',
        },
      ],
    });
  });
  it('PUT: [HOST]/comments/{:commentId} - should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .put(`/comments/${comment1Id}`)
      .send({
        content: 'valid edit string comment1',
      })
      .expect(401);
  });
  it('PUT: [HOST]/comments/{:commentId} - should return code 204 and change comments like-status', async () => {
    await request(app.getHttpServer())
      .put(`/comments/${comment1Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        content: 'valid edit string comment1',
      })
      .expect(204);
  });
  it('PUT: [HOST]/comments/{:commentId} - should return code 403 ', async () => {
    await request(app.getHttpServer())
      .put(`/comments/${comment1Id}`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        content: 'valid edit string comment1',
      })
      .expect(403);
  });

  //comments/{:commentId}  Delete comment specified by id
  it("DELETE: [HOST]/comments/{:commentId} - should return code 404 if comment with specified id doesn't exists", async () => {
    await request(app.getHttpServer())
      .delete(`/comments/63f0dafc0278c74bf6967726`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(404);
  });
  it('DELETE: [HOST]/comments/{:commentId} - should return code 401 for unauthorized user', async () => {
    await request(app.getHttpServer())
      .delete(`/comments/${comment1Id}`)
      .expect(401);
  });
  it('DELETE: [HOST]/comments/{:commentId} - should return code 403 If try delete the comment that is not your own', async () => {
    await request(app.getHttpServer())
      .delete(`/comments/${comment1Id}`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(403);
  });
  it('DELETE: [HOST]/comments/{:commentId} - should return code 204 and delete comment', async () => {
    await request(app.getHttpServer())
      .delete(`/comments/${comment1Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(204);
  });

  //GET: [HOST]/comments/{:commentId} - return comment by id
  it("GET: [HOST]/comments/{:commentId} - should return code 404 if comment with specified id doesn't exists", async () => {
    await request(app.getHttpServer())
      .get(`/comments/63f0dafc0278c74bf6967726`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(404);
  });
  it('GET: [HOST]/comments/{:commentId} - should return code 200 and comment (query from USER1)', async () => {
    const getCommentResult = await request(app.getHttpServer())
      .get(`/comments/${comment2Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);
    expect(getCommentResult.body).toEqual({
      id: expect.any(String),
      content: 'string of comment2 content',
      commentatorInfo: {
        userId: user2Id,
        userLogin: user2.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });
  it('GET: [HOST]/comments/{:commentId} - should return code 200 and comment (query from USER3)', async () => {
    const getCommentResult = await request(app.getHttpServer())
      .get(`/comments/${comment2Id}`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .expect(200);
    expect(getCommentResult.body).toEqual({
      id: expect.any(String),
      content: 'string of comment2 content',
      commentatorInfo: {
        userId: user2Id,
        userLogin: user2.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
      },
    });
  });

  //user3 liked
  //Ban/Unbun user
  it('PUT: [HOST]/users: BAN user3', async () => {
    await request(app.getHttpServer())
      .put(`/sa/users/${user3Id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
        banReason: 'banReason is stringstringstringst',
      })
      .expect(204);
  });
  it("GET: [HOST]/comments/{:commentId} - shouldn't return banned user (USER3) comment", async () => {
    await request(app.getHttpServer())
      .get(`/comments/${comment3Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(404);
  });
  //Shouldn't return banned user like for comment. Should return unbanned user like for comment;

  //preparation
  it('1/testing/all-data (DELETE) clear DB', async () => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });
  it('1/sa/users (POST) add new user to the system', async () => {
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
  it('1POST:[HOST]/auth/login: signIn users', async () => {
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
  it('1POST:[HOST]/blogger/blogs: create newBlogs', async () => {
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
  it('1POST:[HOST]/blogger/blogs: create newPosts', async () => {
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
  //User1 created comment2Id for post1Id
  it('1POST: [HOST]/posts/{:postId}/comments - create comments', async () => {
    const createCommentResult2 = await request(app.getHttpServer())
      .post(`/posts/${post1Id}/comments`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        content: 'string of comment2 content',
      })
      .expect(201);
    comment2Id = createCommentResult2.body.id;
  });
  //User2 & User3 liked comment2Id
  it('PUT: [HOST]/comments/{:commentId}/like-status - should return code 204 & liked comment2Id', async () => {
    await request(app.getHttpServer())
      .put(`/comments/${comment2Id}/like-status`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/comments/${comment2Id}/like-status`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);
  });
  //Check like
  it('GET: [HOST]/comments/{:commentId} - should return code 200 and comment (query from USER1)', async () => {
    const getCommentResult = await request(app.getHttpServer())
      .get(`/comments/${comment2Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);
    expect(getCommentResult.body.likesInfo.likesCount).toBe(2);
  });

  it('PUT: [HOST]/users: BAN user2', async () => {
    await request(app.getHttpServer())
      .put(`/sa/users/${user2Id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
        banReason: 'banReason is stringstringstringst',
      })
      .expect(204);
  });
  it('GET: [HOST]/comments/{:commentId} - should return code 200 and comment with 1 count likes (query from USER1)', async () => {
    const getCommentResult = await request(app.getHttpServer())
      .get(`/comments/${comment2Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);
    expect(getCommentResult.body.likesInfo.likesCount).toBe(1);
  });
  //UNBAN user2
  it('PUT: [HOST]/users: UNBAN user2', async () => {
    await request(app.getHttpServer())
      .put(`/sa/users/${user2Id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: false,
        banReason: 'banReason is stringstringstringst',
      })
      .expect(204);
  });
  it('GET: [HOST]/comments/{:commentId} - should return code 200 and comment with 2 count likes (query from USER1)', async () => {
    const getCommentResult = await request(app.getHttpServer())
      .get(`/comments/${comment2Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);
    expect(getCommentResult.body.likesInfo.likesCount).toBe(2);
  });
});
