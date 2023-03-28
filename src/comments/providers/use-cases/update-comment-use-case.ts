import { CommentInputModel } from '../../dto/comment-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsSqlRepository } from '../comments.sql.repository';

export class UpdateCommentCommand {
  constructor(public commentId: string, public commentDto: CommentInputModel) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(protected commentsRepository: CommentsSqlRepository) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, commentDto } = command;
    const commentModel = await this.commentsRepository.getCommentModelById(
      commentId,
    );

    commentModel.updateContent(commentDto.content);
    return !!(await this.commentsRepository.save(commentModel));
  }
}
