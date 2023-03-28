import { Injectable } from '@nestjs/common';
import { TestingRepository } from './testing.repository';
import { TestingSqlRepository } from './testing.sql.repository';

@Injectable()
export class TestingService {
  constructor(private testingRepository: TestingSqlRepository) {}
  async dataBaseClear() {
    return await this.testingRepository.dataBaseClear();
  }
}
