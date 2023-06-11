import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersTypeOrmRepository } from '../users.typeorm.repository';
import { UsersQueryTypeormRepository } from '../users.query-typeorm.repository';
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
  ) {}
  async execute(command: TelegramRegistrationUserCommand) {
    const {
      userName,
      telegramFirstName,
      confirmationCode,
      languageCode,
      chatId,
    } = command.usersTelegramData;

    if (!confirmationCode) return null;
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
