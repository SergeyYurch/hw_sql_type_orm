import { LikeStatusType } from '../../../common/dto/input-models/like.input.model';

export class CommentsLikeEntity {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusType;
}
