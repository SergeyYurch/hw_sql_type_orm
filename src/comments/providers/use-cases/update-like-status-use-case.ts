import { LikeStatusType } from '../../../common/dto/input-models/like.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';
import { CommentsSqlRepository } from '../comments.sql.repository';
import { LikeDto } from '../../../likes/dto/like.dto';

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
    protected usersQueryRepository: UsersQuerySqlRepository,
    protected commentsRepository: CommentsSqlRepository,
  ) {}

  async execute(command: UpdateLikeStatusCommand) {
    const { userId, likeStatus, commentId } = command;
    const commentModel = await this.commentsRepository.getCommentModelById(
      commentId,
    );
    const user = await this.usersQueryRepository.getUserById(userId);
    const like: LikeDto = {
      likeStatus,
      userId,
      login: user.login,
    };
    commentModel.updateLikeStatus(like);
    await this.commentsRepository.save(commentModel);
  }
}
