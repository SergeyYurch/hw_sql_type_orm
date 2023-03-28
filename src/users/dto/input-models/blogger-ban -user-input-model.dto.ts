import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsBlogExist } from '../../../posts/common/blog-id-validate';

export class BloggerBanUserInputModel {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(20)
  banReason: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsBlogExist({ message: 'blog does not exist' })
  @IsNotEmpty()
  blogId: string;
}
