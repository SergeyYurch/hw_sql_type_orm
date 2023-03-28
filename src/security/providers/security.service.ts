import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../users/domain/user.schema';
import { Model } from 'mongoose';
import { UsersQuerySqlRepository } from '../../users/providers/users.query-sql.repository';

@Injectable()
export class SecurityService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    private userQueryRepository: UsersQuerySqlRepository,
  ) {}
  async validateOwner(userId: string, deviceId: string) {
    const user = await this.userQueryRepository.findUserByDeviceId(deviceId);
    if (!user) {
      throw new NotFoundException('Invalid deviceId');
    }
    if (user.id !== userId) {
      throw new ForbiddenException('Forbidden');
    }
    return user;
  }
}
