import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatedCommentDto } from '../../dto/created-comment.dto';
import { CommentsSqlRepository } from '../comments.sql.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { PostsQueryTypeOrmRepository } from '../../../posts/providers/posts.query.type-orm.repository';

export class CreateCommentCommand {
  constructor(
    public content: string,
    public commentatorId: string,
    public postId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    protected usersQueryRepository: UsersQueryTypeormRepository,
    protected postsQueryRepository: PostsQueryTypeOrmRepository,
    protected commentsRepository: CommentsSqlRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const { commentatorId, postId, content } = command;
    const commentator = await this.usersQueryRepository.getUserModelById(
      commentatorId,
    );
    const post = await this.postsQueryRepository.getPostViewModelById(postId);
    const blogOwnerId = await this.postsQueryRepository.getPostsBloggerId(
      postId,
    );
    const createdComment: CreatedCommentDto = {
      content,
      commentatorId,
      commentatorLogin: commentator.accountData.login,
      blogId: post.blogId,
      blogName: post.blogName,
      blogOwnerId,
      postId,
      postTitle: post.title,
    };
    const commentModel = await this.commentsRepository.createCommentModel();
    commentModel.initial(createdComment);
    return await this.commentsRepository.save(commentModel);
  }
}
