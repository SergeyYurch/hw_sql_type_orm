import { IsEmail } from 'class-validator';

export class RegistrationEmailResendingInputModel {
  @IsEmail()
  email: string;
}
