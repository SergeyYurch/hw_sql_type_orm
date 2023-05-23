import { ImageValidateOptionsType } from '../types/image-validate-option.type';
import {
  HttpException,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { ImageSizeValidator } from './image-size.validator';

export const imageFileValidate = (options: ImageValidateOptionsType) => {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: /(jpg|jpeg|png)/,
    })
    .addMaxSizeValidator({
      maxSize: options.maxFileSizeKB * 1024,
    })
    .addValidator(
      new ImageSizeValidator({
        width: options.width,
        height: options.height,
      }),
    )
    .build({
      exceptionFactory(error) {
        throw new HttpException(
          { message: { message: error, field: 'file' } },
          HttpStatus.BAD_REQUEST,
        );
      },
    });
};
