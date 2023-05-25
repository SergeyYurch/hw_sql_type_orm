import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../../common/s3/s3.service';
import { AccountImageFile } from '../../../../common/types/account-image-file';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';

export class UploadBlogWallpaperCommand {
  constructor(public blogId: string, public file: AccountImageFile) {}
}

@CommandHandler(UploadBlogWallpaperCommand)
export class UploadBlogWallpaperUseCase
  implements ICommandHandler<UploadBlogWallpaperCommand>
{
  constructor(
    private s3Service: S3Service,
    private readonly blogRepository: BlogsTypeOrmRepository,
    private readonly blogsQueryTypeOrmRepository: BlogsQueryTypeOrmRepository,
  ) {}

  async execute(command: UploadBlogWallpaperCommand) {
    const blogModel = await this.blogsQueryTypeOrmRepository.getBlogModelById(
      command.blogId,
    );
    const fileName = `blog-wallpaper-${command.blogId}`;
    const targetFolder = 'blog-wallpapers';
    const wallpaperUrl = await this.s3Service.upload({
      targetFolder,
      fileName,
      fileBuffer: command.file.buffer,
    });
    if (wallpaperUrl) {
      blogModel.uploadWallpaper(wallpaperUrl);
      await this.blogRepository.save(blogModel);
    }
    return;
  }
}
