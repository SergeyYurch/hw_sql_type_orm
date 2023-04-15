import { Injectable } from '@nestjs/common';
import { pagesCount } from '../../common/helpers/helpers';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { CommentViewModel } from '../dto/view-models/comment.view.model';
import { GetCommentOptionTypes } from '../types/get-comment-option.types';
import { CommentsSearchParamsType } from '../types/comments-search-params.type';
import { BloggerCommentViewModel } from '../dto/view-models/blogger-comment.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentSqlDbType } from '../types/comment-sql-db.type';
import { Comment } from '../domain/comment';
import { LikesQuerySqlRepository } from '../../common/providers/likes.query.sql.repository';
import { LikeStatusType } from '../../common/dto/input-models/like.input.model';

@Injectable()
export class CommentsQuerySqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private likesQuerySqlRepository: LikesQuerySqlRepository,
  ) {}

  async isCommentOwner(userId: string, commentId: string): Promise<boolean> {
    const comment = await this.findById(commentId);
    return comment.commentatorId === userId;
  }

  async doesCommentIdExist(commentId: string, options?: GetCommentOptionTypes) {
    try {
      //default conditions is: if blog is not banned, if user is not banned,
      //and if user is not banned for current blog
      const conditions = `
          WHERE c.id=${commentId} 
          AND u."isBanned"=false
          AND b."isBanned"=false
          AND NOT EXISTS (SELECT * FROM blogs_banned_users bbu1 WHERE bbu1."blogId"=b.id AND bbu1."userId"=c."commentatorId")`;
      if (!options?.bannedUserInclude)
        conditions.replace('AND u."isBanned"=false', '');
      if (options?.bannedBlogInclude)
        conditions.replace('AND b."isBanned"=false', '');
      if (options?.bloggerBannedUserInclude)
        conditions.replace(
          'AND NOT EXISTS (SELECT * FROM blogs_banned_users bbu1 WHERE bbu1."blogId"=b.id AND bbu1."userId"=c."commentatorId")',
          '',
        );
      const queryString = `
        SELECT EXISTS (
          SELECT c.id FROM comments c
          LEFT JOIN posts p ON c."postId"=p.id
          LEFT JOIN blogs b ON  p."blogId"=b.id
          LEFT JOIN users u ON  c."commentatorId"=u.id
          LEFT JOIN blogs_banned_users bbu ON  bbu."blogId"=b.id AND bbu."userId"=c."commentatorId"
          ${conditions}
        );
                          `;
      const result = await this.dataSource.query(queryString);
      return result[0].exists;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getCommentById(commentId: string, options?: GetCommentOptionTypes) {
    console.log('[getCommentById]');
    const comment = await this.findById(commentId, options);
    if (!comment) return null;
    return this.getCommentViewModel(comment);
  }

  async getBloggersComments(
    paginatorParams: PaginatorInputType,
    bloggerId: string,
  ) {
    const { pageSize, pageNumber } = paginatorParams;
    const { commentEntities, totalCount } = await this.findComments(
      paginatorParams,
      { bloggerId },
      { bannedBlogInclude: true, likesInclude: false },
    );

    const items = commentEntities.map((c) =>
      this.getBloggerCommentViewModel(c),
    );
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
    const { commentEntities, totalCount } = await this.findComments(
      paginatorParams,
      { postId },
      { ...options, likesInclude: true },
    );
    const items: CommentViewModel[] = commentEntities.map((c) =>
      this.getCommentViewModel(c),
    );
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async findById(
    commentId: string,
    options?: GetCommentOptionTypes,
  ): Promise<Comment> {
    console.log(`[findById]`);
    const userId = options?.userId || '0';
    let condition = `WHERE c.id=${commentId} AND b."isBanned"=false AND u."isBanned"=false`;
    if (options?.bannedUserInclude)
      condition = `WHERE c.id=${commentId} AND b."isBanned"=false`;
    const queryString = ` 
       SELECT 
         c.*, 
         c.*, 
         p.title as "postTitle",
         p."blogId",
         b."blogOwnerId", 
         b.name as "blogName", 
         u.login as "commentatorLogin",
         l."likeStatus" as "myStatus",
         ( SELECT count(*) 
           FROM likes l
           LEFT JOIN users ur ON ur.id = l."userId" 
           WHERE l."commentId"=c.id AND l."likeStatus"='Like' AND ur."isBanned"=false) as "likesCount",
         (SELECT count(*) 
           FROM likes l
           LEFT JOIN users ur ON ur.id = l."userId" 
           WHERE l."commentId"=c.id AND l."likeStatus"='Dislike' AND ur."isBanned"=false) as "dislikesCount"
        FROM comments c
        LEFT JOIN posts p ON c."postId"=p.id
        LEFT JOIN blogs b ON  p."blogId"=b.id
        LEFT JOIN users u ON  c."commentatorId"=u.id
        LEFT JOIN likes l ON  (l."commentId"=c.id AND l."userId"= ${userId})
        ${condition};
        `;
    console.log(queryString);
    const queryResult = await this.dataSource.query(queryString);
    if (!queryResult[0]) return null;
    return this.castToEntity(queryResult[0], {
      likesInclude: true,
      likeRequestingUserId: options?.userId,
    });
  }

  async findComments(
    paginatorParams: PaginatorInputType,
    searchParams: CommentsSearchParamsType,
    options?: GetCommentOptionTypes,
  ): Promise<{ totalCount: number; commentEntities: Comment[] }> {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    const { bannedUserInclude } = options;
    const userId = options?.userId || '0';
    const { postId, bloggerId } = searchParams;
    let conditionsList = [`u."isBanned"=false`];
    if (bannedUserInclude) conditionsList = [];
    if (postId) conditionsList.push(`c."postId"=${postId}`);
    if (bloggerId) conditionsList.push(`b."blogOwnerId"=${bloggerId}`);
    let condition = '';
    if (conditionsList.length > 0)
      condition = 'WHERE ' + conditionsList.join(' AND ');
    const totalCount = +(
      await this.dataSource.query(`
                        SELECT count(*)
                        FROM comments c
                        LEFT JOIN posts p ON c."postId"=p.id
                        LEFT JOIN blogs b ON  p."blogId"=b.id
                        LEFT JOIN users u ON  c."commentatorId"=u.id
                        ${condition};
                `)
    )[0].count;
    if (!totalCount) return { totalCount: 0, commentEntities: [] };
    //Query to db
    const likesCountString = `
    (SELECT count(*) 
     FROM likes l
     LEFT JOIN users ur ON ur.id = l."userId" 
     WHERE l."commentId"=c.id AND l."likeStatus"='Like' AND ur."isBanned"=false) as "likesCount"`;

    const dislikesCountString = `
    (SELECT count(*) 
     FROM likes l
     LEFT JOIN users ur ON ur.id = l."userId" 
     WHERE l."commentId"=c.id AND l."likeStatus"='Dislike' AND ur."isBanned"=false) as "dislikesCount"`;
    const queryString = ` SELECT c.*,  
                               p.title as "postTitle",
                               p."blogId",
                               b."blogOwnerId", 
                               b.name as "blogName", 
                               u.login as "commentatorLogin",
                               ${likesCountString},
                               ${dislikesCountString},
                               l."likeStatus" as "myStatus"
                        FROM comments c
                        LEFT JOIN posts p ON c."postId"=p.id
                        LEFT JOIN blogs b ON  p."blogId"=b.id
                        LEFT JOIN users u ON  c."commentatorId"=u.id
                        LEFT JOIN likes l ON  (l."commentId"=c.id AND l."userId"= ${userId})
                        ${condition}
                        ORDER BY "${sortBy}" ${sortDirection}
                        LIMIT ${pageSize}
                        OFFSET ${pageSize * (pageNumber - 1)};
                        `;
    const comments: CommentSqlDbType[] = await this.dataSource.query(
      queryString,
    );

    const commentEntities: Comment[] = [];
    for (const comment of comments) {
      commentEntities.push(
        await this.castToEntity(comment, {
          likesInclude: options.likesInclude,
          likeRequestingUserId: options?.userId,
        }),
      );
    }

    return { totalCount, commentEntities };
  }

  // getLikesInfo(comment: CommentDocument, userId?: string) {
  //   let likesCount = 0;
  //   let dislikesCount = 0;
  //   let myStatus: LikeStatusType = 'None';
  //   if (comment.likes.length > 0) {
  //     likesCount = comment.likes.filter(
  //       (c) => c.likeStatus === 'Like' && !c.userIsBanned,
  //     ).length;
  //     dislikesCount = comment.likes.filter(
  //       (c) => c.likeStatus === 'Dislike' && !c.userIsBanned,
  //     ).length;
  //     if (userId) {
  //       const myLike = comment.likes.find((l) => l.userId === userId);
  //       if (myLike) myStatus = myLike.likeStatus;
  //     }
  //   }
  //   return {
  //     likesCount,
  //     dislikesCount,
  //     myStatus,
  //   };
  // }

  getCommentViewModel(comment: Comment): CommentViewModel {
    // const likesInfo = {
    //   likesCount: comment.likesCounts.likesCount,
    //   dislikesCount: comment.likesCounts.dislikesCount,
    //   myStatus: comment.likeRequestingUser?.likeStatus || 'None',
    // };
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorId,
        userLogin: comment.commentatorLogin,
      },
      createdAt: new Date(+comment.createdAt).toISOString(),
      likesInfo: comment.likes,
    };
  }

  getBloggerCommentViewModel(comment: Comment): BloggerCommentViewModel {
    // const likesInfo = this.getLikesInfo(comment);
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorId,
        userLogin: comment.commentatorLogin,
      },
      createdAt: new Date(+comment.createdAt).toISOString(),
      postInfo: {
        id: comment.postId,
        title: comment.postTitle,
        blogId: comment.blogId,
        blogName: comment.blogName,
      },
    };
  }

  private async castToEntity(
    comment: CommentSqlDbType,
    options: { likesInclude: boolean; likeRequestingUserId?: string } = {
      likesInclude: true,
    },
  ) {
    const likeRequestingUserId = options.likeRequestingUserId;
    const { likesInclude } = options;
    const commentEntity: Comment = new Comment();
    commentEntity.id = comment.id;
    commentEntity.content = comment.content;
    commentEntity.postId = comment.postId;
    commentEntity.postTitle = comment.postTitle;
    commentEntity.blogId = comment.blogId;
    commentEntity.blogOwnerId = comment.blogOwnerId;
    commentEntity.blogName = comment.blogName;
    commentEntity.commentatorId = comment.commentatorId;
    commentEntity.commentatorLogin = comment.commentatorLogin;
    commentEntity.createdAt = +comment.createdAt;
    commentEntity.updatedAt = +comment.updatedAt;
    commentEntity.likes = {
      likesCount: +comment.likesCount,
      dislikesCount: +comment.dislikesCount,
      myStatus: (comment.myStatus as LikeStatusType) || 'None',
    };
    // if (likesInclude) {
    //   commentEntity.likesCounts =
    //     await this.likesQuerySqlRepository.getLikesCount({
    //       commentId: comment.id,
    //     });
    //   if (likeRequestingUserId)
    //     commentEntity.likeRequestingUser =
    //       await this.likesQuerySqlRepository.findLike(likeRequestingUserId, {
    //         commentId: comment.id,
    //       });
    // }
    return commentEntity;
  }
}
