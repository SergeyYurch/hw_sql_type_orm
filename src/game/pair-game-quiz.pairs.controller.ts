import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectionCommand } from './providers/use-cases/connection.use-case';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { CurrentUserId } from '../common/decorators/current-user-id.param.decorator';
import { PairsQueryTypeOrmRepository } from './providers/pairs.query.type-orm.repository';
import { CheckPairIdGuard } from './guards/check-pair-id-guard.service';

@UseGuards(AccessTokenGuard)
@Controller('/pair-game-quiz/pairs')
export class PairGameQuizPairsController {
  constructor(
    private commandBus: CommandBus,
    private readonly pairsQueryTypeOrmRepository: PairsQueryTypeOrmRepository,
  ) {}
  @Get('my-current')
  async getCurrentGame(@CurrentUserId() userId: string) {
    const pair =
      await this.pairsQueryTypeOrmRepository.getActivePairViewByUserId(userId);
    if (!pair) throw new NotFoundException();
    return pair;
  }

  @UseGuards(CheckPairIdGuard)
  @Get(':id')
  async getGame(@Param('id') id: string, @CurrentUserId() userId: string) {
    const pair = await this.pairsQueryTypeOrmRepository.getPairViewById(id);
    if (
      !(
        pair.firstPlayerProgress.player.id === userId ||
        pair.firstPlayerProgress.player.id === userId
      )
    )
      throw new ForbiddenException();
    return pair;
  }

  @Post('connection')
  @HttpCode(200)
  async connection(@CurrentUserId() userId: string) {
    const pairId = await this.commandBus.execute(new ConnectionCommand(userId));
    if (!pairId) return null;
    return this.pairsQueryTypeOrmRepository.getPairViewById(pairId);
  }

  @Post('my-current/answers')
  async answer() {
    return true;
  }
}
