import {
  Body,
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
import { SetAnswerCommand } from './providers/use-cases/set-answer.use-case';
import { AnswerInputModel } from './dto/input-models/answer-input.model';
import { PaginatorParam } from '../common/decorators/paginator-param.decorator';
import { PaginatorInputType } from '../common/dto/input-models/paginator.input.type';

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

  @Get('my')
  async getUsersGames(
    @CurrentUserId() userId: string,
    @PaginatorParam({ sortBy: 'pairCreatedDate' })
    paginatorParams: PaginatorInputType,
  ) {
    const pairs = await this.pairsQueryTypeOrmRepository.getAllPairViewByUserId(
      userId,
      paginatorParams,
    );
    return pairs;
  }

  @UseGuards(CheckPairIdGuard)
  @Get(':id')
  async getGame(@Param('id') id: string, @CurrentUserId() userId: string) {
    const pair = await this.pairsQueryTypeOrmRepository.getPairViewById(id);
    if (
      !(
        pair.firstPlayerProgress.player.id === userId ||
        pair.secondPlayerProgress?.player?.id === userId
      )
    )
      throw new ForbiddenException();
    return pair;
  }

  @Post('connection')
  @HttpCode(200)
  async connection(@CurrentUserId() userId: string) {
    console.log(`[ PairGameQuizPairsController]: POST=>connection started.`);
    console.log(
      `[ PairGameQuizPairsController]: POST=>connection=> userId:${userId}`,
    );
    const pair =
      await this.pairsQueryTypeOrmRepository.getActivePairViewByUserId(userId);
    if (pair) {
      console.log(
        `[ PairGameQuizPairsController]: POST=>connection=> Forbidden User:${userId} is already connected`,
      );
      throw new ForbiddenException();
    }
    const pairId = await this.commandBus.execute(new ConnectionCommand(userId));
    if (!pairId) return null;
    console.log(
      `[ PairGameQuizPairsController]: POST=>connection=> user connected to pair:${pairId}`,
    );
    return this.pairsQueryTypeOrmRepository.getPairViewById(pairId);
  }

  @HttpCode(200)
  @Post('my-current/answers')
  async answer(
    @CurrentUserId() userId: string,
    @Body() body: AnswerInputModel,
  ) {
    console.log(
      `[PairGameQuizPairsController]: POST=>my-current/answers started`,
    );
    const pairId = await this.commandBus.execute(
      new SetAnswerCommand(userId, body.answer),
    );
    if (!pairId) throw new ForbiddenException();
    return this.pairsQueryTypeOrmRepository.getLastAnswerView(pairId, userId);
  }
}
