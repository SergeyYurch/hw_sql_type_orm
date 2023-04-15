import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CommentsLike, CommentsLikeSchema } from './comments-like.schema';
import { LikeStatusType } from '../../common/dto/input-models/like.input.model';
import { CreatedCommentDto } from '../dto/created-comment.dto';

@Schema()
export class Comment {
  _id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  postTitle: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogOwnerId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  commentatorId: string;

  @Prop({ required: true })
  commentatorLogin: string;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;

  @Prop({ type: [CommentsLikeSchema], default: [] })
  likes: CommentsLike[];

  initial(createdComment: CreatedCommentDto) {
    this.content = createdComment.content;
    this.postId = createdComment.postId;
    this.postTitle = createdComment.postTitle;
    this.blogId = createdComment.blogId;
    this.blogName = createdComment.blogName;
    this.blogOwnerId = createdComment.blogId;
    this.commentatorId = createdComment.commentatorId;
    this.commentatorLogin = createdComment.commentatorLogin;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateContent(content: string) {
    this.content = content;
    this.updatedAt = new Date();
  }

  banComment(isBanned: boolean) {
    this.isBanned = isBanned;
  }
  updateLikeStatus(userId: string, likeStatus: LikeStatusType) {
    const existingLikeItem = this.likes.find((l) => l.userId === userId);
    if (!existingLikeItem) {
      this.likes.push({
        userId,
        likeStatus,
        addedAt: new Date(),
        updatedAt: new Date(),
        userIsBanned: false,
      });
      return;
    }
    existingLikeItem.likeStatus = likeStatus;
    existingLikeItem.updatedAt = new Date();
    this.likes = this.likes.map((l) =>
      l.userId === userId ? existingLikeItem : l,
    );
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.methods = {
  initial: Comment.prototype.initial,
  updateContent: Comment.prototype.updateContent,
  updateLikeStatus: Comment.prototype.updateLikeStatus,
  banComment: Comment.prototype.banComment,
};
export type CommentDocument = HydratedDocument<Comment>;
