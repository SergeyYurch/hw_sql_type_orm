import { LikeStatusType } from '../../../common/dto/input-models/like.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeDto } from '../../../common/dto/like.dto';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { PostsTypeOrmRepository } from '../posts.type-orm.repository';
import { PostsQueryTypeOrmRepository } from '../posts.query.type-orm.repository';
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
    private usersQueryRepository: UsersQueryTypeormRepository,
    private postRepository: PostsTypeOrmRepository,
    private postsQueryTypeOrmRepository: PostsQueryTypeOrmRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand) {
    const { postId, userId, likeStatus } = command;
    const postModel = await this.postsQueryTypeOrmRepository.getPostModelById(
      postId,
      userId,
    );
    const user = await this.usersQueryRepository.getUserModelById(userId);
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
