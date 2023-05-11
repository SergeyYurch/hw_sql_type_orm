export class BlogCreatedDto {
  name: string;
  description: string;
  websiteUrl: string;
  blogOwnerId: string | null;
  blogOwnerLogin: string | null;
}
