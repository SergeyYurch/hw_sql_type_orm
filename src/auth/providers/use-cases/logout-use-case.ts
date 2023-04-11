import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';

export class LogoutCommand {
  constructor(public userId: string, public deviceId: string) {}
}
@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private userRepository: UsersTypeOrmRepository) {}

  async execute(command: LogoutCommand) {
    try {
      const { userId, deviceId } = command;
      const user = await this.userRepository.getUserModel(userId);
      user.logout(deviceId);
      await this.userRepository.save(user);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
