import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { changeDetection } from '../../common/helpers/helpers';
import { LikesQuerySqlRepository } from '../../common/providers/likes.query.sql.repository';
import { PostsQueryTypeOrmRepository } from './posts.query.type-orm.repository';

@Injectable()
export class PostsSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private postQueryRepository: PostsQueryTypeOrmRepository,
    private likesQuerySqlRepository: LikesQuerySqlRepository,
  ) {}

  async createModel() {
    return new Post();
  }
  async delete(postId: string) {
    try {
      await this.dataSource.query(`DELETE FROM posts WHERE id=${postId}`);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async getPostModelById(postId: string, userId?: string) {
    return this.postQueryRepository.getPostModelById(postId, userId);
  }

  async save(post: Post) {
    try {
      if (!post.id) return this.insertNewPost(post);
      //change postData detection
      const postDb = await this.postQueryRepository.getPostModelById(post.id);
      const newData = {
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
      };
      const dbData = {
        title: postDb.title,
        shortDescription: postDb.shortDescription,
        content: postDb.content,
      };
      const changes = changeDetection(newData, dbData);
      let queryString = '';
      if (changes.length > 0) {
        const changeFields = [];
        changes.forEach((c) => {
          changeFields.push(`${c.field}=${c.value}`);
        });
        const subQuery = `UPDATE "posts" SET ${changeFields.join(
          ',',
        )} WHERE "id"=${post.id};`;
        queryString += subQuery;
        await this.dataSource.query(queryString);
      }
      //detect likes changes
      if (post.updatedLike) return await this.updateLike(post);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async insertNewPost(post) {
    const values = `'${post.title}', '${post.shortDescription}', '${post.content}', '${post.bloggerId}', '${post.blogId}', '${post.isBanned}', '${post.createdAt}'`;
    const queryString = `INSERT INTO posts 
        (title, "shortDescription", content, "bloggerId", "blogId", "isBanned", "createdAt") 
        VALUES (${values}) RETURNING id;`;
    const result = await this.dataSource.query(queryString);
    return result[0].id;
  }

  private async updateLike(post: Post) {
    try {
      const { likeStatus, userId } = post.updatedLike;
      const likeInDb = await this.likesQuerySqlRepository.findLike(userId, {
        postId: post.id,
      });
      if (likeInDb) {
        const queryString = `
        UPDATE likes 
        SET "likeStatus"='${likeStatus}'
        WHERE "userId"=${userId} AND "postId"=${post.id}
        `;
        await this.dataSource.query(queryString);
        return true;
      }
      const values = `'${userId}', '${likeStatus}', '${Date.now()}', '${
        post.id
      }'`;
      const queryString = `INSERT INTO likes
        ("userId", "likeStatus", "addedAt", "postId")
        VALUES (${values});`;
      await this.dataSource.query(queryString);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
