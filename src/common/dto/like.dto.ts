import { LikeStatusType } from './input-models/like.input.model';

export class LikeDto {
  userId: string;
  login: string;
  likeStatus: LikeStatusType;
}
