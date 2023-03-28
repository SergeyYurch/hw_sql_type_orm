import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument } from '../domain/comment.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
  ) {}

  async getCommentModelById(id: string) {
    return this.CommentModel.findById(id);
  }

  async getCommentsModelsByUserId(userId: string) {
    return this.CommentModel.find({ commentatorId: userId });
  }

  async getCommentsModelsForBlogByCommentatorId(
    commentatorId: string,
    blogId: string,
  ) {
    return this.CommentModel.find({ commentatorId, blogId });
  }

  async getCommentsModelsByLikeUserId(userId: string) {
    return this.CommentModel.find({ 'likes.userId': userId });
  }

  async createCommentModel() {
    return new this.CommentModel();
  }

  async deleteComment(commentId: string) {
    const result = await this.CommentModel.deleteOne({
      _id: new Types.ObjectId(commentId),
    });
    return result.deletedCount === 1;
  }

  async save(createdComment: CommentDocument) {
    const newComment = await createdComment.save();
    return newComment?._id?.toString();
  }
}
