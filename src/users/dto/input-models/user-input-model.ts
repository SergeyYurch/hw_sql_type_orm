import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsUniqLoginOrEmail } from '../../../common/validators/login-or-emai-uniq-validate';

export class UserInputModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @IsUniqLoginOrEmail({ message: 'Login is already taken' })
  login: string;

  @IsString()
  @Length(6, 20)
  password: string;

  @IsEmail()
  @Transform(({ value }) => value.trim())
  @IsUniqLoginOrEmail({ message: 'Email is already taken' })
  email: string;
}
