import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { BlogsQuerySqlRepository } from '../../blogs/providers/blogs.query.sql.repository';

@Injectable()
export class ValidateBlogIdPipe implements PipeTransform {
  constructor(private blogsQueryRepository: BlogsQuerySqlRepository) {}
  async transform(value: string) {
    if (!(await this.blogsQueryRepository.doesBlogIdExist(value))) {
      throw new NotFoundException();
    }
    return value;
  }
}
