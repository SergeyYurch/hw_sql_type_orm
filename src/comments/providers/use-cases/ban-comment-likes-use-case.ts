import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';

export class BanCommentLikesCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}

@CommandHandler(BanCommentLikesCommand)
export class BanCommentLikesUseCase
  implements ICommandHandler<BanCommentLikesCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: BanCommentLikesCommand) {
    const { userId, isBanned } = command;
    const comments =
      await this.commentsRepository.getCommentsModelsByLikeUserId(userId);
    for (const commentModel of comments) {
      commentModel.likes = commentModel.likes.map((l) =>
        l.userId === userId ? { ...l, userIsBanned: isBanned } : l,
      );
      const result = await this.commentsRepository.save(commentModel);
      if (!result) return false;
    }
    return true;
  }
}
