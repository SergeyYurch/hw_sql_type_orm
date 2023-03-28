import { Injectable } from '@nestjs/common';
import { BlogEntity, blogSchemaDb } from '../domain/blog.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsQuerySqlRepository } from './blogs.query.sql.repository';
import { ERR_SAVE_TO_DB } from '../constants/blogs.constant';
import { changeDetection } from '../../common/helpers/change-detection';

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private blogsQueryRepository: BlogsQuerySqlRepository,
  ) {}

  async getBlogModel(id: string) {
    return this.blogsQueryRepository.findById(id);
  }

  async createBlogModel() {
    return new BlogEntity();
  }

  async deleteBlog(blogId: string) {
    try {
      await this.dataSource.query(`DELETE FROM blogs WHERE id=${blogId}`);
      await this.dataSource.query(
        `DELETE FROM blogs_banned_users WHERE "blogId"=${blogId}`,
      );
      return true;
    } catch (e) {
      console.log(e);
    }
  }

  async save(blog: BlogEntity) {
    try {
      if (!blog.id && blog.blogOwnerId) return this.insertNewBlog(blog);
      if (!blog.id && !blog.blogOwnerId)
        return this.insertNewBlogWithoutOwner(blog);

      const blogDb: BlogEntity = await this.blogsQueryRepository.findById(
        blog.id,
      );

      //detection of changes in blog corresponding to the blogs table
      const changes = changeDetection(blog, blogDb, blogSchemaDb);
      let queryStringChanges = '';
      for (const ch of changes) {
        const setItems = [];
        for (const cf of ch.changedFields) {
          setItems.push(`${cf.field}=${cf.value}`);
        }
        const subQuery = `UPDATE "${ch.table}" SET ${setItems.join(
          ',',
        )} WHERE "id"=${blog.id};`;
        queryStringChanges += subQuery;
      }
      await this.dataSource.query(queryStringChanges);
      //detection of changes in banned users array
      let bannedUserQueryString = '';
      if (blogDb.bannedUsers.length > 0 || blog.bannedUsers.length > 0) {
        const bannedUsersIdInDB = blogDb.bannedUsers.map((u) => u?.id);
        const bannedUsersIdNew = blog.bannedUsers.map((u) => u?.id);
        blogDb.bannedUsers.forEach((bu) => {
          if (!bannedUsersIdNew.includes(bu.id)) {
            bannedUserQueryString += `
                        DELETE FROM "blogs_banned_users" 
                        WHERE "blogId"=${blog.id} AND "userId"=${bu.id};`;
          }
        });
        blog.bannedUsers.forEach((bu) => {
          if (!bannedUsersIdInDB.includes(bu.id)) {
            bannedUserQueryString += `
                        INSERT INTO "blogs_banned_users"("userId", "banReason", "blogId", "isBanned", "banDate")
                        VALUES ('${bu.id}', '${bu.banReason}', '${blog.id}', true, '${bu.banDate}');`;
          }
        });
        console.log(bannedUserQueryString);
        await this.dataSource.query(bannedUserQueryString);
      }
    } catch (e) {
      console.log(e);
      return ERR_SAVE_TO_DB;
    }
    return blog.id;
  }

  private async insertNewBlog(blog: BlogEntity) {
    try {
      const values = `'${blog.name}', '${blog.blogOwnerId}', '${
        blog.description
      }', '${blog.websiteUrl}', '${Date.now()}', '${blog.isMembership}'`;
      const queryString = `INSERT
            INTO blogs ("name", "blogOwnerId", "description", "websiteUrl", "createdAt", "isMembership")
            VALUES (${values}) RETURNING id`;
      const result = await this.dataSource.query(queryString);
      return result[0].id;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async insertNewBlogWithoutOwner(blog: BlogEntity) {
    try {
      const values = `'${blog.name}', '${blog.description}', '${
        blog.websiteUrl
      }', '${Date.now()}', '${blog.isMembership}'`;
      const queryString = `INSERT
            INTO blogs ("name", "description", "websiteUrl", "createdAt", "isMembership")
            VALUES (${values}) RETURNING id`;
      const result = await this.dataSource.query(queryString);
      return result[0].id;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
