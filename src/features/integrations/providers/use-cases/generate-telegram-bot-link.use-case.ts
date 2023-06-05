import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { getConfirmationCode } from '../../../../common/helpers/helpers';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';
import { TelegramAdapter } from '../../../../adapters/telegram/telegram.adapter';

export class GenerateTelegramBotLinkCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GenerateTelegramBotLinkCommand)
export class GenerateTelegramBotLinkUseCase
  implements ICommandHandler<GenerateTelegramBotLinkCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryTypeormRepository,
    private usersRepository: UsersTypeOrmRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  async execute(command: GenerateTelegramBotLinkCommand) {
    const user = await this.usersQueryRepository.getUserModelById(
      command.userId,
    );
    user.setTelegramConfirmationCode(getConfirmationCode());
    await this.usersRepository.save(user);
    const botLink = await this.telegramAdapter.getBotLink();
    return `${botLink}?start=code%3d${user.telegramInfo.confirmationCode}`;
  }
}
