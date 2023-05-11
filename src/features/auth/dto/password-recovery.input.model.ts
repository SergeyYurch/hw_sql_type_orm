import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordRecoveryInputModel {
  @ApiProperty()
  @IsEmail()
  email: string;
}
