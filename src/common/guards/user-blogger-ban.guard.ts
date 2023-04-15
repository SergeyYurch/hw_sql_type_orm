import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { BlogsQueryTypeOrmRepository } from '../../blogs/providers/blogs.query.type-orm.repository';
import { PostsQueryTypeOrmRepository } from '../../posts/providers/posts.query.type-orm.repository';

@Injectable()
export class UserBloggerBanGuard implements CanActivate {
  constructor(
    private postsQueryRepository: PostsQueryTypeOrmRepository,
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const postId = request.params.postId;
    const blogId = (
      await this.postsQueryRepository.getPostViewModelById(postId)
    ).blogId;
    const result = await this.blogsQueryRepository.isUserBanned(
      user.userId,
      blogId,
    );
    if (!result) {
      console.log('Access denied, user is banned');
    }
    return !result;
  }
}
