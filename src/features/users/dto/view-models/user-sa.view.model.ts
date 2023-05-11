import { UserViewModel } from './user.view.model';

export interface UserSaViewModel extends UserViewModel {
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
}
