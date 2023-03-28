import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQuerySqlRepository } from '../../../posts/providers/posts.query.sql.repository';
import { CreatedCommentDto } from '../../dto/created-comment.dto';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';
import { CommentsSqlRepository } from '../comments.sql.repository';

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
    protected usersQueryRepository: UsersQuerySqlRepository,
    protected postsQueryRepository: PostsQuerySqlRepository,
    protected commentsRepository: CommentsSqlRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const { commentatorId, postId, content } = command;
    const commentator = await this.usersQueryRepository.getUserById(
      commentatorId,
    );
    const post = await this.postsQueryRepository.getPostById(postId);
    const blogOwnerId = await this.postsQueryRepository.getPostsBloggerId(
      postId,
    );
    const createdComment: CreatedCommentDto = {
      content,
      commentatorId,
      commentatorLogin: commentator.login,
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
