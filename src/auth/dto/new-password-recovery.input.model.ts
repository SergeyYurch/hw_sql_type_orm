import { IsString, Length } from 'class-validator';

export class NewPasswordRecoveryInputModel {
  @Length(6, 20)
  @IsString()
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
