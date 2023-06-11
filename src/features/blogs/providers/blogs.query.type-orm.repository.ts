import { Injectable } from '@nestjs/common';
import { pagesCount } from '../../../common/helpers/helpers';
import { BlogViewModel } from '../dto/view-models/blog.view.model';
import { PaginatorViewModel } from '../../../common/dto/view-models/paginator.view.model';
import { PaginatorInputType } from '../../../common/dto/input-models/paginator.input.type';
import { Blog } from '../domain/blog';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { BloggerUserViewModel } from '../dto/view-models/blogger.user.view.model';
import { BlogsQueryOptionsType } from '../types/blogs-query-options.type';
import { BlogEntity } from '../entities/blog.entity';
import { BlogsBannedUserEntity } from '../entities/blogs-banned-user.entity';
import { ImageService } from '../../image/providers/image.service';
import { BlogImagesViewModel } from '../dto/view-models/blog-images.view.model';
import { BlogService } from './blog.service';
import { SubscriptionEntity } from '../entities/subscription.entity';

@Injectable()
export class BlogsQueryTypeOrmRepository {
  constructor(
    private readonly imageService: ImageService,
    private readonly blogService: BlogService,
    @InjectDataSource() protected dataSource: DataSource, // @InjectModel(BlogEntity.name) private BlogModel: Model<BlogDocument>,
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    @InjectRepository(BlogsBannedUserEntity)
    private readonly blogsBannedUsersRepository: Repository<BlogsBannedUserEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
  ) {}

