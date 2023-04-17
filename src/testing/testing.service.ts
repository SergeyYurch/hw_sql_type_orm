import { Injectable } from '@nestjs/common';
import { TestingTypeOrmRepository } from './testing.type-orm.repository';

@Injectable()
export class TestingService {
  constructor(private testingRepository: TestingTypeOrmRepository) {}
  async dataBaseClear() {
    return await this.testingRepository.dataBaseClear();
  }
}
