import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailService } from '../../../common/mail.service/mail.service';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}
@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private userRepository: UsersTypeOrmRepository,
    private userQueryRepository: UsersQueryTypeormRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    const { email } = command;
    const userModel = await this.userQueryRepository.findUserByLoginOrEmail(
      email,
    );
    if (!userModel) {
      return null;
    }
    const recoveryCode = userModel.generateNewPasswordRecoveryCode();
    await this.userRepository.save(userModel);
    const resultSendEmail = await this.mailService.sendPasswordRecoveryEmail(
      email,
      recoveryCode,
    );
    if (!resultSendEmail) console.log('email did not send');
    return resultSendEmail;
  }
}
