import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { BlogsQueryTypeOrmRepository } from '../../../blogs/providers/blogs.query.type-orm.repository';
import { SubscriberNotificationCommand } from '../../../bot/use-cases/subsriber-notification.use-case';

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
    const subscribers = blog.subscriptions.map((s) => s.user);

    const message = `New post published for blog "${blog.name}".`;
    await this.commandBus.execute(
      new SubscriberNotificationCommand(subscribers, message),
    );
  }
}
