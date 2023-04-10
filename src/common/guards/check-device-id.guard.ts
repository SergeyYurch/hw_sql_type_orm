import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';

@Injectable()
export class CheckDeviceIdGuard implements CanActivate {
  constructor(
    private usersQueryTypeormRepository: UsersQueryTypeormRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckDeviceIdGuard start...');
    const request = context.switchToHttp().getRequest();
    const deviceId = request.params.deviceId;
    if (!(await this.usersQueryTypeormRepository.doesDeviceIdExist(deviceId)))
      throw new NotFoundException();
    return true;
  }
}
