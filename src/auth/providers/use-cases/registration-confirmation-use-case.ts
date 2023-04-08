import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { EMAIL_CONFIRMATION_MESSAGE } from '../../constants/auth.constant';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
export class RegistrationConfirmationCommand {
  constructor(public code: string) {}
}
@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private userRepository: UsersTypeOrmRepository,
    private userQueryRepository: UsersQueryTypeormRepository,
  ) {}

  async execute(command: RegistrationConfirmationCommand) {
    const { code } = command;
    const userModel =
      await this.userQueryRepository.findUserByEmailConfirmationCode(code);
    if (!userModel) {
      throw new BadRequestException([
        { message: EMAIL_CONFIRMATION_MESSAGE, field: 'code' },
      ]);
    }
    if (userModel.emailConfirmation.expirationDate < Date.now()) {
      throw new BadRequestException([
        { message: EMAIL_CONFIRMATION_MESSAGE, field: 'code' },
      ]);
    }
    if (userModel.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        { message: EMAIL_CONFIRMATION_MESSAGE, field: 'code' },
      ]);
    }
    userModel.confirmEmail();
    return !!(await this.userRepository.save(userModel));
  }
}
