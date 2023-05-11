import { IsString, Length } from 'class-validator';

export class CommentInputModel {
  @Length(20, 300)
  @IsString()
  content: string; //*,maxLength: 300, minLength: 20
}
