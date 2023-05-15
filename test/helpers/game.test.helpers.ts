import { QuestionInputModel } from '../../src/features/quiz/dto/inputModels/question.input.model';
import request from 'supertest';
import { isoDatePattern } from '../test-utils';
import { INestApplication } from '@nestjs/common';
import { Question } from '../../src/features/quiz/domain/question';

export class GameTestHelpers {
  questions: Question[];
  constructor(private app: INestApplication) {}
  async createQuestion(questionInput: QuestionInputModel) {
    const { body: questions } = await request(this.app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(questionInput)
      .expect(201);
    expect(questions).toEqual({
      id: expect.any(String),
      body: questionInput.body,
      correctAnswers: expect.any(Array),
      published: false,
      createdAt: expect.stringMatching(isoDatePattern),
      updatedAt: null,
    });
    return questions;
  }

  async createQuestions(count: number) {
    const questions = [];
    for (let i = 1; i < count + 1; i++) {
      const inputQuestion: QuestionInputModel = {
        body: `body question${i}`,
        correctAnswers: [`answer1`, `answer2`],
      };
      const question = await this.createQuestion(inputQuestion);
      questions.push(question);
    }
    return questions;
  }

  async publishQuestion(id: string) {
    await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${id}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        published: true,
      })
      .expect(204);
  }

  async createAndPublishQuestions(count: number) {
    this.questions = await this.createQuestions(count);
    for (const question of this.questions) {
      await this.publishQuestion(question.id);
    }
    return this.questions;
  }
}
