import { Controller, Get, Post } from '@nestjs/common';

@Controller('pair-game-quiz/pairs')
export class PairGameQuizPairsController {
  @Get('my-current')
  async getCurrentGame() {
    return true;
  }

  @Get(':id')
  async getGame() {
    return true;
  }

  @Post('connection')
  async connection() {
    return true;
  }

  @Post('my-current/answers')
  async answer() {
    return true;
  }
}
