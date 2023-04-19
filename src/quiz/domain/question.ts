import { CreateQuestionDto } from '../dto/create-question.dto';

export class Question {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: number;
  updatedAt: number;
  constructor(createData: CreateQuestionDto) {
    this.body = createData.body;
    this.correctAnswers = createData.correctAnswers;
    this.published = false;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }
  publishedQuestion(published: boolean) {
    this.published = published;
    this.updatedAt = Date.now();
  }
}
