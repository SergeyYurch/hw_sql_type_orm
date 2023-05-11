import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsBlogExist } from '../../common/blog-id-validate';
import { Transform } from 'class-transformer';

export class PostInputModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 30)
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

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsBlogExist({ message: 'blog does not exist' })
  @IsNotEmpty()
  blogId: string; // *
}
