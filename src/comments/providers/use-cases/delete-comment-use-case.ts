import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsTypeOrmRepository } from '../comments.type-orm.repository';

export class DeleteCommentCommand {
  constructor(public commentId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(protected commentsRepository: CommentsTypeOrmRepository) {}

  async execute(command: DeleteCommentCommand) {
    return await this.commentsRepository.deleteComment(command.commentId);
  }
}
