import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PostsQueryTypeOrmRepository } from '../../posts/providers/posts.query.type-orm.repository';

@Injectable()
export class CheckPostIdGuard implements CanActivate {
  constructor(private postsQueryRepository: PostsQueryTypeOrmRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckPostIdGuard');
    const request = context.switchToHttp().getRequest();
    const postId = request.params.postId;
    if (!Number.isInteger(+postId)) throw new NotFoundException();
    if (+postId < 0) throw new NotFoundException();
    const postIdIsExist = await this.postsQueryRepository.doesPostIdExist(
      postId,
    );
    if (!postIdIsExist) {
      console.log('post not found, postId does not exist');
      throw new NotFoundException();
    }
    return true;
  }
}
