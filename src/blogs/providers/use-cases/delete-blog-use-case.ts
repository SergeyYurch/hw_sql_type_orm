import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsTypeOrmRepository } from '../blogs.type-orm.repository';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogRepository: BlogsTypeOrmRepository) {}

  async execute(command: DeleteBlogCommand) {
    return await this.blogRepository.deleteBlog(command.blogId);
  }
}
