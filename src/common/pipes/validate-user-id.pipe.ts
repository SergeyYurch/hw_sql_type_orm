import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { UsersQuerySqlRepository } from '../../users/providers/users.query-sql.repository';

@Injectable()
export class ValidateUserIdPipe implements PipeTransform {
  constructor(private usersQueryRepository: UsersQuerySqlRepository) {}
  async transform(value: string) {
    if (!(await this.usersQueryRepository.doesUserIdExist(value))) {
      throw new NotFoundException();
    }
    return value;
  }
}
