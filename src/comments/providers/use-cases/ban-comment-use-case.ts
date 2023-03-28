import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';

export class BanCommentCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}

@CommandHandler(BanCommentCommand)
export class BanCommentUseCase implements ICommandHandler<BanCommentCommand> {
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: BanCommentCommand): Promise<boolean> {
    const { userId, isBanned } = command;
    const comments = await this.commentsRepository.getCommentsModelsByUserId(
      userId,
    );
    for (const commentModel of comments) {
      commentModel.banComment(isBanned);
      const result = await this.commentsRepository.save(commentModel);
      if (!result) return false;
    }
    return true;
  }
}
