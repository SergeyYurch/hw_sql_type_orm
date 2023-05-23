import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Multer } from 'multer';
import { S3Service } from '../../../../common/s3/s3.service';

export class UploadBlogIconCommand {
  constructor(public blogId: string, public file: Express.Multer.File) {}
}

@CommandHandler(UploadBlogIconCommand)
export class UploadBlogIconUseCase
  implements ICommandHandler<UploadBlogIconCommand>
{
  constructor(private s3Service: S3Service) {}

  async execute(command: UploadBlogIconCommand) {
    const fileName = `blog-icon-${command.blogId}-${Date.now()}`;
    await this.s3Service.upload('icons', fileName, command.file);
    return;
  }
}
