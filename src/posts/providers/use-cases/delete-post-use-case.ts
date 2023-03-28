import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../posts.sql.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postRepository: PostsSqlRepository) {}

  async execute(command: DeletePostCommand): Promise<boolean> {
    const { postId } = command;

    return this.postRepository.delete(postId);
  }
}
