import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../image/providers/s3/s3.service';
import { AccountImageFile } from '../../../../common/types/account-image-file';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';
import { BloggerImage } from '../../../image/domain/blogger-image';
import { ImageMetadataType } from '../../../image/types/image-metadata.type';
import { ImageService } from '../../../image/providers/image.service';

export class UploadBlogIconCommand {
  constructor(public blogId: string, public file: AccountImageFile) {}
}

@CommandHandler(UploadBlogIconCommand)
export class UploadBlogIconUseCase
  implements ICommandHandler<UploadBlogIconCommand>
{
  constructor(
    private s3Service: S3Service,
    private imageService: ImageService,
    private readonly blogRepository: BlogsTypeOrmRepository,
    private readonly blogsQueryTypeOrmRepository: BlogsQueryTypeOrmRepository,
  ) {}

  async execute(command: UploadBlogIconCommand) {
    const { file } = command;
    const blogModel = await this.blogsQueryTypeOrmRepository.getBlogModelById(
      command.blogId,
    );
    const fileBuffer = file.buffer;
    const metadata = await this.imageService.getImageMetadata(file);
    const targetFolder = 'blog-icons';
    const fileName = `blog-icon-${command.blogId}.${metadata.format}`;
    const iconUrl = await this.s3Service.upload({
      targetFolder,
      fileName,
      fileBuffer,
    });
    if (iconUrl) {
      const icon = new BloggerImage();
      const data: ImageMetadataType = await this.imageService.getImageMetadata(
        file,
      );
      icon.setImageParams(iconUrl, data);
      blogModel.icon = icon;
    }
    await this.blogRepository.save(blogModel);
  }
}
