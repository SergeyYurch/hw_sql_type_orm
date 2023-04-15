import { Injectable } from '@nestjs/common';
import { pagesCount } from '../../common/helpers/helpers';
import { BlogViewModel } from '../dto/view-models/blog.view.model';
import { PaginatorViewModel } from '../../common/dto/view-models/paginator.view.model';
import { BlogSaViewModel } from '../dto/view-models/blog-sa-view.model';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { Blog } from '../domain/blog';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { BloggerUserViewModel } from '../dto/view-models/blogger.user.view.model';
import { BlogsQueryOptionsType } from '../types/blogs-query-options.type';
import { BlogEntity } from '../entities/blog.entity';
import { BlogsBannedUserEntity } from '../entities/blogs-banned-user.entity';

@Injectable()
export class BlogsQueryTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource, // @InjectModel(BlogEntity.name) private BlogModel: Model<BlogDocument>,
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    @InjectRepository(BlogsBannedUserEntity)
    private readonly blogsBannedUsersRepository: Repository<BlogsBannedUserEntity>,
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

  async findBlogs(
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
      ? blogModels.map((b) => this.getSaViewModelWithOwner(b))
      : blogModels.map((b) => this.getBlogViewModel(b));
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async getBlogById(
    id: string,
    options?: BlogsQueryOptionsType,
  ): Promise<BlogViewModel | null> {
    const blog = await this.getBlogModelById(id, options);
    if (!blog) return null;
    return this.getBlogViewModel(blog);
  }

  getBlogViewModel(blog: Blog): BlogViewModel {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(blog.createdAt).toISOString(),
      isMembership: blog.isMembership,
    };
  }

  getSaViewModelWithOwner(blog: Blog): BlogSaViewModel | BlogViewModel {
    const blogView = this.getBlogViewModel(blog);
    const banInfo = {
      isBanned: blog.isBanned,
      banDate: blog.banDate ? new Date(blog.banDate).toISOString() : null,
    };
    const blogOwnerInfo = {
      userId: blog.blogOwnerId,
      userLogin: blog.blogOwnerLogin,
    };
    return { ...blogView, blogOwnerInfo, banInfo };
  }

  async getBlogOwner(blogId: string) {
    const blog = await this.getBlogModelById(blogId);
    return blog?.blogOwnerId
      ? {
          userId: blog.blogOwnerId,
          userLogin: blog.blogOwnerLogin,
        }
      : null;
  }

  async getBannedUsers(
    blogId: string,
    paginatorParams?: PaginatorInputType,
    searchLoginTerm?: string,
  ): Promise<PaginatorViewModel<BloggerUserViewModel>> {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    const conditions = [];
    if (searchLoginTerm) {
      conditions.push({ ['login']: searchLoginTerm });
    }
    conditions.push({ ['blogId']: blogId });
    const findOptions: FindManyOptions<BlogsBannedUserEntity> = {
      relations: {
        user: true,
      },
      order: { [sortBy]: sortDirection },
      where: conditions,
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    };
    const [bannedUsers, totalCount] =
      await this.blogsBannedUsersRepository.findAndCount(findOptions);

    const items: BloggerUserViewModel[] = bannedUsers.map((u) => ({
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

  async findBlogEntityById(id: number, options?: BlogsQueryOptionsType) {
    const findOptionsWhere: FindOptionsWhere<BlogEntity> = {
      isBanned: false,
      id,
    };
    if (options?.bannedBlogInclude) delete findOptionsWhere.isBanned;
    return await this.blogsRepository.findOne({
      relations: {
        blogOwner: true,
        bannedUsers: {
          user: true,
        },
      },
      where: findOptionsWhere,
      select: {
        blogOwner: { id: true },
        bannedUsers: true,
      },
    });
  }

  async getBlogModelById(
    blogId,
    options?: BlogsQueryOptionsType,
  ): Promise<Blog | null> {
    try {
      const blogEntity = await this.findBlogEntityById(+blogId, options);
      console.log(blogEntity);
      console.log(typeof blogEntity.createdAt);
      return this.castToBlogModel(blogEntity);
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
      console.log(findOptionsWhere);
      const findOptions: FindManyOptions<BlogEntity> = {
        relations: {
          blogOwner: true,
          bannedUsers: { user: true },
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

      const [blogs, totalCount] = await this.blogsRepository.findAndCount(
        findOptions,
      );
      const blogModels: Blog[] = [];
      for (const blog of blogs) {
        blogModels.push(this.castToBlogModel(blog));
      }
      return { totalCount: totalCount, blogModels };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  castToBlogModel(blogEntity: BlogEntity) {
    const blogModel: Blog = new Blog();
    blogModel.id = String(blogEntity.id);
    blogModel.name = blogEntity.name;
    blogModel.blogOwnerId = String(blogEntity.blogOwner.id);
    blogModel.blogOwnerLogin = blogEntity.blogOwner.login;
    blogModel.description = blogEntity.description;
    blogModel.websiteUrl = blogEntity.websiteUrl;
    blogModel.createdAt = +blogEntity.createdAt;
    blogModel.isMembership = blogEntity.isMembership;
    blogModel.isBanned = blogEntity.isBanned;
    blogModel.banDate = +blogEntity.banDate;
    if (blogEntity.bannedUsers) {
      blogModel.bannedUsers = blogEntity.bannedUsers.map((bu) => ({
        id: String(bu.userId),
        banDate: bu.banDate,
        banReason: bu.banReason,
        login: bu.user.login,
      }));
    } else {
      blogModel.bannedUsers = [];
    }
    return blogModel;
  }

  async test(blogId: string) {
    const blogEntity: BlogEntity = new BlogEntity();
    blogEntity.name = 'blog.name';
    blogEntity.description = 'blog.description';
    blogEntity.websiteUrl = 'blog.websiteUrl';
    blogEntity.createdAt = 4444444444444;
    blogEntity.isMembership = false;
    blogEntity.isBanned = false;
    blogEntity.banDate = 2222222222222222;

    const result = await this.blogsRepository.save(blogEntity);
    console.log(result);
    return result;
  }
}
