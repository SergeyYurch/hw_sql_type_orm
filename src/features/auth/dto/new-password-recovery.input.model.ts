import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewPasswordRecoveryInputModel {
  @ApiProperty({
    minLength: 6,
    maxLength: 20,
  })
  @Length(6, 20)
  @IsString()
  newPassword: string;

  @ApiProperty()
  @IsString()
  recoveryCode: string;
}
