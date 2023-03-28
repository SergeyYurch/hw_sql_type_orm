import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { PostsQuerySqlRepository } from '../../posts/providers/posts.query.sql.repository';

@Injectable()
export class ValidatePostIdPipe implements PipeTransform {
  constructor(private postsQueryRepository: PostsQuerySqlRepository) {}
  async transform(value: string) {
    if (!(await this.postsQueryRepository.doesPostIdExist(value))) {
      throw new NotFoundException();
    }
    return value;
  }
}
