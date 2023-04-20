import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';

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
  }
  publish(published: boolean) {
    this.published = published;
    this.updatedAt = Date.now();
  }

  update(data: UpdateQuestionDto) {
    this.body = data.body;
    this.correctAnswers = data.correctAnswers;
    this.updatedAt = Date.now();
  }
}
