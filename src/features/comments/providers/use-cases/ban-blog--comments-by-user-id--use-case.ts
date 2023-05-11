import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';

export class BanBlogCommentByCommentatorIdCommand {
  constructor(
    public commentatorId: string,
    public blogId: string,
    public isBanned: boolean,
  ) {}
}

@CommandHandler(BanBlogCommentByCommentatorIdCommand)
export class BanBlogCommentByCommentatorIdUseCase
  implements ICommandHandler<BanBlogCommentByCommentatorIdCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(
    command: BanBlogCommentByCommentatorIdCommand,
  ): Promise<boolean> {
    const { commentatorId, isBanned, blogId } = command;
    const comments =
      await this.commentsRepository.getCommentsModelsForBlogByCommentatorId(
        commentatorId,
        blogId,
      );
    for (const commentModel of comments) {
      commentModel.banComment(isBanned);
      const result = await this.commentsRepository.save(commentModel);
      if (!result) return false;
    }
    return true;
  }
}
