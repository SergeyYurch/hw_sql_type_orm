import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationConfirmationCodeInputModel {
  @ApiProperty()
  @IsString()
  code: string;
}
