import { Injectable } from '@nestjs/common';
import { PaginatorViewModel } from '../../../common/dto/view-models/paginator.view.model';
import { pagesCount } from '../../../common/helpers/helpers';
import { PostViewModel } from '../dto/view-models/post.view.model';
import { PaginatorInputType } from '../../../common/dto/input-models/paginator.input.type';
import { Post } from '../domain/post';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { BlogsQueryTypeOrmRepository } from '../../blogs/providers/blogs.query.type-orm.repository';
import { LikeEntity } from '../../likes/entities/like.entity';
import { LikeStatusType } from '../../../common/dto/input-models/like.input.model';
import { BloggerImageEntity } from '../../image/entities/blogger-image.entity';
import { BloggerImage } from '../../image/domain/blogger-image';
import { PhotoSizeViewModel } from '../../../common/dto/view-models/photo-size.view.model';
import { BlogService } from '../../blogs/providers/blog.service';

@Injectable()
export class PostsQueryTypeOrmRepository {
  constructor(
    private usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private blogsQueryTypeOrmRepository: BlogsQueryTypeOrmRepository,
    private readonly blogService: BlogService,
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(LikeEntity)
    private readonly likesRepository: Repository<LikeEntity>,
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

  async getPostViewModelById(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    const post = await this.getPostModelById(postId, userId);
    if (!post) return null;
    return this.castToPostViewModel(post);
  }

  async getPostModelById(postId: string, userId?: string) {
    const postEntity = await this.findById(postId);
    if (!postEntity) return null;
    let postModel: Post = this.castToPostModel(postEntity);
    if (userId) postModel = await this.addUserLikeStatus(postModel, userId);
    if (postModel.likes.likesCount > 0)
      postModel = await this.findNewestLikes(postModel);
    return postModel;
  }

  async findNewestLikes(postModel: Post) {
    const newestLikes = await this.likesRepository.find({
      relations: { user: true },
      select: {
        id: true,
        addedAt: true,
        user: { id: true, login: true },
      },
      order: { addedAt: 'desc' },
      take: 3,
      where: {
        user: { isBanned: false },
        postId: +postModel.id,
        likeStatus: 'Like',
      },
    });
    newestLikes.map((nl) => {
      postModel.newestLikes.push({
        userId: nl.user.id.toString(),
        login: nl.user.login,
        addedAt: new Date(+nl.addedAt).toString(),
      });
    });
    return postModel;
  }

  async addUserLikeStatus(postModel: Post, userId: string) {
    const userLike = await this.likesRepository.findOne({
      where: { postId: +postModel.id, userId: +userId },
      select: { likeStatus: true },
    });
    if (userLike?.likeStatus)
      postModel.likes.myStatus = userLike.likeStatus as LikeStatusType;
    return postModel;
  }

  async findById(postId: string) {
    try {
      return this.postsRepository.findOne({
        relations: {
          blogger: true,
          blog: { blogOwner: true },
          iconMain: true,
          iconMiddle: true,
          iconSmall: true,
        },
        where: { id: +postId, blog: { isBanned: false } },
      });
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
      const findOptionsWhere: FindOptionsWhere<PostEntity> = {
        blog: { ['isBanned']: false },
      };
      if (blogId) findOptionsWhere['blogId'] = +blogId;
      let findOptionsOrder = {};
      if (sortBy) {
        if (sortBy === 'blogName') {
          findOptionsOrder = { blog: { name: sortDirection } };
        } else {
          {
            findOptionsOrder = { [sortBy]: sortDirection };
          }
        }
      }
      const [postEntities, totalCount] =
        await this.postsRepository.findAndCount({
          relations: {
            blogger: true,
            blog: { blogOwner: true },
            iconMain: true,
            iconMiddle: true,
            iconSmall: true,
          },
          where: findOptionsWhere,
          order: findOptionsOrder,
          skip: pageSize * (pageNumber - 1),
          take: pageSize,
        });
      if (!totalCount || postEntities.length === 0)
        return { totalCount: 0, postEntities: [] };
      //if userId, get array of likeStatus for this userId
      let usersLikes = [];
      if (userId) {
        const postIds = postEntities.map((p) => p.id);
        usersLikes = await this.findLikesForUserId(postIds, +userId);
      }
      const postModels: Post[] = [];
      for (const postEntity of postEntities) {
        let postModel: Post = await this.castToPostModel(postEntity);
        postModel.likes.myStatus = usersLikes.find(
          (l) => l.postId === postEntity.id,
        );
        if (postEntity.likesCount > 0)
          postModel = await this.findNewestLikes(postModel);

        postModels.push(postModel);
      }
      return { totalCount: totalCount, postEntities: postModels };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async findLikesForUserId(
    postIds: number[],
    userId: number,
  ): Promise<LikeEntity[]> {
    try {
      return await this.likesRepository.find({
        relations: { user: true },
        select: {
          userId: true,
          likeStatus: true,
          postId: true,
          user: { id: false },
        },
        where: { postId: In(postIds), user: { isBanned: false }, userId },
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  castToPostModel(postEntity: PostEntity): Post {
    const postModel = new Post();
    postModel.id = postEntity.id.toString();
    postModel.title = postEntity.title;
    postModel.shortDescription = postEntity.shortDescription;
    postModel.content = postEntity.content;
    postModel.blogger = this.usersQueryTypeormRepository.mapToUserDomainModel(
      postEntity.blogger,
    );
    postModel.blog = this.blogService.mapToBlogDomainModel(postEntity.blog);
    postModel.createdAt = +postEntity.createdAt;
    postModel.likes = {
      likesCount: +postEntity.likesCount,
      dislikesCount: +postEntity.dislikesCount,
      myStatus: 'None',
    };
    postModel.newestLikes = [];
    if (postEntity.iconMain)
      postModel.icons = {
        main: this.castToImageModel(postEntity.iconMain),
        middle: this.castToImageModel(postEntity.iconMiddle),
        small: this.castToImageModel(postEntity.iconSmall),
      };
    return postModel;
  }

  castToImageModel(imageEntity: BloggerImageEntity) {
    if (!imageEntity) return null;
    const imageModel = new BloggerImage();
    imageModel.id = imageEntity.id;
    imageModel.url = imageEntity.url;
    imageModel.height = imageEntity.height;
    imageModel.width = imageEntity.width;
    imageModel.format = imageEntity.format;
    imageModel.createdAt = imageEntity.createdAt;
    imageModel.fileSize = imageEntity.fileSize;
    imageModel.updatedAt = imageEntity.updatedAt;
    return imageModel;
  }

  castToPhotoSizeViewModel(image: BloggerImage): PhotoSizeViewModel {
    return {
      url: image.url,
      fileSize: image.fileSize,
      height: image.height,
      width: image.width,
    };
  }

  private castToPostViewModel(post: Post): PostViewModel {
    const main: PhotoSizeViewModel[] = [];
    if (post.icons) {
      for (const key in post.icons) {
        main.push(this.castToPhotoSizeViewModel(post.icons[key]));
      }
    }
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blog.id,
      blogName: post.blog.name,
      createdAt: new Date(post.createdAt).toISOString(),
      extendedLikesInfo: {
        likesCount: +post.likes.likesCount,
        dislikesCount: +post.likes.dislikesCount,
        myStatus: post.likes.myStatus || 'None',
        newestLikes: post.newestLikes,
      },
      images: {
        main,
      },
    };
  }

  async getPostImages(postId: string) {
    const post = await this.getPostViewModelById(postId);
    return {
      main: post.images.main,
    };
  }
}
