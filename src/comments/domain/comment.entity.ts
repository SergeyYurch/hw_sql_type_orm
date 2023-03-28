import { CreatedCommentDto } from '../dto/created-comment.dto';
import { CommentsLikeEntity } from './comments-like.entity';
import { LikesCountsType } from '../../common/types/likes-counts.type';
import { LikeType } from '../../common/types/like.type';
import { LikeDto } from '../../common/dto/like.dto';

export class CommentEntity {
  id: string;
  content: string;
  postId: string;
  postTitle: string;
  blogId: string;
  blogOwnerId: string;
  blogName: string;
  commentatorId: string;
  commentatorLogin: string;
  // isBanned: boolean;
  createdAt: number;
  updatedAt: number;
  likes: CommentsLikeEntity;
  likeRequestingUser: LikeType | null;
  likesCounts: LikesCountsType;
  newLike: LikeType | null;

  constructor() {
    this.likes = {
      myStatus: 'None',
      likesCount: 0,
      dislikesCount: 0,
    };
    this.likeRequestingUser = null;
    this.likesCounts = { likesCount: 0, dislikesCount: 0 };
    this.newLike = null;
  }

  initial(createdComment: CreatedCommentDto) {
    this.content = createdComment.content;
    this.postId = createdComment.postId;
    this.postTitle = createdComment.postTitle;
    this.blogId = createdComment.blogId;
    this.blogOwnerId = createdComment.blogId;
    this.blogName = createdComment.blogName;
    this.commentatorId = createdComment.commentatorId;
    this.commentatorLogin = createdComment.commentatorLogin;
    // this.isBanned = false;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }

  updateContent(content: string) {
    this.content = content;
    this.updatedAt = Date.now();
  }

  // banComment(isBanned: boolean) {
  //   this.isBanned = isBanned;
  // }
  updateLikeStatus(like: LikeDto) {
    if (!this.newLike) {
      this.newLike = {
        ...like,
      };
      return true;
    }
    this.newLike.likeStatus = like.likeStatus;
    return true;
  }
}
