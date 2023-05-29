import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../image/providers/s3/s3.service';
import { AccountImageFile } from '../../../../common/types/account-image-file';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';
import { BloggerImage } from '../../../image/domain/blogger-image';
import { ImageMetadataType } from '../../../image/types/image-metadata.type';
import { ImageService } from '../../../image/providers/image.service';

export class UploadBlogWallpaperCommand {
  constructor(public blogId: string, public file: AccountImageFile) {}
}

@CommandHandler(UploadBlogWallpaperCommand)
export class UploadBlogWallpaperUseCase
  implements ICommandHandler<UploadBlogWallpaperCommand>
{
  constructor(
    private s3Service: S3Service,
    private imageService: ImageService,
    private readonly blogRepository: BlogsTypeOrmRepository,
    private readonly blogsQueryTypeOrmRepository: BlogsQueryTypeOrmRepository,
  ) {}

  async execute(command: UploadBlogWallpaperCommand) {
    const { file } = command;
    const blogModel = await this.blogsQueryTypeOrmRepository.getBlogModelById(
      command.blogId,
    );
    const metadata = await this.imageService.getImageMetadata(file);
    const fileName = `blog-wallpaper-${command.blogId}.${metadata.format}`;
    const targetFolder = 'blog-wallpapers';
    const wallpaperUrl = await this.s3Service.upload({
      targetFolder,
      fileName,
      fileBuffer: file.buffer,
    });
    if (wallpaperUrl) {
      const wallpaper = new BloggerImage();
      const data: ImageMetadataType = await this.imageService.getImageMetadata(
        file,
      );
      wallpaper.setImageParams(wallpaperUrl, data);
      blogModel.wallpaper = wallpaper;
      await this.blogRepository.save(blogModel);
    }
    return;
  }
}
