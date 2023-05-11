import { tokenService } from '../token.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';

export class RefreshTokenCommand {
  constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCases
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private authService: tokenService,
    private usersRepository: UsersTypeOrmRepository,
  ) {}

  async execute(command: RefreshTokenCommand) {
    try {
      const { userId, deviceId } = command;
      const { accessToken, refreshToken, expiresDate, lastActiveDate } =
        await this.authService.getTokens(userId, deviceId);
      const userModel = await this.usersRepository.getUserModel(userId);
      userModel.refreshTokens(deviceId, expiresDate, lastActiveDate);
      await this.usersRepository.save(userModel);
      return { accessToken, refreshToken, expiresDate };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
