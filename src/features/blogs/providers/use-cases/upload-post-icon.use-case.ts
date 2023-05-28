import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../image/providers/s3/s3.service';
import { AccountImageFile } from '../../../../common/types/account-image-file';
import { PostsTypeOrmRepository } from '../../../posts/providers/posts.type-orm.repository';
import { PostsQueryTypeOrmRepository } from '../../../posts/providers/posts.query.type-orm.repository';
import { BloggerImage } from '../../../image/domain/blogger-image';
import { ImageService } from '../../../image/providers/image.service';
import { ImageDataType } from '../../../image/types/image-data.type';

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
    private imageService: ImageService,
    private readonly postRepository: PostsTypeOrmRepository,
    private readonly postsQueryTypeOrmRepository: PostsQueryTypeOrmRepository,
  ) {}

  async execute(command: UploadPostIconCommand) {
    const { file } = command;
    const uploadIcon = (buffer: Buffer, size: string): Promise<string> => {
      return this.s3Service.upload({
        targetFolder: 'post-icons',
        fileName: `post-icon-${command.postId}-${size}`,
        fileBuffer: buffer,
      });
    };
    const postModel = await this.postsQueryTypeOrmRepository.getPostModelById(
      command.postId,
    );

    const currentBuffer: Buffer = file.buffer;

    const [middleIcon, smallIcon] = await Promise.all([
      this.imageService.changeImageSize(file, 'm'),
      this.imageService.changeImageSize(file, 's'),
    ]);
    const currentIcon: ImageDataType = {
      buffer: currentBuffer,
      ...(await this.imageService.getImageMetadata(file)),
    };

    const [currentIconUrl, middleIconUrl, smallIconUrl] = await Promise.all([
      uploadIcon(currentBuffer, 'l'),
      uploadIcon(middleIcon.buffer, 'm'),
      uploadIcon(smallIcon.buffer, 's'),
    ]);
    postModel.icons = {
      main: postModel.icons?.main ?? new BloggerImage(),
      middle: postModel.icons?.middle ?? new BloggerImage(),
      small: postModel.icons?.small ?? new BloggerImage(),
    };
    postModel.icons.main.setImageParams(currentIconUrl, currentIcon);
    postModel.icons.middle.setImageParams(middleIconUrl, middleIcon);
    postModel.icons.small.setImageParams(smallIconUrl, smallIcon);

    await this.postRepository.save(postModel);
  }
}
