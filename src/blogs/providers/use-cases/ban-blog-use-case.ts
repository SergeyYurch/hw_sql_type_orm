import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanPostsCommand } from '../../../posts/providers/use-cases/ban-posts-use-case';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';

export class BanBlogCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(
    private readonly blogRepository: BlogsTypeOrmRepository,
    private readonly blogsQueryTypeOrmRepository: BlogsQueryTypeOrmRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: BanBlogCommand) {
    const { blogId, isBanned } = command;
    await this.commandBus.execute(new BanPostsCommand({ isBanned, blogId }));
    const bannedBlog = await this.blogsQueryTypeOrmRepository.getBlogModelById(
      blogId,
      { bannedBlogInclude: true },
    );
    bannedBlog.banBlog(isBanned);
    return !!(await this.blogRepository.save(bannedBlog));
  }
}
