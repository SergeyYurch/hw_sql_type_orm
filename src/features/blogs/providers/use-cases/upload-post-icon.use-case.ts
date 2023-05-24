import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../../common/s3/s3.service';
import { AccountImageFile } from '../../../../common/types/account-image-file';
import sharp from 'sharp';

export class UploadPostIconCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public file: AccountImageFile,
  ) {}
}

@CommandHandler(UploadPostIconCommand)
export class UploadPostIconUseCase
  implements ICommandHandler<UploadPostIconCommand>
{
  constructor(private s3Service: S3Service) {}

  async execute(command: UploadPostIconCommand) {
    const originalBuffer: Buffer = command.file.buffer;
    const middleBuffer = await sharp(command.file.buffer)
      .resize({ width: 300, height: 180 })
      .toBuffer();
    const smallBuffer = await sharp(command.file.buffer)
      .resize({ width: 149, height: 96 })
      .toBuffer();
    const images = [
      {
        folder: 'post-icons',
        fileName: `post-icon-${command.postId}`,
        fileBuffer: originalBuffer,
      },
      {
        folder: 'post-icons',
        fileName: `post-icon-${command.postId}-mid`,
        fileBuffer: middleBuffer,
      },
      {
        folder: 'post-icons',
        fileName: `post-icon-${command.postId}-sm`,
        fileBuffer: smallBuffer,
      },
    ];
    await this.s3Service.uploadImages(images);
  }
}
