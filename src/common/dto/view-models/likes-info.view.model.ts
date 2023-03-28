import { LikeStatusType } from '../input-models/like.input.model';

export interface LikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusType;
}
