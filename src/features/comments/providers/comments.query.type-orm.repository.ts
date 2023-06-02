import { Injectable } from '@nestjs/common';
import { pagesCount } from '../../../common/helpers/helpers';
import { PaginatorInputType } from '../../../common/dto/input-models/paginator.input.type';
import { CommentViewModel } from '../dto/view-models/comment.view.model';
import { GetCommentOptionTypes } from '../types/get-comment-option.types';
import { CommentsSearchParamsType } from '../types/comments-search-params.type';
import { BloggerCommentViewModel } from '../dto/view-models/blogger-comment.view.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import { Comment } from '../domain/comment';
import { LikesQuerySqlRepository } from '../../../common/providers/likes.query.sql.repository';
import { LikeStatusType } from '../../../common/dto/input-models/like.input.model';
import { CommentEntity } from '../entities/comment.entity';
import { User } from '../../users/domain/user';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { PostsQueryTypeOrmRepository } from '../../posts/providers/posts.query.type-orm.repository';
import { Post } from '../../posts/domain/post';
import { LikeEntity } from '../../likes/entities/like.entity';
import { BlogsBannedUserEntity } from '../../blogs/entities/blogs-banned-user.entity';
import { UsersService } from '../../users/providers/users.service';

@Injectable()
export class CommentsQueryTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private likesQuerySqlRepository: LikesQuerySqlRepository,
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
    @InjectRepository(LikeEntity)
    private readonly likesRepository: Repository<LikeEntity>,
    private readonly usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private readonly postsQueryTypeOrmRepository: PostsQueryTypeOrmRepository,
    private readonly usersService: UsersService,
  ) {}

  async isCommentOwner(userId: string, commentId: string): Promise<boolean> {
    const comment = await this.findById(+commentId);
    return comment.commentator.id === +userId;
  }

  async doesCommentIdExist(commentId: string, options?: GetCommentOptionTypes) {
    try {
      //default conditions is: if blog is not banned, if user is not banned,
      //and if user is not banned for current blog
      const conditions = `
          WHERE c.id=${commentId} 
          AND u."isBanned"=false
          AND b."isBanned"=false
           AND NOT EXISTS (SELECT * FROM blogs_banned_users bbu1 WHERE bbu1."blogId"=b.id AND bbu1."userId"=c."commentatorId")
          `;
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
    const commentEntity = await this.findById(+commentId);
    if (!commentEntity) return null;
    let commentModel = await this.castToCommentModel(commentEntity);
    if (options?.userId)
      commentModel = await this.addUsersLikeStatus(
        commentModel,
        +options.userId,
      );
    return this.getCommentViewModel(commentModel);
  }

  async getBloggersComments(
    paginatorParams: PaginatorInputType,
    bloggerId: string,
  ) {
    const { pageSize, pageNumber } = paginatorParams;
    const { commentModels, totalCount } = await this.findComments(
      paginatorParams,
      { bloggerId },
      { bannedBlogInclude: true, likesInclude: false },
    );

    const items = commentModels.map((c) => this.getBloggerCommentViewModel(c));
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
    const { commentModels, totalCount } = await this.findComments(
      paginatorParams,
      { postId },
      { ...options, likesInclude: true },
    );
    const items: CommentViewModel[] = commentModels.map((c) =>
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

  async findById(id: number) {
    console.log(`[findById]`);
    return await this.commentsRepository.findOne({
      relations: {
        post: {
          blogger: true,
          blog: { blogOwner: true, bannedUsers: { user: true } },
        },
        commentator: true,
      },
      where: { id, commentator: { isBanned: false } },
    });
  }

  async findComments(
    paginatorParams: PaginatorInputType,
    searchParams: CommentsSearchParamsType,
    options?: GetCommentOptionTypes,
  ): Promise<{ totalCount: number; commentModels: Comment[] }> {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    const userId = options?.userId;
    const { postId, bloggerId } = searchParams;
    const findOptionsWhere: FindOptionsWhere<CommentEntity> = {
      commentator: { ['isBanned']: false },
    };
    if (postId) findOptionsWhere['postId'] = +postId;
    if (bloggerId) {
      findOptionsWhere.post = {};
      findOptionsWhere.post['bloggerId'] = +bloggerId;
    }
    let queryBuilder = this.commentsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.commentator', 'commentator')
      .leftJoinAndSelect('c.post', 'post')
      .leftJoinAndSelect('post.blogger', 'blogger')
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('blog.blogOwner', 'blogOwner')
      .where('commentator.isBanned = :isBanned', { isBanned: false })
      .andWhere((qb) => {
        if (options?.bannedUserInclude) return;
        return (
          'c."commentatorId" NOT IN' +
          qb
            .subQuery()
            .from(BlogsBannedUserEntity, 'bbu')
            .select('bbu."userId"')
            .where('bbu."blogId"=blog.id')
            .getQuery()
        );
      })
      .limit(pageSize)
      .offset(pageSize * (pageNumber - 1))
      .orderBy(`c.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
    if (postId)
      queryBuilder = queryBuilder.andWhere('post.id = :postId', { postId });
    if (bloggerId)
      queryBuilder = queryBuilder.andWhere('post.bloggerId = :bloggerId', {
        bloggerId,
      });
    const totalCount = await queryBuilder.getCount();
    const commentEntities = await queryBuilder.getMany();
    if (!totalCount || commentEntities.length === 0)
      return { totalCount: 0, commentModels: [] };
    const commentIds = commentEntities.map((c) => c.id);
    let usersLikeStatuses: LikeEntity[];
    if (userId)
      usersLikeStatuses = await this.findUsersLikeStatuses(commentIds, userId);
    const commentModels: Comment[] = [];
    for (const comment of commentEntities) {
      const commentModel = await this.castToCommentModel(comment);
      if (userId) {
        const myStatus = usersLikeStatuses.find(
          (ls) => ls.commentId === +commentModel.id,
        )?.likeStatus;
        if (myStatus) commentModel.likes.myStatus = myStatus as LikeStatusType;
      }
      commentModels.push(commentModel);
    }
    return { totalCount, commentModels };
  }

  getCommentViewModel(comment: Comment): CommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentator.id,
        userLogin: comment.commentator.accountData.login,
      },
      createdAt: new Date(+comment.createdAt).toISOString(),
      likesInfo: comment.likes,
    };
  }

  getBloggerCommentViewModel(comment: Comment): BloggerCommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentator.id,
        userLogin: comment.commentator.accountData.login,
      },
      createdAt: new Date(+comment.createdAt).toISOString(),
      postInfo: {
        id: comment.post.id,
        title: comment.post.title,
        blogId: comment.post.blog.id,
        blogName: comment.post.blog.name,
      },
      likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
    };
  }

  castToCommentModel(commentEntity: CommentEntity): Comment {
    const commentator: User = this.usersService.mapToUserDomainModel(
      commentEntity.commentator,
    );
    const post: Post = this.postsQueryTypeOrmRepository.castToPostModel(
      commentEntity.post,
    );
    const commentModel: Comment = new Comment(
      commentator,
      post,
      commentEntity.content,
    );
    commentModel.id = commentEntity.id.toString();
    commentModel.createdAt = +commentEntity.createdAt;
    commentModel.updatedAt = +commentEntity.updatedAt;
    commentModel.likes = {
      likesCount: +commentEntity.likesCount,
      dislikesCount: +commentEntity.dislikesCount,
      myStatus: 'None',
    };
    return commentModel;
  }

  async getCommentModelById(commentId: string) {
    const commentEntity = await this.findById(+commentId);
    return this.castToCommentModel(commentEntity);
  }

  private async addUsersLikeStatus(commentModel: Comment, userId: number) {
    const userLike = await this.likesRepository.findOne({
      where: { commentId: +commentModel.id, userId: +userId },
      select: { likeStatus: true },
    });
    if (userLike?.likeStatus)
      commentModel.likes.myStatus = userLike.likeStatus as LikeStatusType;
    return commentModel;
  }

  private async findUsersLikeStatuses(commentIds: number[], userId: string) {
    return await this.likesRepository.find({
      relations: { user: true },
      select: {
        id: true,
        userId: true,
        likeStatus: true,
        commentId: true,
        user: { id: false },
      },
      where: {
        commentId: In(commentIds),
        user: { isBanned: false },
        userId: +userId,
      },
    });
  }
}
