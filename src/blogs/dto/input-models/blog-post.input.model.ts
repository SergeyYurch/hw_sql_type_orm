import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class BlogPostInputModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 20)
  @IsNotEmpty()
  title: string; // *, maxLength: 30

  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 100)
  @IsNotEmpty()
  shortDescription: string; // * , maxLength: 100

  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 1000)
  @IsNotEmpty()
  content: string; // *,  maxLength: 1000
}
