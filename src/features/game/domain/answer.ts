import { Question } from '../../quiz/domain/question';
import { AnswerStatusEntity } from '../types/answer-status.entity';

export class Answer {
  id: string;
  question: Question;
  answerStatus: AnswerStatusEntity;
  body: string;
  addedAt: Date;
  constructor(body: string) {
    this.body = body;
  }
}
