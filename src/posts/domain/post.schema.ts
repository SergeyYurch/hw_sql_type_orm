import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatusType } from '../../common/dto/input-models/like.input.model';
import { LikeForPost, LikeForPostSchema } from './like-for-post.schema';
import { PostCreateDto } from '../dto/post-create.dto';
import { PostUpdateDto } from '../dto/post-update.dto';

@Schema()
export class Post {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  bloggerId: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ type: [LikeForPostSchema], default: [] })
  likes: LikeForPost[];

  initial(postDto: PostCreateDto) {
    this.title = postDto.title;
    this.shortDescription = postDto.shortDescription;
    this.content = postDto.content;
    this.blogId = postDto.blogId;
    this.bloggerId = postDto.bloggerId;
    this.blogName = postDto.blogName;
    this.createdAt = new Date();
  }

  updatePost(postDto: PostUpdateDto) {
    this.title = postDto.title;
    this.shortDescription = postDto.shortDescription;
    this.content = postDto.content;
  }

  banPost(isBanned: boolean) {
    this.isBanned = isBanned;
  }

  updateLikeStatus(userId: string, login: string, likeStatus: LikeStatusType) {
    const existingLikeItem = this.likes.find((l) => l.userId === userId);
    if (!existingLikeItem) {
      this.likes.push({
        userId,
        login,
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
export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.methods = {
  initial: Post.prototype.initial,
  updatePost: Post.prototype.updatePost,
  updateLikeStatus: Post.prototype.updateLikeStatus,
  banPost: Post.prototype.banPost,
};

export type PostDocument = HydratedDocument<Post>;
