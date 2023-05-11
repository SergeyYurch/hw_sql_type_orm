import { Question } from '../../quiz/domain/question';

export class Answer {
  id: string;
  question: Question;
  answerStatus: 'Correct' | 'Incorrect';
  body: string;
  addedAt: Date;
  constructor(body: string) {
    this.body = body;
  }
}
