import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Multer } from 'multer';
import { S3Service } from '../../../../common/s3/s3.service';

export class UploadPostIconCommand {
  constructor(public postId: string, public file: Express.Multer.File) {}
}

@CommandHandler(UploadPostIconCommand)
export class UploadPostIconUseCase
  implements ICommandHandler<UploadPostIconCommand>
{
  constructor(private s3Service: S3Service) {}

  async execute(command: UploadPostIconCommand) {
    const fileName = `post-icon-${command.postId}-${Date.now()}`;
    await this.s3Service.upload('icons', fileName, command.file);
    return;
  }
}
