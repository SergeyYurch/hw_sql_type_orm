import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';

export class GetSessionsByUserIdCommand {
  constructor(public userId: string) {}
}
@CommandHandler(GetSessionsByUserIdCommand)
export class GetSessionsByUserIdUseCase
  implements ICommandHandler<GetSessionsByUserIdCommand>
{
  constructor(private userRepository: UsersQuerySqlRepository) {}

  async execute(command: GetSessionsByUserIdCommand) {
    const user = await this.userRepository.findById(command.userId);
    return user.getSessions();
  }
}
