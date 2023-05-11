import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class BlogInputModel {
  @IsString()
  @Length(1, 15)
  @Transform(({ value }) => value.trim())
  name: string; //*, maxLength: 15

  @IsString()
  @Length(1, 500)
  @Transform(({ value }) => value.trim())
  description: string; //*, maxLength: 500

  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 100)
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
  websiteUrl: string; //  *,  maxLength: 100, pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
}
