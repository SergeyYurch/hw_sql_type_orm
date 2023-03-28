export class BanUserForBlogDto {
  userId: string;
  blogId: string;
  banReason: string;
  isBanned: boolean;
}
