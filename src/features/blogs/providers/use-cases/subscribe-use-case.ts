import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryTypeOrmRepository } from '../blogs.query.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { Subscription } from '../../domain/subscription';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionsTypeormRepository } from '../subscriptions.typeorm.repository';
import { SubscriptionStatuses } from '../../types/subscription-statuses.enum';

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
      this.blogsQueryRepository.getBlogDomainModelById(blogId),
    ]);
    const subscription: Subscription = new Subscription();
    subscription.user = user;
    subscription.blog = blog;
    subscription.subscribedAt = new Date();
    subscription.status = SubscriptionStatuses.SUBSCRIBED;
    return this.subscriptionsRepository.save(subscription);
  }
}
