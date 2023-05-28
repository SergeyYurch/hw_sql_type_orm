import { BloggerImageEntity } from '../entities/blogger-image.entity';
import { BloggerImage } from '../domain/blogger-image';
import { AccountImageFile } from '../../../common/types/account-image-file';
import sharp from 'sharp';
import config from 'config';
import { ImageDataType } from '../types/image-data.type';
export class ImageService {
  mapBloggerImageToEntity(image: BloggerImage, entity: BloggerImageEntity) {
    if (image.id) entity.id = image.id;
    entity.url = image.url;
    entity.width = image.width;
    entity.height = image.height;
    entity.fileSize = image.fileSize;
    entity.mimetype = image.format;
  }

  castEntityToImageModel(imageEntity: BloggerImageEntity) {
    const imageModel = new BloggerImage();
    imageModel.id = imageEntity.id;
    imageModel.url = imageEntity.url;
    imageModel.width = imageEntity.width;
    imageModel.height = imageEntity.height;
    imageModel.fileSize = imageEntity.fileSize;
    imageModel.format = imageEntity.mimetype;
    imageModel.createdAt = imageEntity.createdAt;
    imageModel.updatedAt = imageEntity.updatedAt;
    return imageModel;
  }
  async getImageMetadata(
    file: AccountImageFile,
  ): Promise<Omit<ImageDataType, 'buffer'>> {
    const { width, height, format, size } = await sharp(file.buffer).metadata();
    return { width, height, format, size };
  }

  async changeImageSize(
    file: AccountImageFile,
    size: 'm' | 's',
  ): Promise<ImageDataType> {
    console.log(config.get('images.postIcon.middle.width'));
    const targetWidth =
      size === 'm'
        ? config.get('images.postIcon.middle.width')
        : config.get('images.postIcon.small.width');
    const targetHeight =
      size === 'm'
        ? config.get('images.postIcon.middle.height')
        : config.get('images.postIcon.small.height');
    const resized = sharp(file.buffer).resize({
      width: targetWidth,
      height: targetHeight,
    });
    const [metadata, buffer] = await Promise.all([
      resized.metadata(),
      resized.toBuffer(),
    ]);
    return {
      buffer,
      size: metadata.size,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
    };
  }
}
