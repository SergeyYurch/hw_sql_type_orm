import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailService } from '../../../common/mail.service/mail.service';
import { BadRequestException } from '@nestjs/common';
import { EMAIL_RESENDING_MESSAGE } from '../../constants/auth.constant';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';

export class RegistrationEmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private userQueryRepository: UsersQueryTypeormRepository,
    private userRepository: UsersTypeOrmRepository,
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
    await Promise.all([
      this.mailService.sendConfirmationEmail(email, confirmationCode),
      this.userRepository.save(userModel),
    ]);
  }
}
