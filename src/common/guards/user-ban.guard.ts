import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';

@Injectable()
export class UserBanGuard implements CanActivate {
  constructor(private usersQueryRepository: UsersQueryTypeormRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return await this.usersQueryRepository.isUserBanned(user.userId);
  }
}
