import { BlogPostInputModel } from '../../../blogs/dto/input-models/blog-post.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQuerySqlRepository } from '../posts.query.sql.repository';
import { PostsSqlRepository } from '../posts.sql.repository';
export class EditPostCommand {
  constructor(public postId: string, public postChanges: BlogPostInputModel) {}
}

@CommandHandler(EditPostCommand)
export class EditPostUseCase implements ICommandHandler<EditPostCommand> {
  constructor(
    private postQueryRepository: PostsQuerySqlRepository,
    private postRepository: PostsSqlRepository,
  ) {}

  async execute(command: EditPostCommand): Promise<boolean> {
    const { postId, postChanges } = command;
    const postModel = await this.postQueryRepository.getPostModel(postId);
    postModel.updatePost(postChanges);
    const result = await this.postRepository.save(postModel);
    return !!result;
  }
}
