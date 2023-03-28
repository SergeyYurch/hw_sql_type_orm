import { LikesInfoViewModel } from '../../../common/dto/view-models/likes-info.view.model';

export interface CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikesInfoViewModel;
}
