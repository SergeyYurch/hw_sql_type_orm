import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BlogsQueryTypeOrmRepository } from '../../features/blogs/providers/blogs.query.type-orm.repository';

@Injectable()
export class BlogOwnerGuard implements CanActivate {
  constructor(private blogsQueryRepository: BlogsQueryTypeOrmRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('BlogOwnerGuard');
    const request = context.switchToHttp().getRequest();
    const blogId = request.params.blogId || request.body.blogId;
    const user = request.user;
    const owner = await this.blogsQueryRepository.getBlogOwner(blogId);
    if (!owner || +owner.userId !== +user.userId) {
      console.log(`[BlogOwnerGuard]: user is not the owner of the blog `);
      throw new ForbiddenException();
    }
    return true;
  }
}
