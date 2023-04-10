import { Injectable } from '@nestjs/common';
import { pagesCount } from '../../common/helpers/helpers';
import { BlogViewModel } from '../dto/view-models/blog.view.model';
import { PaginatorViewModel } from '../../common/dto/view-models/paginator.view.model';
import { BlogSaViewModel } from '../dto/view-models/blog-sa-view.model';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { BannedUser, BlogEntity } from '../domain/blog.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogDbDtoSql } from '../types/blog-db-dto.sql';
import { BannedUsersDbDtoSql } from '../types/banned-users-db-dto.sql';
import { BloggerUserViewModel } from '../dto/view-models/blogger.user.view.model';
import { BlogsQueryOptionsType } from '../types/blogs-query-options.type';

@Injectable()
export class BlogsQueryTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource, // @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
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
    const { totalCount, blogsEntities } = await this.find(
      paginatorParams,
      searchNameTerm,
      options,
    );
    const items: BlogViewModel[] = options?.bannedBlogInclude
      ? blogsEntities.map((b) => this.getSaViewModelWithOwner(b))
      : blogsEntities.map((b) => this.getBlogViewModel(b));
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
    const blog = await this.findById(id, options);
    if (!blog || blog.isBanned) return null;
    return this.getBlogViewModel(blog);
  }

  getBlogViewModel(blog: BlogEntity): BlogViewModel {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(blog.createdAt).toISOString(),
      isMembership: blog.isMembership,
    };
  }

  getSaViewModelWithOwner(blog: BlogEntity): BlogSaViewModel | BlogViewModel {
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
    const blog = await this.findById(blogId);
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
    const searchParams = [];
    if (searchLoginTerm)
      searchParams.push(`login ILIKE '%${searchLoginTerm}%'`);
    searchParams.push(`bu."isBanned"=true`);
    searchParams.push(`"blogId"=${blogId}`);
    const searchString = `WHERE ${searchParams.join(' AND ')}`;
    const totalCount = +(
      await this.dataSource.query(`
            SELECT COUNT(*)
            FROM blogs_banned_users
            WHERE "blogId"=${blogId} AND "isBanned"=true
    `)
    )[0].count;

    const queryString = `
                SELECT bu."banReason", bu."banDate", bu."userId", u.login 
                FROM  blogs_banned_users bu
                LEFT JOIN users u ON u.id=bu."userId"
                ${searchString}
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT ${pageSize}    
                OFFSET ${pageSize * (pageNumber - 1)};
                `;
    console.log(totalCount);
    console.log(queryString);
    const bannedUsers: BannedUsersDbDtoSql[] = await this.dataSource.query(
      queryString,
    );

    const items: BloggerUserViewModel[] = bannedUsers.map((u) => ({
      id: u.userId,
      login: u.login,
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
              WHERE "blogId"=${blogId} AND "userId"=${userId});
             `;
    const queryBannedUsersResult = await this.dataSource.query(queryString);
    return queryBannedUsersResult[0].exists;
  }

  async findById(blogId, options?: BlogsQueryOptionsType): Promise<BlogEntity> {
    try {
      const queryString = `SELECT b.*, u.login as "blogOwnerLogin",
                  (SELECT COUNT(*)
                  FROM blogs_banned_users 
                  WHERE "blogId"=b.id 
                    AND "isBanned"=true)  as "countBannedUsers"
               FROM blogs b 
               LEFT JOIN users u ON u.id=b."blogOwnerId"
              WHERE b.id=${blogId};`;
      const queryBlogsResult = await this.dataSource.query(queryString);
      const blogDb: BlogDbDtoSql = queryBlogsResult[0];
      let bannedUsers: BannedUser[] = [];
      if (blogDb.countBannedUsers > 0) {
        bannedUsers = await this.findBannedUsers(blogDb.id);
      }
      return this.castToBlogEntity(blogDb, bannedUsers);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async find(
    paginatorParams: PaginatorInputType,
    searchNameTerm?: string,
    options?: BlogsQueryOptionsType,
  ): Promise<{ totalCount: number; blogsEntities: BlogEntity[] }> {
    try {
      const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
      //Define search parameters
      let searchString = '';
      const searchParams = [];
      if (searchNameTerm)
        searchParams.push(`b.name ILIKE '%${searchNameTerm}%'`);
      if (!options?.bannedBlogInclude) searchParams.push(`b."isBanned"=false`);
      if (options?.blogOwnerId)
        searchParams.push(`b."blogOwnerId"=${options.blogOwnerId}`);
      if (searchParams.length > 0)
        searchString = `WHERE ${searchParams.join(' AND ')}`;

      // Calculation of total count
      const totalCount = +(
        await this.dataSource.query(`
    SELECT COUNT(*)
    FROM blogs b
    ${searchString}
    `)
      )[0].count;
      if (!totalCount) return { totalCount: 0, blogsEntities: [] };
      const queryString = `
      SELECT b.*, u.login as "blogOwnerLogin",
      (SELECT COUNT(*)
                  FROM blogs_banned_users 
                  WHERE "blogId"=b.id 
                    AND "isBanned"=true)  as "countBannedUsers"
      FROM "blogs" b
      LEFT JOIN users u ON u.id=b."blogOwnerId"
      ${searchString}
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${pageSize}
      OFFSET ${pageSize * (pageNumber - 1)};`;

      //Get blogs from DB
      const blogs: BlogDbDtoSql[] = await this.dataSource.query(queryString);
      //Convert blogs to BlogEntity type
      const blogsEntities: BlogEntity[] = [];
      for (const blog of blogs) {
        let bannedUsers: BannedUser[] = [];
        if (blog.countBannedUsers > 0)
          bannedUsers = await this.findBannedUsers(blog.id);
        const blogEntity: BlogEntity = await this.castToBlogEntity(
          blog,
          bannedUsers,
        );
        blogsEntities.push(blogEntity);
      }
      return { totalCount: totalCount, blogsEntities };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findBannedUsers(blogId: string): Promise<BannedUser[]> {
    const bannedUsers: BannedUsersDbDtoSql[] = await this.dataSource.query(
      `SELECT bu."banReason", bu."banDate", bu."userId", u.login 
                FROM  blogs_banned_users bu
                LEFT JOIN users u ON u.id=bu."userId"
                WHERE bu."blogId"=${blogId} AND bu."isBanned"=true`,
    );
    return bannedUsers.map((u) => ({
      id: u.userId,
      login: u.login,
      banReason: u.login,
      banDate: +u.banDate,
    }));
  }

  castToBlogEntity(blogDb: BlogDbDtoSql, bannedUsers: BannedUser[]) {
    const blogEntity: BlogEntity = new BlogEntity();
    blogEntity.setDbData(blogDb, bannedUsers);
    return blogEntity;
  }
}
