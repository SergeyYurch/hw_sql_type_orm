import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostsQuerySqlRepository } from './posts.query.sql.repository';
import { changeDetection } from '../../common/helpers/helpers';
import { LikesQuerySqlRepository } from '../../common/providers/likes.query.sql.repository';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogEntity } from '../../blogs/entities/blog.entity';
import { PostEntity } from '../entities/post.entity';
import { PostsQueryTypeOrmRepository } from './posts.query.type-orm.repository';

@Injectable()
export class PostsTypeOrmRepository {
  constructor(
    private likesQuerySqlRepository: LikesQuerySqlRepository,
    private postsQueryTypeOrmRepository: PostsQueryTypeOrmRepository,
    @InjectDataSource() protected dataSource: DataSource,
    private postQueryRepository: PostsQuerySqlRepository,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
  ) {}

  async createModel() {
    return new Post();
  }
  async delete(postId: number) {
    try {
      await this.postsRepository
        .createQueryBuilder('p')
        .delete()
        .from(PostEntity)
        .where('id = :id', { id: postId })
        .execute();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  // async getPostModelById(postId: string, userId?: string) {
  //   return this.postQueryRepository.getPostModel(postId, userId);
  // }

  async save(post: Post) {
    try {
      let postEntity: PostEntity = new PostEntity();
      if (post.id) {
        postEntity = await this.postsQueryTypeOrmRepository.findById(+post.id);
      }
      postEntity.title = post.title;
      postEntity.shortDescription = post.shortDescription;
      postEntity.content = post.content;
      postEntity.isBanned = post.isBanned;
      postEntity.createdAt = post.createdAt;
      postEntity.bloggerId = +post.bloggerId;
      postEntity.blogId = +post.blogId;
      return this.postsRepository.save(postEntity);
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
