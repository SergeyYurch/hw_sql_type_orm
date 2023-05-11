import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailService } from '../../../../common/mail.service/mail.service';
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
    try {
      const { email } = command;
      const userModel = await this.userQueryRepository.findUserByLoginOrEmail(
        email,
      );
      if (!userModel) {
        return false;
      }
      const recoveryCode = userModel.generateNewPasswordRecoveryCode();
      await Promise.all([
        await this.userRepository.save(userModel),
        await this.mailService.sendPasswordRecoveryEmail(email, recoveryCode),
      ]);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
