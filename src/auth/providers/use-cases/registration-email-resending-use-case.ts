import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/providers/users.repository';
import { MailService } from '../../../common/mail.service/mail.service';
import { BadRequestException } from '@nestjs/common';
import { EMAIL_RESENDING_MESSAGE } from '../../constants/auth.constant';
import { UsersSqlRepository } from '../../../users/providers/users.sql.repository';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';

export class RegistrationEmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private userQueryRepository: UsersQuerySqlRepository,
    private userRepository: UsersSqlRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(command: RegistrationEmailResendingCommand) {
    const { email } = command;
    const userModel = await this.userQueryRepository.findUserByLoginOrEmail(
      email,
    );
    if (!userModel) {
      throw new BadRequestException([
        { message: EMAIL_RESENDING_MESSAGE, field: 'email' },
      ]);
    }
    if (userModel.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        { message: EMAIL_RESENDING_MESSAGE, field: 'email' },
      ]);
    }
    const confirmationCode = userModel.generateNewEmailConfirmationCode();
    await this.mailService.sendConfirmationEmail(email, confirmationCode);
    await this.userRepository.save(userModel);
  }
}
