import { LikeStatusType } from '../../../common/dto/input-models/like.input.model';

export class LikeDto {
  userId: string;
  login: string;
  likeStatus: LikeStatusType;
}
