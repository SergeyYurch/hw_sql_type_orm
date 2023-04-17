import { CommentInputModel } from '../../dto/comment-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsTypeOrmRepository } from '../comments.type-orm.repository';
import { CommentsQueryTypeOrmRepository } from '../comments.query.type-orm.repository';

export class UpdateCommentCommand {
  constructor(public commentId: string, public commentDto: CommentInputModel) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    protected commentsRepository: CommentsTypeOrmRepository,
    protected commentsQueryTypeOrmRepository: CommentsQueryTypeOrmRepository,
  ) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, commentDto } = command;
    const commentModel =
      await this.commentsQueryTypeOrmRepository.getCommentModelById(commentId);

    commentModel.updateContent(commentDto.content);
    return !!(await this.commentsRepository.save(commentModel));
  }
}
