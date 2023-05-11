import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsTypeOrmRepository } from '../posts.type-orm.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postRepository: PostsTypeOrmRepository) {}

  async execute(command: DeletePostCommand): Promise<boolean> {
    const { postId } = command;

    return this.postRepository.delete(postId);
  }
}
