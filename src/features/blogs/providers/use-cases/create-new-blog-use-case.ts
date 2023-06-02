import { BlogInputModel } from '../../dto/input-models/blog.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogCreatedDto } from '../../dto/blog-created.dto';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { Blog } from '../../domain/blog';

export class CreateNewBlogCommand {
  constructor(public inputBlogDto: BlogInputModel, public userId?: string) {}
}

@CommandHandler(CreateNewBlogCommand)
export class CreateNewBlogUseCase
  implements ICommandHandler<CreateNewBlogCommand>
{
  constructor(
    private blogRepository: BlogsTypeOrmRepository,
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
    private usersQueryRepository: UsersQueryTypeormRepository,
  ) {}

  async execute(command: CreateNewBlogCommand) {
    const { inputBlogDto, userId } = command;
    let login: string;
    if (userId)
      login = (await this.usersQueryRepository.getUserViewById(userId))?.login;
    const blogModel = new Blog();
    const createdBlogData: BlogCreatedDto = {
      name: inputBlogDto.name,
      description: inputBlogDto.description,
      websiteUrl: inputBlogDto.websiteUrl,
      blogOwnerId: userId || null,
      blogOwnerLogin: login || null,
    };
    blogModel.initial(createdBlogData);
    return await this.blogRepository.save(blogModel);
  }
}
