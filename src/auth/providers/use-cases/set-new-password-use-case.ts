import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { PASSWORD_RECOVERY_CODE_MESSAGE } from '../../constants/auth.constant';
import { UsersService } from '../../../users/providers/users.service';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';

export class SetNewPasswordCommand {
  constructor(public recoveryCode: string, public newPassword: string) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase
  implements ICommandHandler<SetNewPasswordCommand>
{
  constructor(
    private userRepository: UsersTypeOrmRepository,
    private userQueryRepository: UsersQueryTypeormRepository,
    private usersService: UsersService,
  ) {}

  async execute(command: SetNewPasswordCommand) {
    const { recoveryCode, newPassword } = command;
    const userModel =
      await this.userQueryRepository.findUserByPasswordRecoveryCode(
        recoveryCode,
      );
    if (!userModel) {
      throw new BadRequestException([
        { message: PASSWORD_RECOVERY_CODE_MESSAGE, field: 'recoveryCode' },
      ]);
    }
    if (userModel.passwordRecoveryInformation.expirationDate < Date.now()) {
      throw new BadRequestException([
        { message: PASSWORD_RECOVERY_CODE_MESSAGE, field: 'recoveryCode' },
      ]);
    }
    if (userModel.passwordRecoveryInformation.recoveryCode !== recoveryCode) {
      throw new BadRequestException([
        { message: PASSWORD_RECOVERY_CODE_MESSAGE, field: 'recoveryCode' },
      ]);
    }
    const passHash = await this.usersService.getPasswordHash(
      newPassword,
      userModel.accountData.passwordSalt,
    );
    await userModel.setPasswordHash(passHash);
    return !!(await this.userRepository.save(userModel));
  }
}
