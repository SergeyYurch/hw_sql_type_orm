import { Question } from '../../quiz/domain/question';

export class Answer {
  id: string;
  question: Question;
  answerStatus: 'Correct' | 'Incorrect';
  body: string;
  addedAt: number;
  constructor(body: string) {
    this.body = body;
  }
}
