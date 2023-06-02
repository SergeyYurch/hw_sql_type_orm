import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { Subscription } from '../../domain/subscription';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionsTypeormRepository } from '../subscriptions.typeorm.repository';

export class SubscribeCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(SubscribeCommand)
export class SubscribeUseCase implements ICommandHandler<SubscribeCommand> {
  constructor(
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
    private usersQueryRepository: UsersQueryTypeormRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionsRepository: SubscriptionsTypeormRepository,
  ) {}

  async execute(command: SubscribeCommand) {
    const { blogId, userId } = command;
    const [user, blog] = await Promise.all([
      this.usersQueryRepository.getUserModelById(userId),
      this.blogsQueryRepository.getBlogModelById(blogId),
    ]);
    const subscription: Subscription = new Subscription(user, blog);
    const code = await this.subscriptionService.generateCode(userId, blogId);
    subscription.subscribe(code);
    return this.subscriptionsRepository.save(subscription);
  }
}
