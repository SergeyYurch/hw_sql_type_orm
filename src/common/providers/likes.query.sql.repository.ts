import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeTargetIdType } from '../types/like-target-id.type';
import { LikesCountsType } from '../types/likes-counts.type';
import { LikeSqlDataType } from '../../features/posts/types/likeSqlData.type';
import { LikeWithAddedAtType } from '../types/like-with-added-at.type';

@Injectable()
export class LikesQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findLike(
    userId: string,
    likeTargetId: LikeTargetIdType,
  ): Promise<LikeWithAddedAtType | null> {
    try {
      const targetId = this.getLikeTargetIdString(likeTargetId);
      const likeQueryResult: LikeSqlDataType[] = await this.dataSource.query(
        `SELECT l.*, u.login
               FROM likes l
               LEFT JOIN users u ON l."userId"=u.id   
               WHERE ${targetId} AND l."userId"=${userId} AND u."isBanned"=false;`,
      );
      const likeDb = likeQueryResult[0];
      if (!likeDb) return null;
      return {
        userId,
        login: likeDb.login,
        likeStatus: likeDb.likeStatus,
        addedAt: likeDb.addedAt,
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getLikesCount(
    likeTargetId: LikeTargetIdType,
  ): Promise<LikesCountsType> {
    try {
      const targetId = this.getLikeTargetIdString(likeTargetId);
      const likesCountQueryResult = await this.dataSource.query(
        `SELECT count(*)
               FROM likes l
               LEFT JOIN users u ON l."userId"=u.id   
               WHERE ${targetId} AND l."likeStatus"='Like' AND u."isBanned"=false;`,
      );
      const dislikesCountQueryResult = await this.dataSource.query(
        `SELECT count(*)
               FROM likes l
               LEFT JOIN users u ON l."userId"=u.id   
               WHERE ${targetId} AND l."likeStatus"='Dislike' AND u."isBanned"=false;`,
      );
      const likesCount = +likesCountQueryResult[0].count || 0;
      const dislikesCount = +dislikesCountQueryResult[0].count || 0;
      return { likesCount, dislikesCount };
    } catch (e) {
      console.log(e);
      return { likesCount: 0, dislikesCount: 0 };
    }
  }

  async findNewestLikes(likeTargetId: LikeTargetIdType) {
    try {
      const targetId = this.getLikeTargetIdString(likeTargetId);

      return await this.dataSource.query(
        `SELECT l."addedAt", u.id as "userId", u.login
               FROM likes l
               LEFT JOIN users u ON l."userId"=u.id   
               WHERE ${targetId} AND l."likeStatus"='Like' AND u."isBanned"=false
               ORDER BY l."addedAt" DESC
               LIMIT 3
               `,
      );
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  private getLikeTargetIdString(targetId: LikeTargetIdType): string {
    const { postId, commentId } = targetId;
    return postId ? `l."postId"=${postId}` : `l."commentId"=${commentId}`;
  }
}
