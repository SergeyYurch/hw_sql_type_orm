import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'loginOrEmail', async: true })
@Injectable()
export class IsImageConstraint implements ValidatorConstraintInterface {
  async validate(mimetype: string) {
    const acceptMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const fileType = acceptMimeTypes.find((type) => type === mimetype);
    return !fileType;
  }
}

export function IsImage(options?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: options,
      validator: IsImageConstraint,
    });
  };
}
