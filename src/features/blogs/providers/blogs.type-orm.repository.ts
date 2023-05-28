import { Injectable } from '@nestjs/common';
import { Blog } from '../domain/blog';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ERR_SAVE_TO_DB } from '../constants/blogs.constant';
import { BlogsQueryTypeOrmRepository } from './blogs.query.type-orm.repository';
import { BlogEntity } from '../entities/blog.entity';
import { BlogsBannedUserEntity } from '../entities/blogs-banned-user.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { PostEntity } from '../../posts/entities/post.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';
import { CommentsTypeOrmRepository } from '../../comments/providers/comments.type-orm.repository';
import { BloggerImage } from '../../image/domain/blogger-image';
import { BloggerImageEntity } from '../../image/entities/blogger-image.entity';
import { ImageService } from '../../image/providers/image.service';

@Injectable()
export class BlogsTypeOrmRepository {
  constructor(
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
    private usersQueryRepository: UsersQueryTypeormRepository,
    private commentsTypeOrmRepository: CommentsTypeOrmRepository,
    private imageService: ImageService,
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    @InjectRepository(BlogsBannedUserEntity)
    private readonly blogsBannedUsersRepository: Repository<BlogsBannedUserEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
    @InjectRepository(BloggerImageEntity)
    private readonly bloggerImageRepository: Repository<BloggerImageEntity>,
  ) {}

  // async getBlogModel(id: string) {
  //   return this.blogsQueryRepository.getBlogModelById(id);
  // }

  async createBlogModel() {
    return new Blog();
  }

  async deleteBlog(blogId: string) {
    try {
      await this.commentsTypeOrmRepository.deleteComments({ blogId });
      await this.postsRepository.delete({ blogId: +blogId });
      await this.blogsRepository
        .createQueryBuilder()
        .delete()
        .from(BlogEntity)
        .where('id = :id', { id: blogId })
        .execute();

      await this.blogsBannedUsersRepository
        .createQueryBuilder()
        .delete()
        .from(BlogsBannedUserEntity)
        .where('blogId = :blogId', { blogId })
        .execute();
      return true;
    } catch (e) {
      console.log(e);
    }
  }

  async save(blog: Blog) {
    try {
      let blogEntity = new BlogEntity();
      if (blog.id) {
        blogEntity = await this.blogsQueryRepository.findBlogEntityById(
          +blog.id,
        );
      }
      const wallpaperEntity = blogEntity.wallpaper ?? new BloggerImageEntity();
      const iconEntity = blogEntity.icon ?? new BloggerImageEntity();
      if (blog.wallpaper) {
        this.imageService.castBloggerImageParamsToEntity(
          blog.wallpaper,
          wallpaperEntity,
        );
        blogEntity.wallpaper = await this.bloggerImageRepository.save(
          wallpaperEntity,
        );
      }
      if (blog.icon) {
        this.imageService.castBloggerImageParamsToEntity(blog.icon, iconEntity);
        blogEntity.icon = await this.bloggerImageRepository.save(iconEntity);
      }
      blogEntity.name = blog.name;
      blogEntity.description = blog.description;
      blogEntity.websiteUrl = blog.websiteUrl;
      blogEntity.createdAt = blog.createdAt;
      blogEntity.isMembership = blog.isMembership;
      blogEntity.isBanned = blog.isBanned;
      blogEntity.banDate = blog.banDate;
      blogEntity.blogOwner = await this.usersQueryRepository.getUserEntityById(
        +blog.blogOwnerId,
      );
      await this.blogsRepository.save(blogEntity);
      let actualBannedUsersList = [];
      if (blog.bannedUsers?.length > 0) {
        actualBannedUsersList = blog.bannedUsers.map((b) => +b.id);
      }
      let bannedUserInDb = [];
      if (blogEntity.bannedUsers?.length > 0) {
        bannedUserInDb = blogEntity.bannedUsers.map((b) => b.user.id);
        blogEntity.bannedUsers.map(async (bu) => {
          if (!actualBannedUsersList.includes(bu.userId)) {
            await this.blogsBannedUsersRepository
              .createQueryBuilder('bu')
              .delete()
              .from(BlogsBannedUserEntity)
              .where('userId=:userId', { userId: +bu.userId })
              .andWhere('blogId=blogId', { blogId: blogEntity.id })
              .execute();
          }
        });
      }
      if (blog.bannedUsers?.length > 0) {
        if (!blogEntity.bannedUsers) blogEntity.bannedUsers = [];
        blog.bannedUsers.map(async (b) => {
          if (!bannedUserInDb.includes(+b.id)) {
            const bannedUser = new BlogsBannedUserEntity();
            bannedUser.userId = +b.id;
            bannedUser.banReason = b.banReason;
            bannedUser.banDate = b.banDate;
            bannedUser.createdAt = Date.now();
            bannedUser.blog = blogEntity;
            await this.blogsBannedUsersRepository.save(bannedUser);
            blogEntity.bannedUsers.push(bannedUser);
          }
        });
      }
      return blogEntity.id;
    } catch (e) {
      console.log(e);
      return ERR_SAVE_TO_DB;
    }
  }
}
