import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { BlogsQueryTypeOrmRepository } from '../../../blogs/providers/blogs.query.type-orm.repository';
import { SubscriptionsTypeormQueryRepository } from '../../../blogs/providers/subscriptions.typeorm.query.repository';
import { SubscriberNotificationCommand } from '../../../bot/use-cases/subsriber-notification.use-case';

export class CreateNewPostNotificationCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(CreateNewPostNotificationCommand)
export class CreateNewPostNotificationUseCase {
  constructor(
    private readonly commandBus: CommandBus,
    private blogQueryRepository: BlogsQueryTypeOrmRepository,
    private readonly subscriptionsQueryRepository: SubscriptionsTypeormQueryRepository,
  ) {}

  async execute(command: CreateNewPostNotificationCommand) {
    const blog = await this.blogQueryRepository.getBlogDomainModelById(
      command.blogId,
    );
    const subscribers =
      await this.subscriptionsQueryRepository.getBlogSubscribers(
        command.blogId,
      );
    const message = `New post published for blog "${blog.name}".`;
    await this.commandBus.execute(
      new SubscriberNotificationCommand(subscribers, message),
    );
  }
}
