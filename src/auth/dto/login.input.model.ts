import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginInputModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  loginOrEmail: string; //*

  @IsString()
  password: string; //*
}
