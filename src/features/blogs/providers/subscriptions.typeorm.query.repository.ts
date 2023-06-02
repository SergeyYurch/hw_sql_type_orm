import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class SubscriptionsTypeormQueryRepository {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
  ) {}

  async getSubscription(userId: string, blogId: string) {
    const subscriptionEntity: SubscriptionEntity =
      await this.subscriptionRepository.findOne({
        where: { userId: +userId, blogId: +blogId },
      });
    return this.subscriptionService.mapToSubscriptionDomainModel(
      subscriptionEntity,
    );
  }
}
