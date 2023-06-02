import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { TelegramAdapter } from '../../adapters/telegram/telegram.adapter';
import { TelegramUpdateMessageType } from './telegram-update-message.type';

@Controller('notification')
export class NotificationController {
  constructor(
    private commandBus: CommandBus,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  @Post('telegram')
  async telegramHook(@Body() payload: TelegramUpdateMessageType) {
    console.log(payload);
    if (
      payload.message.text === `Привет` &&
      payload.message.from.id === 449506828
    ) {
      await this.telegramAdapter.sendMessage(
        `И тебе привет ${payload.message.from.first_name} от твоего любимого мужа`,
        payload.message.from.id,
      );
    }
  }

  @Get('telegram')
  test() {
    console.log('payload');
  }
}
