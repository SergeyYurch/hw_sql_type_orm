import { CommandHandler } from '@nestjs/cqrs';
import { TelegramAdapter } from '../../../adapters/telegram/telegram.adapter';
import { User } from '../../users/domain/user';

export class SubscriberNotificationCommand {
  constructor(public subscribers: User[], public message: string) {}
}

@CommandHandler(SubscriberNotificationCommand)
export class SubscriberNotificationUseCase {
  constructor(private readonly telegramAdapter: TelegramAdapter) {}

  async execute(command: SubscriberNotificationCommand) {
    const { message, subscribers } = command;
    for (const subscriber of subscribers) {
      await this.telegramAdapter.sendMessage(
        message,
        subscriber.telegramInfo.chatId,
      );
    }
  }
}
