import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CommentsQuerySqlRepository } from '../../comments/providers/comments.query.sql.repository';

@Injectable()
export class CommentOwnerGuard implements CanActivate {
  constructor(private commentsQueryRepository: CommentsQuerySqlRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const commentId = request.params.commentId;
    const userId = request.user.userId;
    if (!(await this.commentsQueryRepository.isCommentOwner(userId, commentId)))
      throw new ForbiddenException();
    return true;
  }
}
