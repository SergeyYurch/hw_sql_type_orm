import { tokenService } from '../token.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../users/providers/users.sql.repository';

export class RefreshTokenCommand {
  constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCases
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private authService: tokenService,
    private usersRepository: UsersSqlRepository,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { userId, deviceId } = command;
    const { accessToken, refreshToken, expiresDate, lastActiveDate } =
      await this.authService.getTokens(userId, deviceId);
    const userModel = await this.usersRepository.getUserModel(userId);
    userModel.refreshTokens(deviceId, expiresDate, lastActiveDate);
    await this.usersRepository.save(userModel);
    return { accessToken, refreshToken, expiresDate };
  }
}
