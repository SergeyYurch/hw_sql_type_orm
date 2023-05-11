import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginInputModel {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  loginOrEmail: string; //*

  @ApiProperty()
  @IsString()
  password: string; //*
}
