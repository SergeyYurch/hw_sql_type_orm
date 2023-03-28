export type CommentSqlDbType = {
  id: string;
  content: string;
  postId: string;
  postTitle: string;
  blogId: string;
  blogOwnerId: string;
  blogName: string;
  commentatorId: string;
  commentatorLogin: string;
  createdAt: string;
  updatedAt: string;
  likesCount: string;
  dislikesCount: string;
  myStatus: string;
};
