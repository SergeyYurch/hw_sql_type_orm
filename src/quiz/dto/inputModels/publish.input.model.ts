import { IsBoolean } from 'class-validator';

export class PublishInputModel {
  @IsBoolean()
  published: boolean;
}
