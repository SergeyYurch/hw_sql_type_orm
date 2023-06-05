import { TelegramAdapter } from '../../../adapters/telegram/telegram.adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrationsService {
  constructor(private readonly telegramAdapter: TelegramAdapter) {}

  async getAuthTelegramBotLink(userId: string) {
    return await this.telegramAdapter.getBotLink();
  }
}
