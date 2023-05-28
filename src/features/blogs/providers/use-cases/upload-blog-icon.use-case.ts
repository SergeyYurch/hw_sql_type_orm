import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../image/providers/s3/s3.service';
import { AccountImageFile } from '../../../../common/types/account-image-file';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';

export class UploadBlogIconCommand {
  constructor(public blogId: string, public file: AccountImageFile) {}
}

@CommandHandler(UploadBlogIconCommand)
export class UploadBlogIconUseCase
  implements ICommandHandler<UploadBlogIconCommand>
{
  constructor(
    private s3Service: S3Service,
    private readonly blogRepository: BlogsTypeOrmRepository,
    private readonly blogsQueryTypeOrmRepository: BlogsQueryTypeOrmRepository,
  ) {}

  async execute(command: UploadBlogIconCommand) {
    const blogModel = await this.blogsQueryTypeOrmRepository.getBlogModelById(
      command.blogId,
    );
    const fileBuffer = command.file.buffer;
    const targetFolder = 'blog-icons';
    const fileName = `blog-icon-${command.blogId}`;
    const iconUrl = await this.s3Service.upload({
      targetFolder,
      fileName,
      fileBuffer,
    });
    // blogModel.uploadIcon(iconUrl);
    await this.blogRepository.save(blogModel);
  }
}
