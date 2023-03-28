export class BlogDbDtoSql {
  id: string;
  name: string;
  blogOwnerId: string | null;
  blogOwnerLogin: string | null;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  isBanned: boolean;
  banDate: string | null;
  countBannedUsers: number;
}
