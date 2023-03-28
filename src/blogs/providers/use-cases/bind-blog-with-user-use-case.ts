import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../blogs.sql.repository';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    private blogRepository: BlogsSqlRepository,
    private userQueryRepository: UsersQuerySqlRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand) {
    const { userId, blogId } = command;
    const user = await this.userQueryRepository.getUserById(userId);
    const editBlog = await this.blogRepository.getBlogModel(blogId);
    editBlog.bindUser(userId, user.login);
    return !!(await this.blogRepository.save(editBlog));
  }
}
