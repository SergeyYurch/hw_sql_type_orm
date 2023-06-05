import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { SubscriptionService } from './subscription.service';
import { Subscription } from '../domain/subscription';

@Injectable()
export class SubscriptionsTypeormQueryRepository {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
  ) {}

  async getSubscription(userId: string, blogId: string): Promise<Subscription> {
    const subscriptionEntity: SubscriptionEntity = await this.findSubscription(
      userId,
      blogId,
    );
    return this.subscriptionService.mapToSubscriptionDomainModel(
      subscriptionEntity,
    );
  }

  async findSubscription(
    userId: string,
    blogId: string,
  ): Promise<SubscriptionEntity> {
    return this.subscriptionRepository.findOne({
      relations: { user: true, blog: true },
      where: { userId: +userId, blogId: +blogId },
    });
  }
}
