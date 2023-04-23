import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PairsQueryTypeOrmRepository } from '../providers/pairs.query.type-orm.repository';

@Injectable()
export class CheckPairIdGuard implements CanActivate {
  constructor(
    private pairsQueryTypeOrmRepository: PairsQueryTypeOrmRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckQuestionIdGuard');
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    if (!Number.isInteger(+id)) throw new NotFoundException();
    if (+id < 0) throw new NotFoundException();
    if (!(await this.pairsQueryTypeOrmRepository.doesPairIdExist(id))) {
      throw new NotFoundException();
    }
    return true;
  }
}
