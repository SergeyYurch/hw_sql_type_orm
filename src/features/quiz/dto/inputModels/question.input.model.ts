import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class QuestionInputModel {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  body: string;
  @IsArray()
  correctAnswers: string[];
}
