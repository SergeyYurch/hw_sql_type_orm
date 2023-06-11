import { SubscriptionEntity } from '../entities/subscription.entity';
import { Subscription } from '../domain/subscription';
import { UsersService } from '../../users/providers/users.service';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { SubscriptionStatuses } from '../types/subscription-statuses.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    private usersService: UsersService, // private blogService: BlogService,
  ) {}

  mapToSubscriptionDomainModel(
    subscriptionEntity: SubscriptionEntity,
  ): Subscription {
    const subscription = new Subscription();
    subscription.user = this.usersService.mapToUserDomainModel(
      subscriptionEntity.user,
    );
    subscription.blogId = subscriptionEntity.blogId.toString();
    subscription.subscribedAt = subscriptionEntity.subscribedAt;
    subscription.unsubscribedAt = subscriptionEntity.unsubscribedAt;
    subscription.status = subscriptionEntity.status as SubscriptionStatuses;

    return subscription;
  }

  generateCode(userId: string, blogId: string) {
    return uuidv4();
    // this.jwtService.signAsync(
    //   { userId, blogId },
    //   { secret: process.env.TELEGRAM_SECRET },
    // );
  }
}
