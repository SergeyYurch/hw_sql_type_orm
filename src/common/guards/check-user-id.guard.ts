import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { UsersQueryTypeormRepository } from '../../features/users/providers/users.query-typeorm.repository';

@Injectable()
export class CheckUserIdGuard implements CanActivate {
  constructor(private usersQueryRepository: UsersQueryTypeormRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckUserIdGuard');
    const request = context.switchToHttp().getRequest();
    const userId = request.params.userId;
    if (!Number.isInteger(+userId)) throw new NotFoundException();
    if (+userId < 0) throw new NotFoundException();
    if (!(await this.usersQueryRepository.doesUserIdExist(userId))) {
      throw new NotFoundException();
    }
    return true;
  }
}
