import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { BlogViewModel } from '../src/features/blogs/dto/view-models/blog.view.model';
import { getApp } from './test-utils';
import {
  bannedUser,
  blog1,
  blog2,
  blog3,
  blog4,
  user1,
  user2,
  user3,
} from './tsts-input-data';

//Bloggers: user1, user2, user3
//User1 created: blog1User1, blog2User1, blog3User1Id
//User3 created: blog4User3Id
//blog1User1 have been deleted

//User1 created post1Blog3, post2Blog3Id
//User3 created post1Blog4
//post1Blog3 Have been deleted
//User1 create post4Blog2
//User2 created comment for post4Blog2Id
//User3 created comment for post4Blog2Id

describe('BloggerBlogController (e2e)', () => {
  let app: INestApplication;
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;
  let bannedUserId: string;
  let blog1User1Id: string;
  let blog2User1Id: string;
  let blog3User1Id: string;
  let blog4User3Id: string;
  let blog1User1View: BlogViewModel;
  let blog2User1View: BlogViewModel;
  let blog3User1View: BlogViewModel;
  let post1Blog3Id: string;
  let post2Blog3Id: string;
  let post3Id: string;
  let post4Blog2Id: string;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;
  let accessTokenBannedUser: string;

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
      .send(user2);
    user2Id = newUser2.body.id;

    //create new user3
    const newUser3 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user3);
    user3Id = newUser3.body.id;

    //create user (for testing banned users)
    const newUser4 = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(bannedUser);
    bannedUserId = newUser4.body.id;
    // await request(app.getHttpServer())
    //   .put(`/sa/users/${bannedUserId}/ban`)
    //   .auth('admin', 'qwerty', { type: 'basic' })
    //   .send({
    //     isBanned: true,
    //     banReason: 'banReason is test-test',
    //   })
    //   .expect(204);
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
  });

  //POST blogger/blogs - Create new blog (USER1 - is blogger)
  it('POST:[HOST]/blogger/blogs: should return code 401 "Unauthorized" for unauthorized request', async () => {
    await request(app.getHttpServer())
      .post('/blogger/blogs')
      .send(blog1)
      .expect(401);
  });
  it('POST:[HOST]/blogger/blogs: should return code 201 and newBlog for correct input data', async () => {
    //user1 created blog1, blog2, blog3
    const newBlog1 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send(blog1)
      .expect(201);
    blog1User1View = newBlog1.body;
    blog1User1Id = newBlog1.body.id;
    const newBlog2 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send(blog2)
      .expect(201);
    blog2User1View = newBlog2.body;
    blog2User1Id = newBlog2.body.id;

    const newBlog3 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send(blog3)
      .expect(201);
    blog3User1View = newBlog3.body;
    blog3User1Id = newBlog3.body.id;
    expect(newBlog3.body).toEqual({
      id: expect.any(String),
      name: 'blog3',
      websiteUrl: 'https://youtube3.com',
      description: 'description3',
      createdAt: expect.any(String),
      isMembership: false,
    });

    //user3 created blog4
    const newBlog4 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser3, { type: 'bearer' })
      .send(blog4)
      .expect(201);
    blog4User3Id = newBlog4.body.id;
  });
  it('POST:[HOST]/blogger/blogs: should return code 400 and error with field name for blog without name ', async () => {
    const newBlog1 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        description: 'description1',
        websiteUrl: 'https://youtube1.com',
      })
      .expect(400);

    expect(newBlog1.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'name',
        },
      ],
    });
  });
  it('POST:[HOST]/blogger/blogs: should return code 400 and error with field name for blog with long name ', async () => {
    const newBlog1 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        name: '123456789123456789',
        description: 'description1',
        websiteUrl: 'https://youtube2.com',
      })
      .expect(400);

    expect(newBlog1.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'name',
        },
      ],
    });
  });
  it('POST:[HOST]/blogger/blogs: should return code 400 and error with field name for blog with empty___ name ', async () => {
    const newBlog1 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        name: '         ',
        description: 'description1',
        websiteUrl: 'https://youtube2.com',
      })
      .expect(400);

    expect(newBlog1.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'name',
        },
      ],
    });
  });
  it('POST:[HOST]/blogger/blogs: should return code 400 and error with field websiteUrl for blog with incorrect websiteUrl ', async () => {
    const newBlog1 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        name: 'name',
        description: 'description1',
        websiteUrl: 'youtube2.com',
      })
      .expect(400);

    expect(newBlog1.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'websiteUrl',
        },
      ],
    });
  });
  it('POST:[HOST]/blogger/blogs: should return code 400 and error with field description for blog without description ', async () => {
    const newBlog1 = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        name: 'name',
        websiteUrl: 'https://youtube2.com',
      })
      .expect(400);

    expect(newBlog1.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'description',
        },
      ],
    });
  });

  //GET:[HOST]/blogger/blogs -  Returns blogs (if current user is owner) with paging Parameters
  it('GET:[HOST]/blogger/blogs: should return code 401 ', async () => {
    const user1Blogs = await request(app.getHttpServer())
      .get('/blogger/blogs?sortDirection=asc')
      .expect(401);
  });
  it('GET:[HOST]/blogger/blogs: should return code 200 and array with 3 elements with default paginator & sortDirection=asc', async () => {
    const user1Blogs = await request(app.getHttpServer())
      .get('/blogger/blogs?sortDirection=asc')
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);

    expect(user1Blogs.body.totalCount).toBe(3);
    expect(user1Blogs.body.items[0]).toEqual({
      id: expect.any(String),
      name: 'blog1',
      description: 'description1',
      websiteUrl: 'https://youtube1.com',
      createdAt: expect.any(String),
      isMembership: false,
    });

    expect(user1Blogs.body.items[1]).toEqual({
      id: expect.any(String),
      name: 'blog2',
      description: 'description2',
      websiteUrl: 'https://youtube2.com',
      createdAt: expect.any(String),
      isMembership: false,
    });
  });
  it('GET:[HOST]/blogger/blogs: should return code 200 and array with 0 elements with default paginator for user2', async () => {
    const user2Blogs = await request(app.getHttpServer())
      .get('/blogger/blogs?sortDirection=asc')
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(200);

    expect(user2Blogs.body.totalCount).toBe(0);
  });
  it('GET:[HOST]/blogger/blogs: should return code 200 and array with 1 elements with queryParams:pageSize=1&sortDirection=asc', async () => {
    const blogs = await request(app.getHttpServer())
      .get('/blogger/blogs?pageSize=1&sortDirection=asc')
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);
    expect(blogs.body.items.length).toBe(1);

    expect(blogs.body.items[0]).toEqual({
      id: expect.any(String),
      name: 'blog1',
      description: 'description1',
      websiteUrl: 'https://youtube1.com',
      createdAt: expect.any(String),
      isMembership: false,
    });
  });
  it('GET:[HOST]/blogger/blogs: should return code 200 and array with 1 elements with queryParams:searchNameTerm=g2', async () => {
    const blogs = await request(app.getHttpServer())
      .get('/blogger/blogs?searchNameTerm=g2')
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);
    expect(blogs.body.items.length).toBe(1);

    expect(blogs.body.items[0]).toEqual({
      id: expect.any(String),
      name: 'blog2',
      description: 'description2',
      websiteUrl: 'https://youtube2.com',
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  //DELETE:[HOST]/blogger/blogs/{:id}: - delete blog1 by ID
  it('DELETE:[HOST]/blogger/blogs/{:id}: should return code 401 "Unauthorized" for unauthorized request', async () => {
    await request(app.getHttpServer()).delete('/blogger/blogs/1').expect(401);
  });
  it('DELETE:[HOST]/blogger/blogs/{:id}: should return code 404 for incorrect ID', async () => {
    await request(app.getHttpServer())
      .delete('/blogger/blogs/qwerty')
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(404);
  });
  it('DELETE:[HOST]/blogger/blogs/{:id}: should return code 403- Forbidden if user3 tries delete a blog that was created user1', async () => {
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blog1User1Id}`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .expect(403);
  });
  it('DELETE:[HOST]/blogger/blogs/{:id}: should return code 204 for correct request, and should return 404 for GET by id', async () => {
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blog1User1Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(204);

    const blogs = await request(app.getHttpServer())
      .get('/blogger/blogs')
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);

    expect(blogs.body.totalCount).toBe(2);
  });

  //PUT:[HOST]/blogger/blogs/{:id} - edit blog2
  it('PUT:[HOST]/blogger/blogs/{:id}: should return code 401 "Unauthorized" for unauthorized request', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blog2User1Id}`)
      .expect(401);
  });
  it('PUT:[HOST]/blogger/blogs/{:id}: should return code 403 Forbidden if user3 tries edit a blog that was created user1', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blog2User1Id}`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .send({
        name: 'blog5',
        description: 'description-edit',
        websiteUrl: 'https://youtube5.com',
      })
      .expect(403);
  });
  it('PUT:[HOST]/blogger/blogs/{:id}: should return code 204 correct input data', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blog2User1Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        name: 'blog2',
        description: 'description-edit',
        websiteUrl: 'https://youtube5.com',
      })
      .expect(204);
    const changedBlog = await request(app.getHttpServer()).get(
      `/blogs/${blog2User1Id}`,
    );
    expect(changedBlog.body).toEqual({
      id: expect.any(String),
      name: 'blog2',
      description: 'description-edit',
      websiteUrl: 'https://youtube5.com',
      createdAt: expect.any(String),
      isMembership: false,
    });
  });
  it('PUT:[HOST]/blogger/blogs/{:id}: should return code 404 for incorrect ID', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/blogs/3333333333333`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        name: 'blog5',
        description: 'description-edit',
        websiteUrl: 'https://youtube5.com',
      })
      .expect(404);
  });
  it('PUT:[HOST]/blogger/blogs/{:id}: should return code 400 for incorrect input data', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blog2User1Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        name: 'blog5',
        description: 'description-edit',
        websiteUrl: 'youtube5.com',
      })
      .expect(400);
  });

  //POST:[HOST]/blogger/blogs/{:blogId}/posts  - Create new post for blog3
  it('POST:[HOST]/blogger/blogs/{:blogId}/posts: should return code 401 "Unauthorized" for unauthorized request', async () => {
    await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog2User1Id}/posts`)
      .send({
        title: 'title1',
        shortDescription: 'shortDescription1',
        content: 'content1',
      })
      .expect(401);
  });
  it("POST:[HOST]/blogger/blogs/{:blogId}/posts: should return code 403 if user try to add post to blog that doesn't belong to current user", async () => {
    await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog3User1Id}/posts`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        title: 'title1',
        shortDescription: 'shortDescription1',
        content: 'content1',
      })
      .expect(403);
  });
  it("POST:[HOST]/blogger/blogs/{:blogId}/posts: should return code 404 if specific blog doesn't exists", async () => {
    await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog1User1Id}/posts`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        title: 'title1',
        shortDescription: 'shortDescription1',
        content: 'content1',
      })
      .expect(404);
  });
  it('POST:[HOST]/blogger/blogs/{:blogId}/posts: should return code 400 if the inputModel has incorrect values', async () => {
    const newPost1 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog3User1Id}/posts`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'title1',
        shortDescription: 'shortDescription1',
      })
      .expect(400);
  });
  it('POST:[HOST]/blogger/blogs/{:blogId}/posts: should return code 201 and newPost for correct input data', async () => {
    const newPost1 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog3User1Id}/posts`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'post1Blog3',
        shortDescription: 'shortDescription',
        content: 'content',
      })
      .expect(201);
    post1Blog3Id = newPost1.body.id;

    expect(newPost1.body).toEqual({
      id: expect.any(String),
      title: 'post1Blog3',
      shortDescription: 'shortDescription',
      content: 'content',
      blogId: blog3User1Id,
      blogName: blog3.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    const newPost2 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog3User1Id}/posts`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'post2Blog3',
        shortDescription: 'shortDescription',
        content: 'content',
      })
      .expect(201);
    post2Blog3Id = newPost2.body.id;
  });

  //POST:[HOST]/blogger/blogs/{:blogId}/posts  - Create new post for blog4
  it('POST:[HOST]/blogger/blogs/{:blogId}/posts: should return code 201 and newPost4', async () => {
    const newPost4 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog4User3Id}/posts`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .send({
        title: 'title4',
        shortDescription: 'shortDescription4',
        content: 'content4',
      })
      .expect(201);
    post4Blog2Id = newPost4.body.id;
  });

  //PUT:[HOST]/blogger/blogs/posts/{:postId}  - edit post
  it('PUT:[HOST]/blogger/blogs/posts/{:postId} : should return code 401 "Unauthorized" for unauthorized request', async () => {
    const newPost1 = await request(app.getHttpServer())
      .put(`/blogger/blogs/${blog3User1Id}/posts/${post1Blog3Id}`)
      .send({
        title: 'title1',
        shortDescription: 'shortDescription1',
        content: 'content1',
      })
      .expect(401);
  });
  it('PUT:[HOST]/blogger/blogs/posts/{:postId} : should return code  403 Forbidden if user3 tries edit a post that was created user1', async () => {
    const editPost1 = await request(app.getHttpServer())
      .put(`/blogger/blogs/${blog3User1Id}/posts/${post1Blog3Id}`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        title: 'title1-edit',
        shortDescription: 'shortDescription1-edit',
        content: 'content1-edit',
      })
      .expect(403);
  });
  it('PUT:[HOST]/blogger/blogs/posts/{:postId} : should return code  404 Not Found if postId is incorrect', async () => {
    const editPost1 = await request(app.getHttpServer())
      .put(`/blogger/blogs/${blog3User1Id}/posts/111111111111`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'title1-edit',
        shortDescription: 'shortDescription1-edit',
        content: 'content1-edit',
      })
      .expect(404);
  });
  it('PUT:[HOST]/blogger/blogs/posts/{:postId} : should return code  404 Not Found if blogId is incorrect', async () => {
    const editPost1 = await request(app.getHttpServer())
      .put(`/blogger/blogs/33333333333/posts/${post1Blog3Id}`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        title: 'title1-edit',
        shortDescription: 'shortDescription1-edit',
        content: 'content1-edit',
      })
      .expect(404);
  });
  it('PUT:[HOST]/blogger/blogs/posts/{:postId} : should return code 204 for correct input data', async () => {
    const editPost1 = await request(app.getHttpServer())
      .put(`/blogger/blogs/${blog3User1Id}/posts/${post1Blog3Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'blog3',
        shortDescription: 'shortDescription-edit',
        content: 'content-edit',
      })
      .expect(204);
  });

  //DELETE:[HOST]/blogger/blogs/posts/{:postId} delete Blog3
  it('DELETE:[HOST]/blogger/blogs/posts/{:postId} : should return code 401 "Unauthorized" for unauthorized request', async () => {
    const newPost1 = await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blog3User1Id}/posts/${post1Blog3Id}`)
      .expect(401);
  });
  it('DELETE:[HOST]/blogger/blogs/posts/{:postId} : should return code  403 Forbidden if user3 tries edit a post that was created user1', async () => {
    const editPost1 = await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blog3User1Id}/posts/${post1Blog3Id}`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(403);
  });
  it('DELETE:[HOST]/blogger/blogs/posts/{:postId} : should return code  404 Not Found if postId is incorrect', async () => {
    const editPost1 = await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blog3User1Id}/posts/111111111111`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(404);
  });
  it('DELETE:[HOST]/blogger/blogs/posts/{:postId} : should return code  404 Not Found if blogId is incorrect', async () => {
    const editPost1 = await request(app.getHttpServer())
      .delete(`/blogger/blogs/33333333333/posts/${post1Blog3Id}`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .expect(404);
  });
  it('DELETE:[HOST]/blogger/blogs/posts/{:postId} : should return code 204 for correct input data', async () => {
    const editPost1 = await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blog3User1Id}/posts/${post1Blog3Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blog3User1Id}/posts/${post1Blog3Id}`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'title1-edit',
        shortDescription: 'shortDescription1-edit',
        content: 'content1-edit',
      })
      .expect(404);
  });

  //GET:[HOST]/blogger/blogs/comments -  Returns all comments for all posts inside all current user blogs
  //additional data preparation...
  //prepare
  it('POST:[HOST]/blogger/blogs: user1 create post4 for blog2', async () => {
    const newPost4 = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blog2User1Id}/posts`)
      .auth(accessTokenUser1, { type: 'bearer' })
      .send({
        title: 'post4Blog2',
        shortDescription: 'shortDescription',
        content: 'content',
      })
      .expect(201);
    post4Blog2Id = newPost4.body.id;
  });
  it('POST: [HOST]/posts/{:postId}/comments - User2 & User3 create comment for post4Blog2Id', async () => {
    await request(app.getHttpServer())
      .post(`/posts/${post4Blog2Id}/comments`)
      .auth(accessTokenUser2, { type: 'bearer' })
      .send({
        content: 'User2 create comment: comment',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/posts/${post4Blog2Id}/comments`)
      .auth(accessTokenUser3, { type: 'bearer' })
      .send({
        content: 'User3 create comment: comment',
      })
      .expect(201);
  });

  //main tests
  it('GET:[HOST]/blogger/blogs/comments: should return code 401 ', async () => {
    const user1Blogs = await request(app.getHttpServer())
      .get('/blogger/blogs/comments')
      .expect(401);
  });
  it('GET:[HOST]/blogger/blogs/comments: should return code 200 and array with 2 elements with default paginator', async () => {
    const user1Blogs = await request(app.getHttpServer())
      .get('/blogger/blogs/comments')
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);

    expect(user1Blogs.body.totalCount).toBe(2);
    expect(user1Blogs.body.items[0]).toEqual({
      id: expect.any(String),
      content: 'User3 create comment: comment',
      commentatorInfo: {
        userId: user3Id,
        userLogin: 'user3',
      },
      createdAt: expect.any(String),
      postInfo: {
        id: post4Blog2Id,
        title: 'post4Blog2',
        blogId: blog2User1Id,
        blogName: 'blog2',
      },
    });
    expect(user1Blogs.body.items[1].commentatorInfo.userId).toBe(user2Id);
  });
  it('GET:[HOST]/blogger/blogs/comments: should return code 200 and array with 2 elements with queryParams:pageSize=1&sortDirection=asc', async () => {
    const user1Blogs = await request(app.getHttpServer())
      .get('/blogger/blogs/comments?pageSize=1&sortDirection=asc')
      .auth(accessTokenUser1, { type: 'bearer' })
      .expect(200);

    expect(user1Blogs.body.totalCount).toBe(2);
    expect(user1Blogs.body.items[1]).toBeUndefined();
  });
});
