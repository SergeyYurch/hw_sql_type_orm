import { Injectable } from '@nestjs/common';
import { PaginatorViewModel } from '../../common/dto/view-models/paginator.view.model';
import { pagesCount } from '../../common/helpers/helpers';
import { PostViewModel } from '../dto/view-models/post.view.model';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { Post } from '../domain/post';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostSqlDataType } from '../types/postSqlData.type';
import { LikesQuerySqlRepository } from '../../common/providers/likes.query.sql.repository';
import { PostEntity } from '../entities/post.entity';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { BlogsQueryTypeOrmRepository } from '../../blogs/providers/blogs.query.type-orm.repository';

@Injectable()
export class PostsQueryTypeOrmRepository {
  constructor(
    private usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private blogsQueryTypeOrmRepository: BlogsQueryTypeOrmRepository,
    @InjectDataSource() protected dataSource: DataSource,
    protected likesQuerySqlRepository: LikesQuerySqlRepository,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
  ) {}

  async doesPostIdExist(
    postId: string,
    options?: { bannedInclude: boolean },
  ): Promise<boolean> {
    try {
      let queryString = `SELECT EXISTS (SELECT * FROM posts p
                        LEFT JOIN blogs b ON  p."blogId"=b.id
                        WHERE p.id=${postId} AND b."isBanned"=false);`;
      if (options?.bannedInclude)
        queryString = `SELECT EXISTS (SELECT id FROM posts WHERE id=${postId});`;
      const result = await this.dataSource.query(queryString);
      return result[0].exists;
    } catch (e) {
      console.log(e);
      throw new Error('Database query error');
    }
  }

  async getPosts(
    paginatorParams: PaginatorInputType,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatorViewModel<PostViewModel>> {
    const { pageSize, pageNumber } = paginatorParams;
    const posts = await this.find(paginatorParams, blogId, userId);
    if (!posts)
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize,
        totalCount: 0,
        items: [],
      };
    const { postEntities, totalCount } = posts;
    const items: PostViewModel[] = [];
    for (const post of postEntities) {
      items.push(this.castToPostViewModel(post));
    }

    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    const post = await this.findById(postId, userId);
    if (!post) return null;
    // return this.castToPostViewModel(post);
  }

  async getPostsBloggerId(postId: string, userId?: string): Promise<string> {
    const postInDb = await this.findById(postId, userId);
    return postInDb.id.toString();
  }

  async getPostModelById(id: string, userId?: string) {
    const postEntity = await this.findById(id, userId);
    return this.castToPostModel(postEntity);
  }

