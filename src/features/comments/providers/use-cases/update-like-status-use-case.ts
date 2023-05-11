import { LikeStatusType } from '../../../../common/dto/input-models/like.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsTypeOrmRepository } from '../comments.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { CommentsQueryTypeOrmRepository } from '../comments.query.type-orm.repository';

export class UpdateLikeStatusCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatusType,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase
  implements ICommandHandler<UpdateLikeStatusCommand>
{
  constructor(
    protected usersQueryRepository: UsersQueryTypeormRepository,
    protected commentsRepository: CommentsTypeOrmRepository,
    protected commentsQueryRepository: CommentsQueryTypeOrmRepository,
  ) {}

  async execute(command: UpdateLikeStatusCommand) {
    const { userId, likeStatus, commentId } = command;
    const commentModel = await this.commentsQueryRepository.getCommentModelById(
      commentId,
    );
    const user = await this.usersQueryRepository.getUserModelById(userId);
    commentModel.updateLikeStatus(likeStatus, user);
    await this.commentsRepository.save(commentModel);
  }
}
