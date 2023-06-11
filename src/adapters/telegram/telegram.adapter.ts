// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Injectable } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');

@Injectable()
export class TelegramAdapter {
  token: string;
  hookUrl: string;
  constructor() {
    this.token = process.env.BOT_TOKEN;
    this.hookUrl = process.env.TELEGRAM_HOOK_URL + '/notification/telegram';
  }
  async telegramAction(method: string, payload?: any) {
    await axios.post(
      `https://api.telegram.org/bot${this.token}/${method}`,
      payload,
    );
  }

  async sendMessage(text: string, recipientId: number) {
    console.log(`sendMessage ${text} to ${recipientId}`);
    await this.telegramAction(`sendMessage`, {
      chat_id: recipientId,
      text,
    });
  }

  async setWebhook() {
    console.log(this.hookUrl);
    await this.telegramAction('setWebhook', { url: this.hookUrl });
  }

  async getBotLink() {
    const res = await axios.get(
      `https://api.telegram.org/bot${this.token}/getMe`,
    );
    return `https://t.me/${res.data.result.username}`;
  }
}
