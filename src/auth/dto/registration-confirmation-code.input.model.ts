import { IsString } from 'class-validator';

export class RegistrationConfirmationCodeInputModel {
  @IsString()
  code: string;
}
