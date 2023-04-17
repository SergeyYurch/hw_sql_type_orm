import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { CommentsQueryTypeOrmRepository } from '../../comments/providers/comments.query.type-orm.repository';

@Injectable()
export class CheckCommentIdGuard implements CanActivate {
  constructor(
    private commentsQueryRepository: CommentsQueryTypeOrmRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckCommentIdGuard');
    const request = context.switchToHttp().getRequest();
    const commentId = request.params.commentId;
    if (!Number.isInteger(+commentId)) throw new NotFoundException();
    if (+commentId < 0) throw new NotFoundException();
    if (!(await this.commentsQueryRepository.doesCommentIdExist(commentId))) {
      throw new NotFoundException();
    }
    console.log('CheckCommentIdGuard is Ok');
    return true;
  }
}
