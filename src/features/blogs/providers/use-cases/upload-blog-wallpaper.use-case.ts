import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../../common/s3/s3.service';
import { AccountImageFile } from '../../../../common/types/account-image-file';

export class UploadBlogWallpaperCommand {
  constructor(public blogId: string, public file: AccountImageFile) {}
}

@CommandHandler(UploadBlogWallpaperCommand)
export class UploadBlogWallpaperUseCase
  implements ICommandHandler<UploadBlogWallpaperCommand>
{
  constructor(private s3Service: S3Service) {}

  async execute(command: UploadBlogWallpaperCommand) {
    const fileName = `blog-wallpaper-${command.blogId}`;
    const uploadRes = await this.s3Service.upload(
      'blog-wallpapers',
      fileName,
      command.file.buffer,
    );

    return;
  }
}
