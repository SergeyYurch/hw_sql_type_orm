import { LikesInfoViewModel } from './likes-info.view.model';
import { LikeDetailsViewModel } from './like-details.view.model';

export interface ExtendedLikesInfoViewModel extends LikesInfoViewModel {
  newestLikes: LikeDetailsViewModel[];
}
