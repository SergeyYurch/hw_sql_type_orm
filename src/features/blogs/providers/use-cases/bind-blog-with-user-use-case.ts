import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    private blogRepository: BlogsTypeOrmRepository,
    private blogsQueryTypeOrmRepository: BlogsQueryTypeOrmRepository,
    private userQueryRepository: UsersQueryTypeormRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand) {
    const { userId, blogId } = command;
    const user = await this.userQueryRepository.getUserModelById(userId);
    const editBlog =
      await this.blogsQueryTypeOrmRepository.getBlogDomainModelById(blogId);
    editBlog.bindUser(userId, user.accountData.login);
    return !!(await this.blogRepository.save(editBlog));
  }
}
