import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import sizeOf from 'image-size';
import { ImageFile } from '../types/image-file.type';

export class ImageSizeValidator extends FileValidator {
  constructor(options: { width: number; height: number }) {
    super(options);
  }
  isValid(file: ImageFile): boolean | Promise<boolean> {
    const dimensions = sizeOf(file.buffer);
    console.log(dimensions.width, dimensions.height);
    const result =
      dimensions.width === this.validationOptions.width &&
      dimensions.height === this.validationOptions.height;
    return result;
  }

  buildErrorMessage(): string {
    return 'Image size is wrong';
  }
}
