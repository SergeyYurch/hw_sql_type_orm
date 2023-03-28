import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BlogCreatedDto } from '../dto/blog-created.dto';
import { BlogEditDto } from '../dto/blog-edit.dto';

@Schema()
export class BlogOwnerInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}

const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo);

@Schema()
export class BannedUser {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  banReason: string;

  @Prop({ default: new Date() })
  banDate: Date;
}

const BannedUserSchema = SchemaFactory.createForClass(BannedUser);

@Schema()
export class Blog {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  blogOwnerId: string;

  @Prop({ default: null })
  blogOwnerLogin: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: false })
  isMembership: boolean;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: null })
  banDate: Date | null;

  @Prop({ type: BlogOwnerInfoSchema, _id: false })
  blogOwnerInfo: BlogOwnerInfo;

  @Prop({ type: [BannedUserSchema], _id: false })
  bannedUsers: BannedUser[];

  initial(inputDate: BlogCreatedDto) {
    this.name = inputDate.name;
    this.websiteUrl = inputDate.websiteUrl;
    this.description = inputDate.description;
    this.createdAt = new Date();
    this.blogOwnerId = inputDate.blogOwnerId;
    this.blogOwnerLogin = inputDate.blogOwnerLogin;
  }

  blogUpdate(changes: BlogEditDto) {
    this.name = changes.name;
    this.description = changes.description;
    this.websiteUrl = changes.websiteUrl;
  }

  bindUser(userId, userLogin) {
    this.blogOwnerId = userId;
    this.blogOwnerLogin = userLogin;
  }

  banBlog(isBanned: boolean) {
    this.isBanned = isBanned;
    this.banDate = new Date();
  }

  banUser(id: string, login: string, banReason: string, isBanned: boolean) {
    if (isBanned) {
      this.bannedUsers.push({
        id,
        login,
        banDate: new Date(),
        banReason,
      });
    }
    if (!isBanned) {
      this.bannedUsers = this.bannedUsers.filter((item) => item.id !== id);
    }
  }
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.methods = {
  blogUpdate: Blog.prototype.blogUpdate,
  initial: Blog.prototype.initial,
  bindUser: Blog.prototype.bindUser,
  banUser: Blog.prototype.banUser,
  banBlog: Blog.prototype.banBlog,
};

export type BlogDocument = HydratedDocument<Blog>;
