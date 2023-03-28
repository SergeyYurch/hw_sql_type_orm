import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PostsQuerySqlRepository } from '../../posts/providers/posts.query.sql.repository';

@Injectable()
export class CheckPostIdBannedIncludeGuard implements CanActivate {
  constructor(private postsQueryRepository: PostsQuerySqlRepository) {}

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
