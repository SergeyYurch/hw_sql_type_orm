import { LikeStatusType } from '../../common/dto/input-models/like.input.model';

export class LikeForPost {
  userId: string;
  login: string;
  likeStatus: LikeStatusType;
  addedAt: number;
  updatedAt: number;
}
