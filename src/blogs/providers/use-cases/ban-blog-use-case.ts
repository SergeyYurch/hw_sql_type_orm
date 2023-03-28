import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanPostsCommand } from '../../../posts/providers/use-cases/ban-posts-use-case';
import { BlogsSqlRepository } from '../blogs.sql.repository';

export class BanBlogCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(
    private readonly blogRepository: BlogsSqlRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: BanBlogCommand) {
    const { blogId, isBanned } = command;
    await this.commandBus.execute(new BanPostsCommand({ isBanned, blogId }));
    const bannedBlog = await this.blogRepository.getBlogModel(blogId);
    bannedBlog.banBlog(isBanned);
    return !!(await this.blogRepository.save(bannedBlog));
  }
}
