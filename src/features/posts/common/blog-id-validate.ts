import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsQueryTypeOrmRepository } from '../../blogs/providers/blogs.query.type-orm.repository';

@ValidatorConstraint({ name: 'blogId', async: true })
@Injectable()
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(
    protected readonly blogsQueryRepository: BlogsQueryTypeOrmRepository,
  ) {}
  async validate(blogId: string) {
    return await this.blogsQueryRepository.doesBlogIdExist(blogId);
  }
}

export function IsBlogExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsBlogExistConstraint,
    });
  };
}
