import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentsQuerySqlRepository } from './comments.query.sql.repository';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private commentsQuerySqlRepository: CommentsQuerySqlRepository,
  ) {}

  async getCommentModelById(id: string) {
    return this.commentsQuerySqlRepository.findById(id);
  }

  async createCommentModel() {
    return new Comment();
  }

  async deleteComment(commentId: string) {
    try {
      const queryString = `DELETE FROM comments WHERE id=${commentId}`;
      await this.dataSource.query(queryString);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async save(comment: Comment) {
    if (!comment.id) return await this.insertNewComment(comment);
    const commentDb: Comment = await this.commentsQuerySqlRepository.findById(
      comment.id,
    );
    //updateContent
    if (comment.content !== commentDb.content)
      return await this.updateCommentContent(comment);
    //update like-status
    if (comment.newLike) await this.updateLike(comment);
  }

  private async insertNewComment(comment: Comment) {
    const values = `'${comment.content}', '${comment.postId}', '${comment.commentatorId}', '${comment.createdAt}'`;
    const queryString = `INSERT INTO comments 
        (content, "postId", "commentatorId", "createdAt") 
        VALUES (${values}) RETURNING id;`;
    const result = await this.dataSource.query(queryString);
    return result[0].id;
  }

  private async updateCommentContent(comment: Comment) {
    try {
      const queryString = `
        UPDATE comments 
        SET content='${comment.content}', "updatedAt"='${comment.updatedAt}'
        WHERE id=${comment.id}
        `;
      await this.dataSource.query(queryString);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  private async updateLike(comment: Comment) {
    try {
      const { likeStatus, userId } = comment.newLike;
      const likeInDbQueryResult = await this.dataSource.query(`
      SELECT * FROM likes WHERE "commentId"=${comment.id} AND "userId"=${userId}
      `);
      if (likeInDbQueryResult[0]) {
        console.log('Update like');
        const queryString = `
        UPDATE likes
        SET "likeStatus"='${likeStatus}'
        WHERE "userId"=${userId} AND "commentId"=${comment.id}
        ;`;
        await this.dataSource.query(queryString);
        return true;
      }
      console.log('insert like');
      const values = `'${userId}', '${likeStatus}', '${Date.now()}', '${
        comment.id
      }'`;
      const queryString = `INSERT INTO likes
        ("userId", "likeStatus", "addedAt", "commentId")
        VALUES (${values});`;
      await this.dataSource.query(queryString);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
