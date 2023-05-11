import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';

export class DeleteAllSessionExcludeCurrentCommand {
  constructor(public deviceId: string, public userId: string) {}
}
@CommandHandler(DeleteAllSessionExcludeCurrentCommand)
export class DeleteAllSessionExcludeCurrentUseCase
  implements ICommandHandler<DeleteAllSessionExcludeCurrentCommand>
{
  constructor(
    private usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private usersRepository: UsersTypeOrmRepository,
  ) {}

  async execute(command: DeleteAllSessionExcludeCurrentCommand) {
    const { userId, deviceId } = command;
    const user = await this.usersQueryTypeormRepository.getUserModelById(
      userId,
    );
    user.deleteSessionsExclude(deviceId);
    await this.usersRepository.save(user);
    return user.getSessions();
  }
}
