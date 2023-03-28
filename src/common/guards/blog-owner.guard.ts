import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { BlogsQuerySqlRepository } from '../../blogs/providers/blogs.query.sql.repository';

@Injectable()
export class BlogOwnerGuard implements CanActivate {
  constructor(private blogsQueryRepository: BlogsQuerySqlRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('BlogOwnerGuard');
    const request = context.switchToHttp().getRequest();
    const blogId = request.params.blogId || request.body.blogId;
    const user = request.user;
    const owner = await this.blogsQueryRepository.getBlogOwner(blogId);
    if (!owner) throw new NotFoundException();
    return owner.userId === user.userId;
  }
}
