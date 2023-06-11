import { BanIncludeConditionEnum } from '../../../common/types/ban-include-condition.enum';

export type BlogsQueryOptionsType = {
  bannedBlogOwnerInclude?: boolean;
  bannedBlogInclude?: boolean;
  blogOwnerId?: string;
  foSaChecking?: boolean;
  currentUserId?: string;
  blogOwnerInclude?: BanIncludeConditionEnum;
  blogInclude?: BanIncludeConditionEnum;
};
