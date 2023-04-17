import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { BlogsQueryTypeOrmRepository } from '../../blogs/providers/blogs.query.type-orm.repository';

@Injectable()
export class ValidateBlogIdPipe implements PipeTransform {
  constructor(private blogsQueryRepository: BlogsQueryTypeOrmRepository) {}
  async transform(value: string) {
    if (!(await this.blogsQueryRepository.doesBlogIdExist(value))) {
      throw new NotFoundException();
    }
    return value;
  }
}
