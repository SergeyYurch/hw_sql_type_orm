import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { TestingService } from './testing.service';

@Controller('testing')
export class TestingController {
  constructor(private testingService: TestingService) {}

  @Get()
  test() {
    return 'test';
  }

  @Delete('all-data')
  @HttpCode(204)
  async clearDb() {
    return await this.testingService.dataBaseClear();
  }
}
