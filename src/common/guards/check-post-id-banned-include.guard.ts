import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PostsQueryTypeOrmRepository } from '../../features/posts/providers/posts.query.type-orm.repository';

@Injectable()
export class CheckPostIdBannedIncludeGuard implements CanActivate {
  constructor(private postsQueryRepository: PostsQueryTypeOrmRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckPostIdGuard');
    const request = context.switchToHttp().getRequest();
    const postId = request.params.postId;
    if (!Number.isInteger(+postId)) throw new NotFoundException();
    if (+postId < 0) throw new NotFoundException();
    if (
      !(await this.postsQueryRepository.doesPostIdExist(postId, {
        bannedInclude: true,
      }))
    )
      throw new NotFoundException();
    return true;
  }
}
