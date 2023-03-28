import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatorViewModel } from '../../common/dto/view-models/paginator.view.model';
import { pagesCount } from '../../common/helpers/helpers';
import { Post, PostDocument } from '../domain/post.schema';
import { PostViewModel } from '../dto/view-models/post.view.model';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { LikeStatusType } from '../../common/dto/input-models/like.input.model';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<PostDocument>) {}

  async checkPostId(postId: string): Promise<boolean> {
    const post = await this.PostModel.findById(postId);
    return !!post && !post.isBanned;
  }

  async findPosts(
    paginatorParams: PaginatorInputType,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatorViewModel<PostViewModel>> {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    const filter = blogId ? { blogId, isBanned: false } : { isBanned: false };
    const totalCount = await this.PostModel.countDocuments(filter);
    const posts = await this.PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();
    const items: PostViewModel[] = [];
    for (const p of posts) {
      items.push(this.getPostViewModel(p, userId));
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
    const postInDb = await this.PostModel.findById(postId);
    if (!postInDb || postInDb.isBanned) return null;
    return this.getPostViewModel(postInDb, userId);
  }

  async getPostsBloggerId(postId: string): Promise<string> {
    const postInDb = await this.PostModel.findById(postId);
    return postInDb.bloggerId;
  }

  getPostViewModel(post: Post, userId?: string): PostViewModel {
    const likes = post.likes.filter(
      (l) => l.likeStatus === 'Like' && !l.userIsBanned,
    );
    const likesCount = likes.length;
    const dislike = post.likes.filter(
      (l) => l.likeStatus === 'Dislike' && !l.userIsBanned,
    );
    const dislikesCount = dislike.length;
    likes.sort((l1, l2) => {
      if (l1.addedAt < l2.addedAt) return 1;
      if (l1.addedAt > l2.addedAt) return -1;
      return 0;
    });
    const lastLikes = likes.slice(0, 3);
    const newestLikes = lastLikes.map((l) => ({
      addedAt: l.addedAt.toISOString(),
      userId: l.userId,
      login: l.login,
    }));
    let myStatus: LikeStatusType = 'None';
    if (userId) {
      const myLike = post.likes.find((l) => l.userId === userId);
      if (myLike) myStatus = myLike.likeStatus;
    }
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes,
      },
    };
  }
}
