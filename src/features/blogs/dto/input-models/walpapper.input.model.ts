import { IsImage } from '../../../../common/custom-validate/is-image.validate';
import { Max } from 'class-validator';
import { ImageSizeEqual } from '../../../../common/custom-validate/image-size.validate.decorator';

export class Wallpaper {
  @IsImage({ message: 'Invalid file type' })
  mimetype: string;
  @Max(102400)
  size: number;
  @ImageSizeEqual('prop-111')
  buffer: Buffer;
}
