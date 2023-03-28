import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { BlogsQuerySqlRepository } from '../../blogs/providers/blogs.query.sql.repository';

@Injectable()
export class CheckBlogIdGuard implements CanActivate {
  constructor(private blogsQueryRepository: BlogsQuerySqlRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckBlogIdGuard');
    const request = context.switchToHttp().getRequest();
    const blogId = request.params.blogId;
    if (!Number.isInteger(+blogId)) throw new NotFoundException();
    if (+blogId < 0) throw new NotFoundException();
    if (!(await this.blogsQueryRepository.doesBlogIdExist(blogId))) {
      throw new NotFoundException();
    }
    return true;
  }
}
