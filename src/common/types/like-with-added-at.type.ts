import { LikeStatusType } from '../dto/input-models/like.input.model';

export type LikeWithAddedAtType = {
  userId: string;
  login: string;
  likeStatus: LikeStatusType;
  addedAt: number;
};
