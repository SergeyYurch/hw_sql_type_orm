import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';

@Injectable()
export class SecurityService {
  constructor(private userQueryRepository: UsersQueryTypeormRepository) {}
  async validateOwner(userId: string, deviceId: string) {
    const user = await this.userQueryRepository.getUserModelById(userId);
    const result = user.validateIsUserOwnerSession(deviceId);
    if (!result) {
      throw new ForbiddenException('Forbidden');
    }
  }
}
