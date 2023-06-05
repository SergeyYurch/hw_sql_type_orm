import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Subscription } from '../../domain/subscription';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionsTypeormRepository } from '../subscriptions.typeorm.repository';
import { SubscriptionsTypeormQueryRepository } from '../subscriptions.typeorm.query.repository';

export class UnsubscribeCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(UnsubscribeCommand)
export class UnsubscribeUseCase implements ICommandHandler<UnsubscribeCommand> {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionsRepository: SubscriptionsTypeormRepository,
    private readonly subscriptionsQueryRepository: SubscriptionsTypeormQueryRepository,
  ) {}

  async execute(command: UnsubscribeCommand) {
    const { blogId, userId } = command;
    const subscription: Subscription =
      await this.subscriptionsQueryRepository.getSubscription(userId, blogId);
    if (!subscription) return false;
    return this.subscriptionsRepository.delete(subscription);
  }
}
