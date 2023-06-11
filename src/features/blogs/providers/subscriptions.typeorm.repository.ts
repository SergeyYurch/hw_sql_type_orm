import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsQueryTypeOrmRepository } from './blogs.query.type-orm.repository';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { Subscription } from '../domain/subscription';
import { SubscriptionsTypeormQueryRepository } from './subscriptions.typeorm.query.repository';

@Injectable()
export class SubscriptionsTypeormRepository {
  constructor(
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
    private usersQueryRepository: UsersQueryTypeormRepository,
    private readonly subscriptionsQueryRepository: SubscriptionsTypeormQueryRepository,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async save(subscription: Subscription) {
    try {
      const subscriptionEntity =
        (await this.subscriptionsQueryRepository.findSubscription(
          subscription.user.id,
          subscription.blog?.id ?? subscription.blogId,
        )) ?? new SubscriptionEntity();

      subscriptionEntity.userId = +subscription.user.id;
      subscriptionEntity.blogId =
        +subscription.blogId || +subscription.blog?.id;
      subscriptionEntity.subscribedAt = subscription.subscribedAt;
      subscriptionEntity.unsubscribedAt = subscription.unsubscribedAt;
      subscriptionEntity.status = subscription.status;
      await this.subscriptionRepository.save(subscriptionEntity);
      console.log('t333');
      console.log(subscriptionEntity);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async delete(subscription: Subscription) {
    try {
      await this.subscriptionRepository.delete({
        userId: +subscription.user.id,
        blogId: +subscription.blog.id,
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
