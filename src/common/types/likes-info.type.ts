import { LikeStatusType } from '../dto/input-models/like.input.model';

export interface LikesInfoType {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusType;
}
