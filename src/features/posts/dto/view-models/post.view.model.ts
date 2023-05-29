import { ExtendedLikesInfoViewModel } from '../../../../common/dto/view-models/extended-likes-info.view.model';
import { PhotoSizeViewModel } from '../../../../common/dto/view-models/photo-size.view.model';

export interface PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
  images: { main: PhotoSizeViewModel[] };
}
