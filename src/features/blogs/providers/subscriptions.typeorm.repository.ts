import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ERR_SAVE_TO_DB } from '../constants/blogs.constant';
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
          subscription.blog.id,
        )) ?? new SubscriptionEntity();

      subscriptionEntity.subscribedAt = subscription.subscribedAt ?? null;
      subscriptionEntity.unsubscribedAt = subscription.unsubscribedAt ?? null;
      subscriptionEntity.code = subscription.code;
      subscriptionEntity.userId = +subscription.user.id;
      subscriptionEntity.blogId = +subscription.blog.id;
      await this.subscriptionRepository.save(subscriptionEntity);
      return true;
    } catch (e) {
      console.log(e);
      return ERR_SAVE_TO_DB;
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
