import { Injectable } from '@nestjs/common';
import { MailService } from '../../../../common/mail.service/mail.service';
import { UserInputModel } from '../../dto/input-models/user-input-model';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCreatDto } from '../../dto/user-creat.dto';
import { UsersService } from '../users.service';
import { UsersTypeOrmRepository } from '../users.typeorm.repository';
import { UsersQueryTypeormRepository } from '../users.query-typeorm.repository';
import { User } from '../../domain/user';
import { UserTelegramDataInputModel } from '../../dto/input-models/user-telegram-data.input-model';

export class TelegramRegistrationUserCommand {
  constructor(public usersTelegramData: UserTelegramDataInputModel) {}
}

@Injectable()
@CommandHandler(TelegramRegistrationUserCommand)
export class TelegramRegistrationUserUseCase
  implements ICommandHandler<TelegramRegistrationUserCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryTypeormRepository,
    private readonly usersRepository: UsersTypeOrmRepository,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}
  async execute(command: TelegramRegistrationUserCommand) {
    const {
      userName,
      telegramFirstName,
      confirmationCode,
      languageCode,
      chatId,
    } = command.usersTelegramData;

    const userModel =
      await this.usersQueryRepository.getUserModelByTelegramCode(
        confirmationCode,
      );
    if (!userModel) return null;
    userModel.telegramInfo = {
      userName,
      telegramFirstName,
      confirmationCode,
      languageCode,
      chatId,
    };

    return this.usersRepository.save(userModel);
  }
}
