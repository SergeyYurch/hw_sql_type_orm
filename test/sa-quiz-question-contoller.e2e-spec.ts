import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { getApp } from './test-utils';
import { question1 } from './tsts-input-data';

describe('QuizQuestionController (e2e)', () => {
  let app: INestApplication;
  const questions = [];

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
  it('/sa/quiz/questions (POST) Add new question. Not authorization. Should return 401.', async () => {
    //create new question
    await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .send(question1)
      .expect(401);
  });
  it('/sa/quiz/questions (POST) Add new question. Wrong input data. Should return 400.', async () => {
    //create new question
    await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ body: 'ssss', correctAnswers: ['a1', 'a2'] })
      .expect(400);
  });
  it('/sa/quiz/questions (POST) Add new 5 questions. Should return 201.', async () => {
    //create new question
    for (let i = 1; i < 6; i++) {
      const res = await request(app.getHttpServer())
        .post('/sa/quiz/questions')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          body: `body question${i}`,
          correctAnswers: [`answ1 for q${i}`, `answ2 for q${i}`],
        })
        .expect(201);
      questions.push(res.body);
    }
  });

  //checking GET questions && pagination. Returns all questions with pagination and filtering Parameters
  it('/sa/quiz/questions (GET). Default pagination. No search filters. Should return 200.', async () => {
    //create new question
    const res = await request(app.getHttpServer())
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(res.body.totalCount).toBe(5);
    expect(res.body.items.length).toBe(5);
    expect(res.body.items[0].body).toBe('body question5');
  });
  it('/sa/quiz/questions (GET). Query param: sortDirection=asc. No search filters. Should return 200.', async () => {
    //create new question
    const res = await request(app.getHttpServer())
      .get('/sa/quiz/questions?sortDirection=asc')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(res.body.totalCount).toBe(5);
    expect(res.body.items.length).toBe(5);
    expect(res.body.items[0].body).toBe('body question1');
  });
  it('/sa/quiz/questions (GET). Query param: bodySearchTerm=dy3. No search filters. Should return 200.', async () => {
    //create new question
    const res = await request(app.getHttpServer())
      .get('/sa/quiz/questions?bodySearchTerm=Ion3')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(res.body.totalCount).toBe(1);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].body).toBe('body question3');
  });

  //checking edit question
  it('/sa/quiz/questions/:id (PUT) Update question1. Should return 204.', async () => {
    //create new question
    await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${questions[0].id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: 'update body',
        correctAnswers: ['update answ1', 'update answ2'],
      })
      .expect(204);
  });

  //checking publish question
  it('/sa/quiz/questions/:id/publish (PUT) Publish question2. Wrong id. Should return 404.', async () => {
    //create new question
    await request(app.getHttpServer())
      .put(`/sa/quiz/questions/1111111/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        published: true,
      })
      .expect(204);
  });

  it('/sa/quiz/questions/:id/publish (PUT) Publish question2. Should return 204.', async () => {
    //create new question
    await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${questions[1].id}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        published: true,
      })
      .expect(204);
  });
  it('/sa/quiz/questions (GET). Query param: publishedStatus=published. Should return 200.', async () => {
    //create new question
    const res = await request(app.getHttpServer())
      .get('/sa/quiz/questions?publishedStatus=published')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(res.body.totalCount).toBe(1);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].body).toBe('body question2');
  });
  it('/sa/quiz/questions (GET). Query param: publishedStatus=notPublished.Should return 200.', async () => {
    //create new question
    const res = await request(app.getHttpServer())
      .get('/sa/quiz/questions?publishedStatus=notPublished')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(res.body.totalCount).toBe(4);
    expect(res.body.items.length).toBe(4);
  });
  it('/sa/quiz/questions (GET). Query param: publishedStatus=all. Should return 200.', async () => {
    //create new question
    const res = await request(app.getHttpServer())
      .get('/sa/quiz/questions?publishedStatus=all')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(res.body.totalCount).toBe(5);
    expect(res.body.items.length).toBe(5);
  });
});
