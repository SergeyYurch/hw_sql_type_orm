import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityService } from '../security.service';
import { UsersSqlRepository } from '../../../users/providers/users.sql.repository';

export class DeleteSessionByIdCommand {
  constructor(public deviceId: string, public userId: string) {}
}
@CommandHandler(DeleteSessionByIdCommand)
export class DeleteSessionByIdUseCase
  implements ICommandHandler<DeleteSessionByIdCommand>
{
  constructor(
    private userRepository: UsersSqlRepository,
    private securityService: SecurityService,
  ) {}

  async execute(command: DeleteSessionByIdCommand) {
    const { userId, deviceId } = command;
    const user = await this.securityService.validateOwner(userId, deviceId);
    user.deleteSession(deviceId);
    await this.userRepository.save(user);
    return user.getSessions();
  }
}
