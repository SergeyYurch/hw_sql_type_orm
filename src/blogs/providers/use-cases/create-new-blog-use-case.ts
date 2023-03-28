import { BlogInputModel } from '../../dto/input-models/blog.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogCreatedDto } from '../../dto/blog-created.dto';
import { BlogsQuerySqlRepository } from '../blogs.query.sql.repository';
import { BlogsSqlRepository } from '../blogs.sql.repository';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';

export class CreateNewBlogCommand {
  constructor(public inputBlogDto: BlogInputModel, public userId?: string) {}
}

@CommandHandler(CreateNewBlogCommand)
export class CreateNewBlogUseCase
  implements ICommandHandler<CreateNewBlogCommand>
{
  constructor(
    private blogRepository: BlogsSqlRepository,
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private usersQueryRepository: UsersQuerySqlRepository,
  ) {}

  async execute(command: CreateNewBlogCommand) {
    const { inputBlogDto, userId } = command;
    let login: string;
    if (userId)
      login = (await this.usersQueryRepository.getUserById(userId))?.login;
    const createdBlog = await this.blogRepository.createBlogModel();
    const createdBlogData: BlogCreatedDto = {
      name: inputBlogDto.name,
      description: inputBlogDto.description,
      websiteUrl: inputBlogDto.websiteUrl,
      blogOwnerId: userId || null,
      blogOwnerLogin: login || null,
    };
    createdBlog.initial(createdBlogData);
    return await this.blogRepository.save(createdBlog);
  }
}
