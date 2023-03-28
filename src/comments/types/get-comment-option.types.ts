export type GetCommentOptionTypes = {
  userId?: string; // commentator ID
  bannedUserInclude?: boolean; //true -if include banned commentator to query results
  bloggerBannedUserInclude?: boolean; //
  bannedBlogInclude?: boolean;
  likesInclude?: boolean;
};