  async findById(postId, userId = '0'): Promise<PostEntity> {
    try {
      return await this.postsRepository.findOne({
        relations: {
          blogger: true,
          blog: true,
        },
        where: { id: +postId },
        select: {},
      });
      //
      //   const queryPostResult = await this.dataSource.query(
      //     `
      // SELECT p.*, b.name as "blogName", l."likeStatus" as "myStatus",
      //  ( SELECT count(*)
      //    FROM likes l
      //    LEFT JOIN users u ON u.id = l."userId"
      //    WHERE l."postId"=p.id AND l."likeStatus"='Like' AND u."isBanned"=false) as "likesCount",
      //  (SELECT count(*)
      //    FROM likes l
      //    LEFT JOIN users u ON u.id = l."userId"
      //    WHERE l."postId"=p.id AND l."likeStatus"='Dislike' AND u."isBanned"=false) as "dislikesCount"
      //  FROM posts p
      //  LEFT JOIN blogs b ON p."blogId"=b.id
      //  LEFT JOIN likes l ON  (l."postId"=p.id AND l."userId"= ${userId})
      //  WHERE p.id=${postId} AND b."isBanned"=false
      //  ;`,
      //   );
      //   const post: PostSqlDataType = queryPostResult[0];
      // if (!post) return null;
      // return this.castToPostEntity(post, userId);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async find(
    paginatorParams: PaginatorInputType,
    blogId?: string,
    userId = '0',
  ): Promise<{ totalCount: number; postEntities: Post[] }> {
    try {
      const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
      // Calculation of total count
      let condition = ' b."isBanned"=false';
      if (blogId) condition += ` AND b.id=${blogId}`;
      const totalCount = +(
        await this.dataSource.query(`
                SELECT COUNT(*)
                FROM posts p
                LEFT JOIN blogs b ON p."blogId" = b.id 
                WHERE ${condition}
                `)
      )[0].count;
      if (!totalCount) return { totalCount: 0, postEntities: [] };
      //Get blogs from DB
      const queryString = `
      SELECT p.*, b.name as "blogName", l."likeStatus" as "myStatus",
     ( SELECT count(*) 
       FROM likes l
       LEFT JOIN users u ON u.id = l."userId" 
       WHERE l."postId"=p.id AND l."likeStatus"='Like' AND u."isBanned"=false) as "likesCount",
     (SELECT count(*) 
       FROM likes l
       LEFT JOIN users u ON u.id = l."userId" 
       WHERE l."postId"=p.id AND l."likeStatus"='Dislike' AND u."isBanned"=false) as "dislikesCount"
      FROM posts p
      LEFT JOIN blogs b ON p."blogId"=b.id 
      LEFT JOIN likes l ON  (l."postId"=p.id AND l."userId"= ${userId})
      WHERE ${condition}
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${pageSize}
      OFFSET ${pageSize * (pageNumber - 1)};`;
      const posts: PostSqlDataType[] = await this.dataSource.query(queryString);
      if (posts.length === 0) return { totalCount: 0, postEntities: [] };
      //Convert blogs to BlogEntity type
      const postEntities: Post[] = [];
      for (const post of posts) {
        const postEntity: Post = await this.castToPostModel(
          new PostEntity(),
          userId,
        );
        postEntities.push(postEntity);
      }
      return { totalCount: totalCount, postEntities };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // private async findLike(postId, userId): Promise<LikeType | null> {
  //   try {
  //     const likeQueryResult: LikeSqlDataType[] = await this.dataSource.query(
  //       `SELECT l.*, u.login
  //              FROM likes l
  //              LEFT JOIN users u ON l."userId"=u.id
  //              WHERE l."postId"=${postId} AND l."userId"=${userId} AND u."isBanned"=false;`,
  //     );
  //     const likeDb = likeQueryResult[0];
  //     if (!likeDb) return null;
  //     return {
  //       userId,
  //       login: likeDb.login,
  //       likeStatus: likeDb.likeStatus,
  //       addedAt: likeDb.addedAt,
  //     };
  //   } catch (e) {
  //     console.log(e);
  //     return null;
  //   }
  // }
  //
  // private async getLikesCount(postId: string): Promise<LikesCountsType> {
  //   try {
  //     const likesCountQueryResult = await this.dataSource.query(
  //       `SELECT count(*)
  //              FROM likes l
  //              LEFT JOIN users u ON l."userId"=u.id
  //              WHERE l."postId"=${postId} AND l."likeStatus"='Like' AND u."isBanned"=false;`,
  //     );
  //     const dislikesCountQueryResult = await this.dataSource.query(
  //       `SELECT count(*)
  //              FROM likes l
  //              LEFT JOIN users u ON l."userId"=u.id
  //              WHERE l."postId"=${postId} AND l."likeStatus"='Dislike' AND u."isBanned"=false;`,
  //     );
  //     const likesCount = likesCountQueryResult[0].count || 0;
  //     const dislikesCount = dislikesCountQueryResult[0].count || 0;
  //     return { likesCount, dislikesCount };
  //   } catch (e) {
  //     console.log(e);
  //     return { likesCount: 0, dislikesCount: 0 };
  //   }
  // }
  //
  // private async findNewestLikes(postId: string) {
  //   try {
  //     return await this.dataSource.query(
  //       `SELECT l."addedAt", u.id as "userId", u.login
  //              FROM likes l
  //              LEFT JOIN users u ON l."userId"=u.id
  //              WHERE l."postId"=${postId} AND l."likeStatus"='Like' AND u."isBanned"=false
  //              ORDER BY l."addedAt" DESC
  //              LIMIT 3
  //              `,
  //     );
  //   } catch (e) {
  //     console.log(e);
  //     return [];
  //   }
  // }

  private async castToPostModel(
    postEntity: PostEntity,
    userId?: string,
  ): Promise<Post> {
    const postModel = new Post();
    postModel.id = postEntity.id.toString();
    postModel.title = postEntity.title;
    postModel.shortDescription = postEntity.shortDescription;
    postModel.content = postEntity.content;
    postModel.blogger = this.usersQueryTypeormRepository.castToUserModel(
      postEntity.blogger,
    );
    postModel.blog = this.blogsQueryTypeOrmRepository.castToBlogModel(
      postEntity.blog,
    );
    postModel.createdAt = +postEntity.createdAt;
    return postModel;
  }

  private castToPostViewModel(post: Post): PostViewModel {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blog.id,
      blogName: post.blog.name,
      createdAt: new Date(post.createdAt).toISOString(),
      extendedLikesInfo: {
        likesCount: post.likes.likesCount,
        dislikesCount: post.likes.dislikesCount,
        myStatus: post.likes.myStatus || 'None',
        newestLikes: post.newestLikes,
      },
    };
  }
}
