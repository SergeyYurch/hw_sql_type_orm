import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { UsersQuerySqlRepository } from '../../users/providers/users.query-sql.repository';

@Injectable()
export class CheckUserIdBannedIncludeGuard implements CanActivate {
  constructor(private usersQueryRepository: UsersQuerySqlRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckUserIdGuard');
    const request = context.switchToHttp().getRequest();
    const userId = request.params.userId;
    if (!Number.isInteger(+userId)) throw new NotFoundException();
    if (+userId < 0) throw new NotFoundException();
    console.log(`userId=${userId}`);
    if (
      !(await this.usersQueryRepository.doesUserIdExist(userId, {
        bannedInclude: true,
      }))
    ) {
      throw new NotFoundException();
    }
    return true;
  }
}
