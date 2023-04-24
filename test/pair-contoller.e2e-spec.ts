import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { disconnect } from 'mongoose';
import { getApp } from './test-utils';
import { isoPattern } from './tsts-input-data';

describe('PairController (e2e)', () => {
  let app: INestApplication;
  const countOfUsers = 3;
  const countOfQuestions = 10;
  const questions = [];
  const accessTokens = [];
  let game1Id;

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
  it('/sa/users (POST) add new user to the system', async () => {
    for (let i = 1; i <= countOfUsers; i++) {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: `user${i}`,
          password: `password${i}`,
          email: `email${i}@gmail.com`,
        });
    }
  });
  it('POST:[HOST]/auth/login: signIn users', async () => {
    for (let i = 1; i <= countOfUsers; i++) {
      const sigInUser = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: `user${i}`,
          password: `password${i}`,
        });
      accessTokens.push(sigInUser.body.accessToken);
    }
  });
  it('/sa/quiz/questions (POST) Add new 5 questions. Should return 201.', async () => {
    //create new question
    for (let i = 1; i < countOfQuestions; i++) {
      const res = await request(app.getHttpServer())
        .post('/sa/quiz/questions')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          body: `body question${i}`,
          correctAnswers: [`answ1_for_q${i}`, `answ2_for_q${i}`],
        })
        .expect(201);
      questions.push(res.body);
    }
  });
  it('/sa/quiz/questions/:id/publish (PUT) Publish all questions.', async () => {
    //publish new question
    for (const q of questions) {
      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${q.id}/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: true,
        })
        .expect(204);
    }
  });

  //Connect user1 - create new pair which will be waiting second player
  it('/pair-game-quiz/pairs/connection (POST=>200). User1 connected to new pair', async () => {
    const res = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessTokens[0], { type: 'bearer' })
      .expect(200);
    console.log(res.body);
    expect(res.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: 'user1',
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: [],
      status: 'PendingSecondPlayer',
      pairCreatedDate: expect.stringMatching(isoPattern),
      startGameDate: null,
      finishGameDate: null,
    });
  });
  //Connect user2 current user to existing random pending pair
  it('/pair-game-quiz/pairs/connection (POST=>200). User2 connected to pending pair', async () => {
    const res = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessTokens[1], { type: 'bearer' })
      .expect(200);
    console.log(res.body);
    expect(res.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: 'user1',
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: 'user2',
        },
        score: 0,
      },
      questions: expect.any(Array),
      status: 'Active',
      pairCreatedDate: expect.stringMatching(isoPattern),
      startGameDate: expect.stringMatching(isoPattern),
      finishGameDate: null,
    });
  });

  //Send answer for next not answered question in active pair
  it('/pair-game-quiz/pairs/my-current/answers (POST=>200). User1 send answer', async () => {
    const res = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(accessTokens[1], { type: 'bearer' })
      .send({
        answer: 'string',
      })
      .expect(200);
    expect(res.body).toEqual({
      questionId: expect.any(String),
      answerStatus: expect.any(String),
      addedAt: expect.any(String),
    });
  });

  //Returns current unfinished user game
  it('/pair-game-quiz/pairs/my-current (GET=>200). Should return 404', async () => {
    await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my-current')
      .auth(accessTokens[2], { type: 'bearer' })
      .expect(404);
  });
  it('/pair-game-quiz/pairs/my-current (GET=>200). Should return 401', async () => {
    await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my-current')
      .expect(401);
  });

  it('/pair-game-quiz/pairs/my-current (GET=>200). Should return game for user 1', async () => {
    const res = await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my-current')
      .auth(accessTokens[0], { type: 'bearer' })
      .expect(200);
    game1Id = res.body.id;
    expect(res.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: 'user1',
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: 'user2',
        },
        score: 0,
      },
      questions: expect.any(Array),
      status: 'Active',
      pairCreatedDate: expect.stringMatching(isoPattern),
      startGameDate: expect.stringMatching(isoPattern),
      finishGameDate: null,
    });
  });

  //Returns current unfinished user game
  it('/pair-game-quiz/pairs/{id} (GET). User 3 request pair. Should return 403', async () => {
    await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game1Id}`)
      .auth(accessTokens[2], { type: 'bearer' })
      .expect(403);
  });
  it('/pair-game-quiz/pairs/{id} (GET). Wrong pairId Should return 404', async () => {
    await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/wrong`)
      .auth(accessTokens[0], { type: 'bearer' })
      .expect(404);
  });
  it('/pair-game-quiz/pairs/{id} (GET=>200). Should return pair by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game1Id}`)
      .auth(accessTokens[0], { type: 'bearer' })
      .expect(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: 'user1',
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: 'user2',
        },
        score: 0,
      },
      questions: expect.any(Array),
      status: 'Active',
      pairCreatedDate: expect.stringMatching(isoPattern),
      startGameDate: expect.stringMatching(isoPattern),
      finishGameDate: null,
    });
  });
});
