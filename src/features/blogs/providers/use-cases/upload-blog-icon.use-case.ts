import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../../common/s3/s3.service';
import { AccountImageFile } from '../../../../common/types/account-image-file';

export class UploadBlogIconCommand {
  constructor(public blogId: string, public file: AccountImageFile) {}
}

@CommandHandler(UploadBlogIconCommand)
export class UploadBlogIconUseCase
  implements ICommandHandler<UploadBlogIconCommand>
{
  constructor(private s3Service: S3Service) {}

  async execute(command: UploadBlogIconCommand) {
    const fileName = `blog-icon-${command.blogId}`;
    await this.s3Service.upload('blog-icons', fileName, command.file.buffer);
    return;
  }
}
