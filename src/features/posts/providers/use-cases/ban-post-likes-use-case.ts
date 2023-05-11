import { UsersQueryRepository } from '../../../users/providers/users.query.repository';
import { PostsRepository } from '../posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class BanPostLikesCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}

@CommandHandler(BanPostLikesCommand)
export class BanPostLikesUseCase
  implements ICommandHandler<BanPostLikesCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private postRepository: PostsRepository,
  ) {}

  async execute(command: BanPostLikesCommand) {
    const { userId, isBanned } = command;
    const posts = await this.postRepository.getPostsModelsByLikeUserId(userId);
    for (const postModel of posts) {
      postModel.likes = postModel.likes.map((l) =>
        l.userId === userId ? { ...l, userIsBanned: isBanned } : l,
      );
      const result = await this.postRepository.save(postModel);
      if (!result) return false;
    }
    return true;
  }
}
