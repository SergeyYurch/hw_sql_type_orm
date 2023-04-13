import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserForBlogDto } from '../../dto/ban-user-for-blog.dto';
import { BanBlogCommentByCommentatorIdCommand } from '../../../comments/providers/use-cases/ban-blog--comments-by-user-id--use-case';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';

export class BloggerBanUserCommand {
  constructor(public banInfo: BanUserForBlogDto) {}
}

@CommandHandler(BloggerBanUserCommand)
export class BloggerBanUserUseCase
  implements ICommandHandler<BloggerBanUserCommand>
{
  constructor(
    private blogRepository: BlogsTypeOrmRepository,
    private userQueryRepository: UsersQueryTypeormRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: BloggerBanUserCommand) {
    const { userId, blogId, banReason, isBanned } = command.banInfo;
    const { login } = await this.userQueryRepository.getUserViewById(userId);
    await this.commandBus.execute(
      new BanBlogCommentByCommentatorIdCommand(userId, blogId, isBanned),
    );
    const editBlog = await this.blogRepository.getBlogModel(blogId);
    editBlog.banUser(userId, login, banReason, isBanned);
    return !!(await this.blogRepository.save(editBlog));
  }
}
