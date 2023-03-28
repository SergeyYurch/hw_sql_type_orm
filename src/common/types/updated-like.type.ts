import { LikeStatusType } from '../dto/input-models/like.input.model';

export type LikeType = {
  userId: string;
  login: string;
  likeStatus: LikeStatusType;
};
