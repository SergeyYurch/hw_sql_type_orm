import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Multer } from 'multer';
import { S3Service } from '../../../../common/s3/s3.service';

export class UploadBlogWallpaperCommand {
  constructor(public blogId: string, public file: Express.Multer.File) {}
}

@CommandHandler(UploadBlogWallpaperCommand)
export class UploadBlogWallpaperUseCase
  implements ICommandHandler<UploadBlogWallpaperCommand>
{
  constructor(private s3Service: S3Service) {}

  async execute(command: UploadBlogWallpaperCommand) {
    const fileName = `blog-wallpaper-${command.blogId}-${Date.now()}`;
    await this.s3Service.upload('wallpapers', fileName, command.file);
    return;
  }
}
