import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersQuerySqlRepository } from '../../users/providers/users.query-sql.repository';

@Injectable()
export class UserBanGuard implements CanActivate {
  constructor(private usersQueryRepository: UsersQuerySqlRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return await this.usersQueryRepository.isUserBanned(user.userId);
  }
}
