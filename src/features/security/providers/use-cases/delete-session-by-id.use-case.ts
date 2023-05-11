import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityService } from '../security.service';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';

export class DeleteSessionByIdCommand {
  constructor(public deviceId: string, public userId: string) {}
}
@CommandHandler(DeleteSessionByIdCommand)
export class DeleteSessionByIdUseCase
  implements ICommandHandler<DeleteSessionByIdCommand>
{
  constructor(
    private userRepository: UsersTypeOrmRepository,
    private usersQueryRepository: UsersQueryTypeormRepository,
    private securityService: SecurityService,
  ) {}

  async execute(command: DeleteSessionByIdCommand) {
    const { userId, deviceId } = command;
    await this.securityService.validateOwner(userId, deviceId);
    const user = await this.usersQueryRepository.getUserModelById(userId);
    user.deleteSession(deviceId);
    await this.userRepository.save(user);
    return user.getSessions();
  }
}
