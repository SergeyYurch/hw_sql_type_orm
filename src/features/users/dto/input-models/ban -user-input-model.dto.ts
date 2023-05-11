import { IsBoolean, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class BanUserInputModel {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(20)
  banReason: string;
}
