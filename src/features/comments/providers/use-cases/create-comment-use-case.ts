import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { PostsQueryTypeOrmRepository } from '../../../posts/providers/posts.query.type-orm.repository';
import { CommentsTypeOrmRepository } from '../comments.type-orm.repository';
import { Post } from '../../../posts/domain/post';
import { Comment } from '../../domain/comment';

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
    protected commentsRepository: CommentsTypeOrmRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const { commentatorId, postId, content } = command;
    const commentator = await this.usersQueryRepository.getUserModelById(
      commentatorId,
    );
    const post: Post = await this.postsQueryRepository.getPostModelById(postId);
    const commentModel = new Comment(commentator, post, content);
    return await this.commentsRepository.save(commentModel);
  }
}
