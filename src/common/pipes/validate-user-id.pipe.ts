import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';

@Injectable()
export class ValidateUserIdPipe implements PipeTransform {
  constructor(private usersQueryRepository: UsersQueryTypeormRepository) {}
  async transform(value: string) {
    if (!(await this.usersQueryRepository.doesUserIdExist(value))) {
      throw new NotFoundException();
    }
    return value;
  }
}
