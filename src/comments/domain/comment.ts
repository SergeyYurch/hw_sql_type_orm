import { CommentsLikeEntity } from './comments-like.entity';
import { LikesCountsType } from '../../common/types/likes-counts.type';
import { LikeType } from '../../common/types/like.type';
import { User } from '../../users/domain/user';
import { Post } from '../../posts/domain/post';
import { LikeStatusType } from '../../common/dto/input-models/like.input.model';

export class Comment {
  id: string;
  content: string;
  post: Post;
  commentator: User;
  createdAt: number;
  updatedAt: number;
  likes: CommentsLikeEntity;
  likeRequestingUser: LikeType | null;
  likesCounts: LikesCountsType;
  newLike: { user: User; likeStatus: LikeStatusType } | null;

  constructor(commentator: User, post: Post, content: string) {
    this.commentator = commentator;
    this.post = post;
    this.content = content;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.likes = {
      myStatus: 'None',
      likesCount: 0,
      dislikesCount: 0,
    };
    this.likeRequestingUser = null;
    this.likesCounts = { likesCount: 0, dislikesCount: 0 };
    this.newLike = null;
  }

  // initial(createdComment: CreatedCommentDto) {
  //   this.content = createdComment.content;
  //   this.postId = createdComment.postId;
  //   this.postTitle = createdComment.postTitle;
  //   this.blogId = createdComment.blogId;
  //   this.blogOwnerId = createdComment.blogId;
  //   this.blogName = createdComment.blogName;
  //   this.commentatorId = createdComment.commentatorId;
  //   this.commentatorLogin = createdComment.commentatorLogin;
  //   // this.isBanned = false;
  // }

  updateContent(content: string) {
    this.content = content;
    this.updatedAt = Date.now();
  }

  updateLikeStatus(likeStatus: LikeStatusType, user: User) {
    if (!this.newLike) {
      this.newLike = {
        user,
        likeStatus,
      };
      return true;
    }
    this.newLike.likeStatus = likeStatus;
    return true;
  }
}
