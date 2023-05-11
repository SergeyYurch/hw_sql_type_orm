import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtPayloadType } from '../../../blogs/types/jwt-payload.type';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';

export class ValidateUserDeviceSessionCommand {
  constructor(public jwtPayload: JwtPayloadType) {}
}
@CommandHandler(ValidateUserDeviceSessionCommand)
export class ValidateUserDeviceSessionUseCase
  implements ICommandHandler<ValidateUserDeviceSessionCommand>
{
  constructor(private userRepository: UsersTypeOrmRepository) {}

  async execute(command: ValidateUserDeviceSessionCommand) {
    const { jwtPayload } = command;
    const user = await this.userRepository.getUserModel(jwtPayload.userId);
    return await user.validateDeviceSession(
      jwtPayload.deviceId,
      jwtPayload.iat * 1000,
    );
  }
}