  async doesBlogIdExist(
    blogId: string,
    options?: BlogsQueryOptionsType,
  ): Promise<boolean> {
    try {
      const conditions = `WHERE b.id=${blogId} AND  b."isBanned"=false AND u."isBanned"=false`;
      if (options?.bannedBlogInclude)
        conditions.replace('AND  b."isBanned"=false ', '');
      if (options?.bannedBlogOwnerInclude)
        conditions.replace('AND u."isBanned"=false', '');
      let queryString = `
              SELECT EXISTS (SELECT * 
              FROM blogs b
              LEFT JOIN users u ON u.id=b."blogOwnerId"
              ${conditions});
             `;
      if (options?.foSaChecking)
        queryString = `
              SELECT EXISTS (SELECT * 
              FROM blogs b
              WHERE b.id=${blogId});
             `;
      const queryBlogsResult = await this.dataSource.query(queryString);
      return queryBlogsResult[0].exists;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getBlogs(
    paginatorParams,
    searchNameTerm,
    options?: BlogsQueryOptionsType,
  ): Promise<PaginatorViewModel<BlogViewModel>> {
    const { pageSize, pageNumber } = paginatorParams;
    const { totalCount, blogModels } = await this.find(
      paginatorParams,
      searchNameTerm,
      options,
    );
    const items: BlogViewModel[] = options?.bannedBlogInclude
      ? blogModels.map((b) => this.blogService.mapToSaBlogViewModelWithOwner(b))
      : blogModels.map((b) =>
          this.blogService.mapToBlogViewModel(b, options?.currentUserId),
        );
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async getBlogById(
    blogId: string,
    userId?: string,
    options?: BlogsQueryOptionsType,
  ): Promise<BlogViewModel | null> {
    const blog = await this.getBlogDomainModelById(blogId, userId, options);
    if (!blog) return null;
    return this.blogService.mapToBlogViewModel(blog, userId);
  }

  async getBlogOwner(blogId: string) {
    console.log('getBlogOwner start');
    const blog = await this.blogsRepository.findOne({
      relations: {
        blogOwner: true,
      },
      where: { id: +blogId },
      select: {
        blogOwner: { id: true, login: true },
      },
    });
    console.log(blog);
    if (!blog) return null;
    return {
      userId: blog.blogOwner.id,
      userLogin: blog.blogOwner.login,
    };
  }

  async getBannedUsers(
    blogId: string,
    paginatorParams?: PaginatorInputType,
    searchLoginTerm?: string,
  ): Promise<PaginatorViewModel<BloggerUserViewModel>> {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    let findOptionsOrder: FindOptionsOrder<BlogsBannedUserEntity>;
    if (sortBy === 'login') {
      findOptionsOrder = { user: { login: sortDirection } };
    } else {
      findOptionsOrder = { [sortBy]: sortDirection };
    }
    const conditions: FindOptionsWhere<BlogsBannedUserEntity> = {
      ['blogId']: +blogId,
    };
    if (searchLoginTerm) {
      conditions.user = { ['login']: ILike(`%${searchLoginTerm}%`) };
    }
    const findOptions: FindManyOptions<BlogsBannedUserEntity> = {
      relations: {
        user: true,
      },
      order: findOptionsOrder,
      where: conditions,
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    };
    const [bannedUsers, totalCount] =
      await this.blogsBannedUsersRepository.findAndCount(findOptions);
    let items: BloggerUserViewModel[] = [];
    if (bannedUsers.length > 0)
      items = bannedUsers.map((u) => ({
        id: u.user.id.toString(),
        login: u.user.login,
        banInfo: {
          isBanned: true,
          banReason: u.banReason,
          banDate: new Date(+u.banDate).toISOString(),
        },
      }));
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async isUserBanned(userId: string, blogId: string) {
    const queryString = `
              SELECT EXISTS (SELECT * 
              FROM blogs_banned_users
              WHERE "blogId"=${+blogId} AND "userId"=${+userId});
             `;
    const queryBannedUsersResult = await this.dataSource.query(queryString);
    return queryBannedUsersResult[0].exists;
  }

  async findBlogEntityById(
    id: number,
    userId?: string,
    options?: BlogsQueryOptionsType,
  ): Promise<BlogEntity> {
    const findOptionsWhere: FindOptionsWhere<BlogEntity> = {
      id,
    };
    if (options?.bannedBlogInclude) delete findOptionsWhere.isBanned;
    const result = await this.blogsRepository.findOne({
      relations: {
        blogOwner: true,
        icon: true,
        wallpaper: true,
        bannedUsers: {
          user: true,
        },
        subscriptions: { user: true },
      },
      where: findOptionsWhere,
      select: {
        blogOwner: { id: true },
        bannedUsers: true,
      },
    });
    console.log(result);
    return result;
    // const whereConditions = `blog.id = ${id} AND blog.isBanned=false`;
    // if (options?.bannedBlogInclude)
    //   whereConditions.replace('AND blog.isBanned=false', '');
    // const qb = this.blogsRepository.createQueryBuilder('blog');
    // const query = await qb
    //   .leftJoinAndSelect('blog.blogOwner', 'blogOwner')
    //   .leftJoinAndSelect('blog.icon', 'icon')
    //   .leftJoinAndSelect('blog.wallpaper', 'wallpaper')
    //   .leftJoinAndSelect('blog.bannedUsers', 'bannedUsers')
    //   .leftJoinAndSelect('bannedUsers.user', 'user')
    //   .where(whereConditions)
    //   .select('*')
    //   .addSelect((subQuery) => {
    //     return subQuery
    //       .select('COUNT(*)')
    //       .from(SubscriptionEntity, 'subscriptions')
    //       .where(`subscriptions.blogId=blog.id`);
    //   }, 'subscribersCount')
    //   .addSelect((subQuery) => {
    //     return subQuery
    //       .select('status')
    //       .from(SubscriptionEntity, 'subscriptions')
    //       .where(
    //         `subscriptions.userId=${
    //           userId || 0
    //         } AND subscriptions.blogId=blog.id`,
    //       );
    //   }, 'currentUserSubscriptionStatus');
    // const result = await query.getRawOne();
    // console.log(result);
    // return result;
  }

  async getBlogDomainModelById(
    blogId,
    userId?,
    options?: BlogsQueryOptionsType,
  ): Promise<Blog | null> {
    try {
      const blogEntity = await this.findBlogEntityById(
        +blogId,
        userId,
        options,
      );
      if (!blogEntity) return null;
      return this.blogService.mapToBlogDomainModel(blogEntity);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async find(
    paginatorParams: PaginatorInputType,
    searchNameTerm?: string,
    options?: BlogsQueryOptionsType,
  ): Promise<{ totalCount: number; blogModels: Blog[] }> {
    try {
      const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
      const findOptionsWhere: FindOptionsWhere<BlogEntity> = {
        ['isBanned']: false,
      };

      if (options?.bannedBlogInclude) {
        delete findOptionsWhere['isBanned'];
      }
      if (searchNameTerm) {
        findOptionsWhere['name'] = ILike(`%${searchNameTerm}%`);
      }
      if (options?.blogOwnerId) {
        findOptionsWhere.blogOwner = { ['id']: +options.blogOwnerId };
      }
      const findOptions: FindManyOptions<BlogEntity> = {
        relations: {
          blogOwner: true,
          bannedUsers: { user: true },
          icon: true,
          wallpaper: true,
          subscriptions: { user: true },
        },
        select: {
          blogOwner: { id: true, login: true },
          bannedUsers: true,
        },
        order: { [sortBy]: sortDirection },
        where: findOptionsWhere,
        skip: pageSize * (pageNumber - 1),
        take: pageSize,
      };

      // const query = this.blogsRepository
      //   .createQueryBuilder('b')
      //   .leftJoinAndSelect('b.blogOwner', 'bo')
      //   .leftJoinAndSelect('b.bannedUsers', 'bu')
      //   .leftJoinAndSelect('bu.user', 'u')
      //   .where('b.isBanned=:value', { value: false })
      //   .select('b')
      //   .addSelect('u.id')
      //   .addSelect('u.login')
      //   .orderBy(':sortField', sortDirection.toUpperCase() as 'ASC' | 'DESC')
      //   .limit(pageSize)
      //   .offset(pageSize * (pageNumber - 1))
      //   .setParameter('sortField', `'b.${sortBy}'`);

      const [blogs, totalCount] = await this.blogsRepository.findAndCount(
        findOptions,
      );
      // const [blogs, totalCount] = await Promise.all([
      //   query.getRawMany(),
      //   query.getCount(),
      // ]);
      const blogModels: Blog[] = [];
      for (const blog of blogs) {
        blogModels.push(this.blogService.mapToBlogDomainModel(blog));
      }
      return { totalCount: totalCount, blogModels };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getBlogImages(blogId: string): Promise<BlogImagesViewModel> {
    const blog = await this.getBlogDomainModelById(blogId);
    return {
      wallpaper: this.blogService.mapToPhotoSizeViewModel(blog.wallpaper),
      main: blog.icon
        ? [this.blogService.mapToPhotoSizeViewModel(blog.icon)]
        : [],
    };
  }
}
