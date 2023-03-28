import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/providers/users.repository';
import { BadRequestException } from '@nestjs/common';
import { EMAIL_CONFIRMATION_MESSAGE } from '../../constants/auth.constant';
import { UsersSqlRepository } from '../../../users/providers/users.sql.repository';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';
export class RegistrationConfirmationCommand {
  constructor(public code: string) {}
}
@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private userRepository: UsersSqlRepository,
    private userQueryRepository: UsersQuerySqlRepository,
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
      console.log('**************************************************');
      console.log(userModel.emailConfirmation.expirationDate);
      console.log(Date.now());
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
