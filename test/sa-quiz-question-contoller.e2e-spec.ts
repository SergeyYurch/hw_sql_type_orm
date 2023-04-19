import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { getApp } from './test-utils';
import { question1 } from './tsts-input-data';
import any = jasmine.any;

describe('QuizQuestionController (e2e)', () => {
  let app: INestApplication;
  let question1Id: string;
  let question2Id: string;

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
    const newUser1 = await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .send(question1)
      .expect(401);
    question1Id = newUser1.body.id;
  });

  it('/sa/quiz/questions (POST) Add new question. Wrong input data. Should return 400.', async () => {
    //create new question
    const newQuestion1 = await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ body: 'ssss', correctAnswers: ['a1', 'a2'] })
      .expect(400);
    question1Id = newQuestion1.body.id;
  });

  it('/sa/quiz/questions (POST) Add new question. Should return 201.', async () => {
    //create new question
    const newQuestion1 = await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(question1)
      .expect(201);
    question1Id = newQuestion1.body.id;
    expect(newQuestion1.body).toEqual({
      body: 'body question1',
      correctAnswers: ['answer1 for q1', 'answer2 for q1'],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      published: false,
      id: expect.any(String),
    });
  });
});
