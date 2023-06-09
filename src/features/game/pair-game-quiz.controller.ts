import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectionCommand } from './providers/use-cases/connection.use-case';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUserId } from '../../common/decorators/current-user-id.param.decorator';
import { PairsQueryTypeOrmRepository } from './providers/pairs.query.type-orm.repository';
import { CheckPairIdGuard } from './guards/check-pair-id-guard.service';
import { SetAnswerCommand } from './providers/use-cases/set-answer.use-case';
import { AnswerInputModel } from './dto/input-models/answer-input.model';
import { PaginatorParam } from '../../common/decorators/paginator-param.decorator';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('pair-game-quiz')
@Controller('pair-game-quiz')
export class PairGameQuizController {
  constructor(
    private commandBus: CommandBus,
    private readonly pairsQueryTypeOrmRepository: PairsQueryTypeOrmRepository,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get('pairs/my-current')
  async getCurrentGame(@CurrentUserId() userId: string) {
    const pair =
      await this.pairsQueryTypeOrmRepository.getActivePairViewByUserId(userId);
    if (!pair) throw new NotFoundException();
    return pair;
  }

  @UseGuards(AccessTokenGuard)
  @Get('users/my-statistic')
  async getUserGamesStatistic(@CurrentUserId() userId: string) {
    return await this.pairsQueryTypeOrmRepository.getUserGamesStatistic(userId);
  }

  @Get('users/top')
  async getTopUsers(
    @PaginatorParam()
    paginatorParams: PaginatorInputType,
  ) {
    return await this.pairsQueryTypeOrmRepository.getTopUsersViewModel(
      paginatorParams,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Get('pairs/my')
  async getUsersGames(
    @CurrentUserId() userId: string,
    @PaginatorParam({ sortBy: 'pairCreatedDate' })
    paginatorParams: PaginatorInputType,
  ) {
    return await this.pairsQueryTypeOrmRepository.getAllPairViewByUserId(
      userId,
      paginatorParams,
    );
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(CheckPairIdGuard)
  @Get('pairs/:id')
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

  @UseGuards(AccessTokenGuard)
  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
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

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('pairs/my-current/answers')
  async answer(
    @CurrentUserId() userId: string,
    @Body() body: AnswerInputModel,
  ) {
    console.log(
      `[PairGameQuizPairsController]:${Date.now()}: POST=>my-current/answers started userId: ${userId} `,
    );
    const pairId = await this.commandBus.execute(
      new SetAnswerCommand(userId, body.answer),
    );
    if (!pairId) throw new ForbiddenException();
    const answer = await this.pairsQueryTypeOrmRepository.getLastAnswerView(
      pairId,
      userId,
    );
    `[PairGameQuizPairsController]:${Date.now()}: pair have been saved answer: ${answer} `;
    return answer;
  }
}
