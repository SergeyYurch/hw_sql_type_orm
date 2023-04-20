import { BlogCreatedDto } from '../dto/blog-created.dto';
import { BlogEditDto } from '../dto/blog-edit.dto';

export class BannedUser {
  id: string;
  login: string;
  banReason: string;
  banDate: number;
}

export class Blog {
  id: string;
  name: string;
  blogOwnerId: string;
  blogOwnerLogin: string;
  description: string;
  websiteUrl: string;
  createdAt: number;
  isMembership: boolean;
  isBanned: boolean;
  banDate: number | null;
  bannedUsers: BannedUser[];

  initial(inputDate: BlogCreatedDto) {
    this.name = inputDate.name;
    this.websiteUrl = inputDate.websiteUrl;
    this.description = inputDate.description;
    this.createdAt = Date.now();
    this.blogOwnerId = inputDate.blogOwnerId;
    this.blogOwnerLogin = inputDate.blogOwnerLogin;
    this.isMembership = false;
    this.isBanned = false;
    this.banDate = null;
    this.bannedUsers = [];
  }
  blogUpdate(changes: BlogEditDto) {
    this.name = changes.name;
    this.description = changes.description;
    this.websiteUrl = changes.websiteUrl;
  }

  bindUser(userId, userLogin) {
    this.blogOwnerId = userId;
    this.blogOwnerLogin = userLogin;
  }

  banBlog(isBanned: boolean) {
    this.isBanned = isBanned;
    this.banDate = Date.now();
  }

  banUser(id: string, login: string, banReason: string, isBanned: boolean) {
    if (isBanned) {
      const bannedIds = this.bannedUsers.map((bu) => bu.id);
      if (!bannedIds.includes(id)) {
        this.bannedUsers.push({
          id,
          login,
          banDate: Date.now(),
          banReason,
        });
      }
    }
    if (!isBanned) {
      this.bannedUsers = this.bannedUsers.filter((item) => item.id !== id);
    }
  }
}
