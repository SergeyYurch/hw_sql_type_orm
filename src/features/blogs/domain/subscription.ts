import { Blog } from './blog';
import { User } from '../../users/domain/user';
import { SubscriptionStatuses } from '../types/subscription-statuses.enum';

export class Subscription {
  user: User;
  blog: Blog;
  blogId: string;
  subscribedAt: Date;
  unsubscribedAt: Date;
  status: SubscriptionStatuses;
}
