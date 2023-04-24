import { IsString } from 'class-validator';

export class AnswerInputModel {
  @IsString()
  answer: string;
}
