import { BlogImagesViewModel } from './blog-images.view.model';
import { SubscriptionStatuses } from '../../types/subscription-statuses.enum';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  images: BlogImagesViewModel;
  currentUserSubscriptionStatus: SubscriptionStatuses;
  subscribersCount: number;
}
