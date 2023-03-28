import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsSqlRepository } from '../comments.sql.repository';

export class DeleteCommentCommand {
  constructor(public commentId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(protected commentsRepository: CommentsSqlRepository) {}

  async execute(command: DeleteCommentCommand) {
    return await this.commentsRepository.deleteComment(command.commentId);
  }
}
