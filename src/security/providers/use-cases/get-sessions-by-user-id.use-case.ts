import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';

export class GetSessionsByUserIdCommand {
  constructor(public userId: string) {}
}
@CommandHandler(GetSessionsByUserIdCommand)
export class GetSessionsByUserIdUseCase
  implements ICommandHandler<GetSessionsByUserIdCommand>
{
  constructor(private userRepository: UsersQueryTypeormRepository) {}

  async execute(command: GetSessionsByUserIdCommand) {
    const user = await this.userRepository.findById(command.userId);
    return user.getSessions();
  }
}
