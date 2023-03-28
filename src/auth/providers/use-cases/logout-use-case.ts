import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/providers/users.repository';
import { UsersSqlRepository } from '../../../users/providers/users.sql.repository';

export class LogoutCommand {
  constructor(public userId: string, public deviceId: string) {}
}
@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private userRepository: UsersSqlRepository) {}

  async execute(command: LogoutCommand) {
    const { userId, deviceId } = command;
    const user = await this.userRepository.getUserModel(userId);
    user.logout(deviceId);
    return !!(await this.userRepository.save(user));
  }
}
