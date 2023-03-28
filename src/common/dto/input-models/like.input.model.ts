import { IsEnum } from 'class-validator';

enum LikesStatusEnum {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}
export type LikeStatusType = `${LikesStatusEnum}`;

export class LikeInputModel {
  @IsEnum(LikesStatusEnum)
  likeStatus: LikeStatusType;
}
