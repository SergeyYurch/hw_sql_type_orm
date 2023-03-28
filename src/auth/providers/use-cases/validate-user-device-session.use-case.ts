import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../users/providers/users.sql.repository';
import { JwtPayloadType } from '../../../blogs/types/jwt-payload.type';

export class ValidateUserDeviceSessionCommand {
  constructor(public jwtPayload: JwtPayloadType) {}
}
@CommandHandler(ValidateUserDeviceSessionCommand)
export class ValidateUserDeviceSessionUseCase
  implements ICommandHandler<ValidateUserDeviceSessionCommand>
{
  constructor(private userRepository: UsersSqlRepository) {}

  async execute(command: ValidateUserDeviceSessionCommand) {
    const { jwtPayload } = command;
    const user = await this.userRepository.getUserModel(jwtPayload.userId);
    return await user.validateDeviceSession(
      jwtPayload.deviceId,
      jwtPayload.iat * 1000,
    );
  }
}
