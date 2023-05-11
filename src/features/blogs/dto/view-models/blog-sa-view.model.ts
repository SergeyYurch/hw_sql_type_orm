import { BlogViewModel } from './blog.view.model';

export class BlogSaViewModel extends BlogViewModel {
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  banInfo: {
    isBanned: boolean;
    banDate: string;
  };
}
