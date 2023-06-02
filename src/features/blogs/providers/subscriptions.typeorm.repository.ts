import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ERR_SAVE_TO_DB } from '../constants/blogs.constant';
import { BlogsQueryTypeOrmRepository } from './blogs.query.type-orm.repository';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { Subscription } from '../domain/subscription';

@Injectable()
export class SubscriptionsTypeormRepository {
  constructor(
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
    private usersQueryRepository: UsersQueryTypeormRepository,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async save(subscription: Subscription) {
    try {
      const subscriptionEntity = new SubscriptionEntity();
      subscriptionEntity.id = subscription.id;
      subscriptionEntity.subscribedAt = subscription.subscribedAt;
      subscriptionEntity.unsubscribedAt = subscription.unsubscribedAt;
      subscriptionEntity.code = subscription.code;
      subscriptionEntity.userId = +subscription.user.id;
      subscriptionEntity.blogId = +subscription.blog.id;
      await this.subscriptionRepository.save(subscriptionEntity);
      return subscriptionEntity.id;
    } catch (e) {
      console.log(e);
      return ERR_SAVE_TO_DB;
    }
  }
}
