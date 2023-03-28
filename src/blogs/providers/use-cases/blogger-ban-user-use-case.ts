import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserForBlogDto } from '../../dto/ban-user-for-blog.dto';
import { BanBlogCommentByCommentatorIdCommand } from '../../../comments/providers/use-cases/ban-blog--comments-by-user-id--use-case';
import { BlogsSqlRepository } from '../blogs.sql.repository';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';

export class BloggerBanUserCommand {
  constructor(public banInfo: BanUserForBlogDto) {}
}

@CommandHandler(BloggerBanUserCommand)
export class BloggerBanUserUseCase
  implements ICommandHandler<BloggerBanUserCommand>
{
  constructor(
    private blogRepository: BlogsSqlRepository,
    private userQueryRepository: UsersQuerySqlRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: BloggerBanUserCommand) {
    const { userId, blogId, banReason, isBanned } = command.banInfo;
    const { login } = await this.userQueryRepository.getUserById(userId);
    await this.commandBus.execute(
      new BanBlogCommentByCommentatorIdCommand(userId, blogId, isBanned),
    );
    const editBlog = await this.blogRepository.getBlogModel(blogId);
    editBlog.banUser(userId, login, banReason, isBanned);
    return !!(await this.blogRepository.save(editBlog));
  }
}
