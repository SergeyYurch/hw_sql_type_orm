import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { BlogsQueryTypeOrmRepository } from '../../blogs/providers/blogs.query.type-orm.repository';

@Injectable()
export class BlogOwnerGuard implements CanActivate {
  constructor(private blogsQueryRepository: BlogsQueryTypeOrmRepository) {}

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
