import { LikeStatusType } from '../../../common/dto/input-models/like.input.model';
import { User } from '../../users/domain/user';

export class Like {
  user: User;
  likeStatus: LikeStatusType;
}
