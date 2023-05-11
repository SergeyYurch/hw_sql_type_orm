import { Injectable } from '@nestjs/common';
import { MailService } from '../../../../common/mail.service/mail.service';
import { UserInputModel } from '../../dto/input-models/user-input-model';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCreatDto } from '../../dto/user-creat.dto';
import { UsersService } from '../users.service';
import { UsersTypeOrmRepository } from '../users.typeorm.repository';
import { UsersQueryTypeormRepository } from '../users.query-typeorm.repository';

export class RegistrationUserCommand {
  constructor(public userInputModel: UserInputModel) {}
}

@Injectable()
@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryTypeormRepository,
    private readonly usersRepository: UsersTypeOrmRepository,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}
  async execute(command: RegistrationUserCommand) {
    const { userInputModel } = command;
    const { login, email, password } = userInputModel;
    const passwordSalt = await this.usersService.getPasswordSalt();
    const passwordHash = await this.usersService.getPasswordHash(
      password,
      passwordSalt,
    );
    const user: UserCreatDto = {
      login,
      email,
      passwordSalt,
      passwordHash,
      isConfirmed: false,
    };
    let userModel = this.usersRepository.createUserModel();
    userModel.initialize(user);
    userModel = await this.usersRepository.save(userModel);
    if (!userModel) return null;
    const confirmationCode = userModel.emailConfirmation.confirmationCode;
    await this.mailService.sendConfirmationEmail(email, confirmationCode);
    return userModel;
  }
}
