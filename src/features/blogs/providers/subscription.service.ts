import { SubscriptionEntity } from '../entities/subscription.entity';
import { Subscription } from '../domain/subscription';
import { UsersService } from '../../users/providers/users.service';
import { BlogService } from './blog.service';
import { User } from '../../users/domain/user';
import { Blog } from '../domain/blog';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionService {
  constructor(
    private usersService: UsersService,
    private blogService: BlogService,
  ) {}

  mapToSubscriptionDomainModel(
    subscriptionEntity: SubscriptionEntity,
  ): Subscription {
    console.log('!!!!!!!!!!!!!!!!!!!!!');
    console.log(this.usersService);
    console.log(this.blogService);
    const user: User = this.usersService.mapToUserDomainModel(
      subscriptionEntity.user,
    );
    const blog: Blog = this.blogService.mapToBlogDomainModel(
      subscriptionEntity.blog,
    );
    const subscription = new Subscription(user, blog);

    // subscription.id = subscriptionEntity.id;
    subscription.subscribedAt = subscriptionEntity.subscribedAt;
    subscription.unsubscribedAt = subscriptionEntity.unsubscribedAt;
    subscription.code = subscriptionEntity.code;

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
