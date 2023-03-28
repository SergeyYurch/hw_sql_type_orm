import { ExtendedLikesInfoViewModel } from '../../../common/dto/view-models/extended-likes-info.view.model';

export interface PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
}
