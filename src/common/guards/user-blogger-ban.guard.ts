import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PostsQuerySqlRepository } from '../../posts/providers/posts.query.sql.repository';
import { BlogsQuerySqlRepository } from '../../blogs/providers/blogs.query.sql.repository';

@Injectable()
export class UserBloggerBanGuard implements CanActivate {
  constructor(
    private postsQueryRepository: PostsQuerySqlRepository,
    private blogsQueryRepository: BlogsQuerySqlRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const postId = request.params.postId;
    const blogId = (await this.postsQueryRepository.getPostById(postId)).blogId;
    return !(await this.blogsQueryRepository.isUserBanned(user.userId, blogId));
  }
}
