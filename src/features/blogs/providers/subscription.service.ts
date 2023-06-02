import { SubscriptionEntity } from '../entities/subscription.entity';
import { Subscription } from '../domain/subscription';
import { UsersService } from '../../users/providers/users.service';
import { BlogService } from './blog.service';
import { User } from '../../users/domain/user';
import { Blog } from '../domain/blog';
import { JwtService } from '@nestjs/jwt';

export class SubscriptionService {
  constructor(
    private readonly usersService: UsersService,
    private readonly blogService: BlogService,
    private readonly jwtService: JwtService,
  ) {}
  // mapSubscriptionToEntity(subscription: Subscription): SubscriptionEntity {
  //   const subscriptionEntity = new SubscriptionEntity();
  //
  //   subscriptionEntity.id = subscription.id;
  //   subscriptionEntity.subscribedAt = subscription.subscribedAt;
  //   subscriptionEntity.unsubscribedAt = subscription.unsubscribedAt;
  //   subscriptionEntity.code = subscription.code;
  //   subscriptionEntity.user = this.usersService.mapUserToEntity(subscription.user);
  //   subscriptionEntity.blog = mapBlogToEntity(subscription.blog);
  //
  //   return subscriptionEntity;
  // }
  mapToSubscriptionDomainModel(
    subscriptionEntity: SubscriptionEntity,
  ): Subscription {
    const user: User = this.usersService.mapToUserDomainModel(
      subscriptionEntity.user,
    );
    const blog: Blog = this.blogService.mapToBlogDomainModel(
      subscriptionEntity.blog,
    );
    const subscription = new Subscription(user, blog);

    subscription.id = subscriptionEntity.id;
    subscription.subscribedAt = subscriptionEntity.subscribedAt;
    subscription.unsubscribedAt = subscriptionEntity.unsubscribedAt;
    subscription.code = subscriptionEntity.code;

    return subscription;
  }

  generateCode(userId: string, blogId: string) {
    return this.jwtService.signAsync(
      { userId, blogId },
      { secret: process.env.TELEGRAM_SECRET },
    );
  }
}
