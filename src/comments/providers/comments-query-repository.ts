import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { pagesCount } from '../../common/helpers/helpers';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { LikeStatusType } from '../../common/dto/input-models/like.input.model';
import { Comment, CommentDocument } from '../mongo-shema/comment.schema';
import { CommentViewModel } from '../dto/view-models/comment.view.model';
import { GetCommentOptionTypes } from '../types/get-comment-option.types';
import { CommentsSearchParamsType } from '../types/comments-search-params.type';
import { CommentsMongoFilterType } from '../types/comments-mongo-filter.type';
import { BloggerCommentViewModel } from '../dto/view-models/blogger-comment.view.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
  ) {}

  async checkCommentId(commentId: string) {
    const comment = await this.CommentModel.findById(commentId);
    return !!comment && !comment.isBanned;
  }

  async getCommentById(commentId: string, option?: GetCommentOptionTypes) {
    const { userId, bannedUserInclude } = option;
    const comment = await this.CommentModel.findById(commentId);
    if (!bannedUserInclude && comment.isBanned === true) return null;
    if (!comment || comment.isBanned) return null;
    return this.getCommentViewModel(comment, userId);
  }

  async getBloggersComments(
    paginatorParams: PaginatorInputType,
    bloggerId: string,
  ) {
    const { pageSize, pageNumber } = paginatorParams;
    const { comments, totalCount } = await this.findComments(
      paginatorParams,
      { bloggerId },
      { userId: bloggerId, bannedUserInclude: true },
    );

    const items = comments.map((c) => this.getBloggerCommentViewModel(c));
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async getCommentsByPostId(
    paginatorParams: PaginatorInputType,
    postId: string,
    options?: GetCommentOptionTypes,
  ) {
    const { pageSize, pageNumber } = paginatorParams;
    const { comments, totalCount } = await this.findComments(
      paginatorParams,
      { postId },
      options,
    );
    const items: CommentViewModel[] = comments.map((c) =>
      this.getCommentViewModel(c, options?.userId),
    );
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async findComments(
    paginatorParams: PaginatorInputType,
    searchParams: CommentsSearchParamsType,
    options?: GetCommentOptionTypes,
  ) {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    const { bannedUserInclude } = options;
    let filter: CommentsMongoFilterType = { ...searchParams };
    if (!bannedUserInclude) filter = { ...filter, isBanned: false };
    const totalCount = await this.CommentModel.countDocuments(filter);
    const comments = await this.CommentModel.find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .exec();
    return { totalCount, comments };
  }

  getLikesInfo(comment: CommentDocument, userId?: string) {
    let likesCount = 0;
    let dislikesCount = 0;
    let myStatus: LikeStatusType = 'None';
    if (comment.likes.length > 0) {
      likesCount = comment.likes.filter(
        (c) => c.likeStatus === 'Like' && !c.userIsBanned,
      ).length;
      dislikesCount = comment.likes.filter(
        (c) => c.likeStatus === 'Dislike' && !c.userIsBanned,
      ).length;
      if (userId) {
        const myLike = comment.likes.find((l) => l.userId === userId);
        if (myLike) myStatus = myLike.likeStatus;
      }
    }
    return {
      likesCount,
      dislikesCount,
      myStatus,
    };
  }

  getCommentViewModel(
    comment: CommentDocument,
    userId?: string,
  ): CommentViewModel {
    const likesInfo = this.getLikesInfo(comment, userId);
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorId,
        userLogin: comment.commentatorLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo,
    };
  }

  getBloggerCommentViewModel(
    comment: CommentDocument,
  ): BloggerCommentViewModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorId,
        userLogin: comment.commentatorLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      postInfo: {
        id: comment.postId,
        title: comment.postTitle,
        blogId: comment.blogId,
        blogName: comment.blogName,
      },
    };
  }
}
