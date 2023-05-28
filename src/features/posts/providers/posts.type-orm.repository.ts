import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LikesQuerySqlRepository } from '../../../common/providers/likes.query.sql.repository';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogEntity } from '../../blogs/entities/blog.entity';
import { PostEntity } from '../entities/post.entity';
import { PostsQueryTypeOrmRepository } from './posts.query.type-orm.repository';
import { LikesTypeOrmRepository } from '../../likes/providers/likes.type-orm.repository';
import { CommentsTypeOrmRepository } from '../../comments/providers/comments.type-orm.repository';
import { BloggerImageEntity } from '../../image/entities/blogger-image.entity';
import { ImageService } from '../../image/providers/image.service';

@Injectable()
export class PostsTypeOrmRepository {
  constructor(
    private likesQuerySqlRepository: LikesQuerySqlRepository,
    private postsQueryTypeOrmRepository: PostsQueryTypeOrmRepository,
    private likesTypeOrmRepository: LikesTypeOrmRepository,
    private commentsTypeOrmRepository: CommentsTypeOrmRepository,
    private imageService: ImageService,
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(BloggerImageEntity)
    private readonly bloggerImageRepository: Repository<BloggerImageEntity>,
  ) {}

  async createModel() {
    return new Post();
  }
  async delete(postId: string) {
    try {
      await this.commentsTypeOrmRepository.deleteComments({ postId });
      await this.postsRepository
        .createQueryBuilder('p')
        .delete()
        .from(PostEntity)
        .where('id = :id', { id: +postId })
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
      console.log(post);
      let postEntity: PostEntity = new PostEntity();
      if (post.id) {
        postEntity = await this.postsQueryTypeOrmRepository.findById(post.id);
      }

      if (post.icons) {
        postEntity.iconMain = postEntity.iconMain ?? new BloggerImageEntity();
        postEntity.iconSmall = postEntity.iconSmall ?? new BloggerImageEntity();
        postEntity.iconMiddle =
          postEntity.iconMiddle ?? new BloggerImageEntity();
        this.imageService.castBloggerImageParamsToEntity(
          post.icons.main,
          postEntity.iconMain,
        );
        this.imageService.castBloggerImageParamsToEntity(
          post.icons.small,
          postEntity.iconSmall,
        );
        this.imageService.castBloggerImageParamsToEntity(
          post.icons.middle,
          postEntity.iconMiddle,
        );
      }
      await Promise.all([
        this.bloggerImageRepository.save(postEntity.iconMain),
        this.bloggerImageRepository.save(postEntity.iconSmall),
        this.bloggerImageRepository.save(postEntity.iconMiddle),
      ]);

      postEntity.title = post.title;
      postEntity.shortDescription = post.shortDescription;
      postEntity.content = post.content;
      postEntity.createdAt = post.createdAt;
      postEntity.bloggerId = +post.blogger.id;
      postEntity.blogId = +post.blog.id;
      await this.postsRepository.save(postEntity);
      if (post.updatedLike)
        await this.likesTypeOrmRepository.updateLike({ post });
      return postEntity.id.toString();
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
