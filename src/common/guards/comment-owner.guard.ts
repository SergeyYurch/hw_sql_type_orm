import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CommentsQueryTypeOrmRepository } from '../../comments/providers/comments.query.type-orm.repository';

@Injectable()
export class CommentOwnerGuard implements CanActivate {
  constructor(
    private commentsQueryRepository: CommentsQueryTypeOrmRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const commentId = request.params.commentId;
    const userId = request.user.userId;
    if (!(await this.commentsQueryRepository.isCommentOwner(userId, commentId)))
      throw new ForbiddenException();
    return true;
  }
}
