import { BlogPostInputModel } from '../../../blogs/dto/input-models/blog-post.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryTypeOrmRepository } from '../posts.query.type-orm.repository';
import { PostsTypeOrmRepository } from '../posts.type-orm.repository';
export class EditPostCommand {
  constructor(public postId: string, public postChanges: BlogPostInputModel) {}
}

@CommandHandler(EditPostCommand)
export class EditPostUseCase implements ICommandHandler<EditPostCommand> {
  constructor(
    private postQueryRepository: PostsQueryTypeOrmRepository,
    private postRepository: PostsTypeOrmRepository,
  ) {}

  async execute(command: EditPostCommand): Promise<boolean> {
    const { postId, postChanges } = command;
    const postModel = await this.postQueryRepository.getPostModelById(postId);
    postModel.updatePost(postChanges);
    const result = await this.postRepository.save(postModel);
    return !!result;
  }
}
