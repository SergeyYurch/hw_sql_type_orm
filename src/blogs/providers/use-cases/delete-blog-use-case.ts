import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../blogs.sql.repository';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogRepository: BlogsSqlRepository) {}

  async execute(command: DeleteBlogCommand) {
    return await this.blogRepository.deleteBlog(command.blogId);
  }
}
