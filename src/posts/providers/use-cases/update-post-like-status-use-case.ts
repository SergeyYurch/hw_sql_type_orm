import { LikeStatusType } from '../../../common/dto/input-models/like.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';
import { PostsSqlRepository } from '../posts.sql.repository';
import { LikeDto } from '../../../common/dto/like.dto';
export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: LikeStatusType,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    private usersQueryRepository: UsersQuerySqlRepository,
    private postRepository: PostsSqlRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand) {
    const { postId, userId, likeStatus } = command;
    const postModel = await this.postRepository.getPostModelById(
      postId,
      userId,
    );
    const user = await this.usersQueryRepository.getUserModel(userId);
    if (!user) return null;
    const likeDto: LikeDto = {
      userId: user.id,
      login: user.accountData.login,
      likeStatus,
    };
    postModel.updateLikeStatus(likeDto);
    return !!(await this.postRepository.save(postModel));
  }
}
