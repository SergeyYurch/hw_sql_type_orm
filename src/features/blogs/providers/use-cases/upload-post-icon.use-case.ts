import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../../common/s3/s3.service';
import { AccountImageFile } from '../../../../common/types/account-image-file';
import sharp from 'sharp';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';
import { PostsTypeOrmRepository } from '../../../posts/providers/posts.type-orm.repository';
import { PostsQueryTypeOrmRepository } from '../../../posts/providers/posts.query.type-orm.repository';

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
  constructor(
    private s3Service: S3Service,
    private readonly postRepository: PostsTypeOrmRepository,
    private readonly postsQueryTypeOrmRepository: PostsQueryTypeOrmRepository,
  ) {}

  async execute(command: UploadPostIconCommand) {
    const postModel = await this.postsQueryTypeOrmRepository.getPostModelById(
      command.postId,
    );
    const targetFolder = 'post-icons';
    const originalBuffer: Buffer = command.file.buffer;
    const middleBuffer = await sharp(command.file.buffer)
      .resize({ width: 300, height: 180 })
      .toBuffer();
    const smallBuffer = await sharp(command.file.buffer)
      .resize({ width: 149, height: 96 })
      .toBuffer();
    const images = [
      {
        targetFolder,
        fileName: `post-icon-${command.postId}`,
        fileBuffer: originalBuffer,
      },
      {
        targetFolder,
        fileName: `post-icon-${command.postId}-mid`,
        fileBuffer: middleBuffer,
      },
      {
        targetFolder,
        fileName: `post-icon-${command.postId}-sm`,
        fileBuffer: smallBuffer,
      },
    ];
    const iconUrls = await this.s3Service.uploadImages(images);
    postModel.uploadIcon(iconUrls);
    await this.postRepository.save(postModel);
  }
}
