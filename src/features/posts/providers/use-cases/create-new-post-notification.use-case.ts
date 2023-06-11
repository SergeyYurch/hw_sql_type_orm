import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { BlogsQueryTypeOrmRepository } from '../../../blogs/providers/blogs.query.type-orm.repository';
import { SubscriberNotificationCommand } from '../../../bot/use-cases/subsriber-notification.use-case';
import { SubscriptionStatuses } from '../../../blogs/types/subscription-statuses.enum';

export class CreateNewPostNotificationCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(CreateNewPostNotificationCommand)
export class CreateNewPostNotificationUseCase {
  constructor(
    private readonly commandBus: CommandBus,
    private blogQueryRepository: BlogsQueryTypeOrmRepository,
  ) {}

  async execute(command: CreateNewPostNotificationCommand) {
    console.log('CreateNewPostNotificationUseCase was started');
    const blog = await this.blogQueryRepository.getBlogDomainModelById(
      command.blogId,
    );
    const subscribers = [];
    for (const s of blog.subscriptions) {
      if (s.status === SubscriptionStatuses.SUBSCRIBED)
        subscribers.push(s.user);
    }
    if (subscribers.length > 0) {
      const message = `New post published for blog "${blog.name}".`;
      await this.commandBus.execute(
        new SubscriberNotificationCommand(subscribers, message),
      );
    }
  }
}
