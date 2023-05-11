import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationEmailResendingInputModel {
  @ApiProperty()
  @IsEmail()
  email: string;
}
