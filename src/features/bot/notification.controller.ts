import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { TelegramAdapter } from '../../adapters/telegram/telegram.adapter';
import { TelegramUpdateMessageType } from './telegram-update-message.type';
import { UserTelegramDataInputModel } from '../users/dto/input-models/user-telegram-data.input-model';
import { TelegramRegistrationUserCommand } from '../users/providers/use-cases/telegram-registration-user.use-case';
import { UsersQueryTypeormRepository } from '../users/providers/users.query-typeorm.repository';

@Controller('notification')
export class NotificationController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  @Post('telegram')
  async telegramHook(@Body() payload: TelegramUpdateMessageType) {
    console.log('It was received by telegram end-point');
    console.log(payload);
    if (payload.message.text.match(/\/start code=(.+)/)) {
      const code = payload.message.text.split('=')[1];
      const telegramInfo: UserTelegramDataInputModel = {
        confirmationCode: code,
        chatId: payload.message.chat.id,
        telegramFirstName: payload.message.from.first_name,
        languageCode: payload.message.from.language_code,
        userName: payload.message.from.username,
      };
      const res = await this.commandBus.execute(
        new TelegramRegistrationUserCommand(telegramInfo),
      );
      if (!res) {
        await this.telegramAdapter.sendMessage(
          `Ошибочный код активации, запросите новую ссылку и пропробуйте еще раз!`,
          payload.message.from.id,
        );
      } else {
        await this.telegramAdapter.sendMessage(
          `Все ок. Вы будете получать сообщения о Ваших подписках.`,
          payload.message.from.id,
        );
      }
    }

    if (payload.message.text.match(/\/start$/)) {
      const res =
        await this.usersQueryTypeormRepository.isUserTelegramIdRegistered(
          payload.message.from.id,
        );
      if (!res) {
        await this.telegramAdapter.sendMessage(
          `Отсутвует код активации. Получите новую ссылку для активации или после команды /start отправьте код активации`,
          payload.message.from.id,
        );
      } else {
        await this.telegramAdapter.sendMessage(
          `Все ок. Вы будете получать сообщения о Ваших подписках.`,
          payload.message.from.id,
        );
      }
    }

    if (payload.message.text.match(/^(привет|hello)/i)) {
      await this.telegramAdapter.sendMessage(
        `И тебе не хворать ${payload.message.from.first_name}`,
        payload.message.from.id,
      );
    }
  }

  @Get('telegram')
  test() {
    console.log('payload');
  }
}
