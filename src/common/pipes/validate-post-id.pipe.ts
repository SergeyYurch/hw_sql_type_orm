import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { PostsQueryTypeOrmRepository } from '../../features/posts/providers/posts.query.type-orm.repository';

@Injectable()
export class ValidatePostIdPipe implements PipeTransform {
  constructor(private postsQueryRepository: PostsQueryTypeOrmRepository) {}
  async transform(value: string) {
    if (!(await this.postsQueryRepository.doesPostIdExist(value))) {
      throw new NotFoundException();
    }
    return value;
  }
}
