import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PairsQueryTypeOrmRepository } from '../providers/pairs.query.type-orm.repository';

@Injectable()
export class CheckPairIdGuard implements CanActivate {
  constructor(
    private pairsQueryTypeOrmRepository: PairsQueryTypeOrmRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckPairIdGuard');
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    const regexExp =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

    if (!regexExp.test(id)) {
      console.log(`!!!!BadRequestException: id ${id}`);
      throw new BadRequestException({
        statusCode: 400,
        message: { message: 'Wrong Id', field: 'id' },
      });
    }
    if (!(await this.pairsQueryTypeOrmRepository.doesPairIdExist(id))) {
      throw new NotFoundException();
    }
    return true;
  }
}
