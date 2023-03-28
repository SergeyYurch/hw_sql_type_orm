import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityService } from '../security.service';
import { UsersSqlRepository } from '../../../users/providers/users.sql.repository';

export class DeleteAllSessionExcludeCurrentCommand {
  constructor(public deviceId: string, public userId: string) {}
}
@CommandHandler(DeleteAllSessionExcludeCurrentCommand)
export class DeleteAllSessionExcludeCurrentUseCase
  implements ICommandHandler<DeleteAllSessionExcludeCurrentCommand>
{
  constructor(
    private userRepository: UsersSqlRepository,
    private securityService: SecurityService,
  ) {}

  async execute(command: DeleteAllSessionExcludeCurrentCommand) {
    const { userId, deviceId } = command;
    const user = await this.securityService.validateOwner(userId, deviceId);
    user.deleteSessionsExclude(deviceId);
    await this.userRepository.save(user);
    return user.getSessions();
  }
}
