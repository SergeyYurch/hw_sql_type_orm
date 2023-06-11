import { INestApplication } from '@nestjs/common';
import { disconnect } from 'mongoose';
import { BlogViewModel } from '../src/features/blogs/dto/view-models/blog.view.model';
import { getApp } from './test-utils';
import { PrepareTestHelpers } from './helpers/prepaire.test.helpers';
import { UserViewModel } from '../src/features/users/dto/view-models/user.view.model';
import { BlogsTestHelpers } from './helpers/blogs.test.helpers';
import request from 'supertest';
import { SubscriptionStatuses } from '../src/features/blogs/types/subscription-statuses.enum';
import { response } from 'express';

describe('BlogController - subscribe (e2e)', () => {
  let app: INestApplication;
  let prepareTestHelpers: PrepareTestHelpers;
  let blogsTestHelpers: BlogsTestHelpers;
  let accessTokens: string[] = [];
  let users: UserViewModel[] = [];
  const blogs: BlogViewModel[] = [];
  let authBotLink: string;

  beforeAll(async () => {
    app = await getApp();
    prepareTestHelpers = new PrepareTestHelpers(app);
    blogsTestHelpers = new BlogsTestHelpers(app);
  });
  afterAll(async () => {
    await disconnect();
    await app.close();
  });

  // ********[HOST]/blogs**********

  //preparation
  it('prepare', async () => {
    const countOfUsers = 3;
    const accountsData = await prepareTestHelpers.prepareAccounts({
      countOfUsers,
    });
    accessTokens = accountsData.accessTokens;
    users = accountsData.users;
    //user1 create blog
    const blog = await blogsTestHelpers.createBlog(
      accessTokens[0],
      users[0].id,
      1,
    );
    expect(blog).toEqual({
      id: expect.any(String),
      name: `blog#1U:${users[0].id}`,
      description: `description of blog#1user${users[0].id}`,
      websiteUrl: `https://blogWebsite#1user${users[0].id}.com`,
      createdAt: expect.any(String),
      isMembership: false,
      images: {
        wallpaper: null,
        main: [],
      },
      currentUserSubscriptionStatus: 'None',
      subscribersCount: 0,
    });
    blogs.push(blog);
  });

  //user2 subscribes to blog1
  it('subscribe', async () => {
    const url = `/blogger/blogs/${blogs[0].id}/subscription`;
    await request(app.getHttpServer())
      .post(url)
      .auth(accessTokens[1], { type: 'bearer' })
      .expect(204);
  });
  //user3 subscribes to blog1
  it('subscribe', async () => {
    const url = `/blogger/blogs/${blogs[0].id}/subscription`;
    await request(app.getHttpServer())
      .post(url)
      .auth(accessTokens[2], { type: 'bearer' })
      .expect(204);
  });

  it('getBlog by Id', async () => {
    const url = `/blogs/${blogs[0].id}`;
    const response = await request(app.getHttpServer())
      .get(url)
      .auth(accessTokens[1], { type: 'bearer' })
      .expect(200);
    console.log('t555');
    console.log(response.body);
    expect(response.body).toEqual({
      id: expect.any(String),
      name: blogs[0].name,
      description: blogs[0].description,
      websiteUrl: blogs[0].websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
      images: {
        main: expect.any(Array),
        wallpaper: null,
      },
      currentUserSubscriptionStatus: SubscriptionStatuses.SUBSCRIBED,
      subscribersCount: 2,
    });
  });

  //user2 unsubscribes to blog1
  it('unsubscribe', async () => {
    const url = `/blogger/blogs/${blogs[0].id}/subscription`;
    await request(app.getHttpServer())
      .delete(url)
      .auth(accessTokens[1], { type: 'bearer' })
      .expect(204);
  });
  it('getBlog by Id after unsubscribe', async () => {
    const url = `/blogs/${blogs[0].id}`;
    const response = await request(app.getHttpServer())
      .get(url)
      .auth(accessTokens[1], { type: 'bearer' })
      .expect(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      name: blogs[0].name,
      description: blogs[0].description,
      websiteUrl: blogs[0].websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
      images: {
        main: expect.any(Array),
        wallpaper: null,
      },
      currentUserSubscriptionStatus: SubscriptionStatuses.UNSUBSCRIBED,
      subscribersCount: 1,
    });
  });

  //user2 subscribes to blog1
  it('re-subscribe', async () => {
    const url = `/blogger/blogs/${blogs[0].id}/subscription`;
    await request(app.getHttpServer())
      .post(url)
      .auth(accessTokens[1], { type: 'bearer' })
      .expect(204);
  });
  it('getBlog by Id for re-subscribed user', async () => {
    const url = `/blogs/${blogs[0].id}`;
    const response = await request(app.getHttpServer())
      .get(url)
      .auth(accessTokens[1], { type: 'bearer' })
      .expect(200);
    console.log('t555');
    console.log(response.body);
    expect(response.body).toEqual({
      id: expect.any(String),
      name: blogs[0].name,
      description: blogs[0].description,
      websiteUrl: blogs[0].websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
      images: {
        main: expect.any(Array),
        wallpaper: null,
      },
      currentUserSubscriptionStatus: SubscriptionStatuses.SUBSCRIBED,
      subscribersCount: 2,
    });
  });

  //request telegram bot link

  it('get telegram bot link', async () => {
    const url = `/integrations/telegram/auth-bot-link`;
    const response = await request(app.getHttpServer())
      .get(url)
      .auth(accessTokens[1], { type: 'bearer' })
      .expect(200);

    expect(response.body).toEqual({
      link: expect.any(String),
    });
    authBotLink = response.body.link;
    console.log('authBotLink');
    console.log(authBotLink);
  });
});
