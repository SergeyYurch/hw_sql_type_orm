import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { PairEntity } from '../entities/pair.entity';
import { Pair } from '../domain/pair';
import { GameResult, PlayerEntity } from '../entities/player.entity';
import { Player } from '../domain/player';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { AnswerEntity } from '../entities/ansver.entity';
import { Answer } from '../domain/answer';
import { QuizQuestionsQueryTypeOrmRepository } from '../../quiz/providers/quiz-questions.query-type-orm.repository';
import { AnswerStatusType } from '../types/answer-status.type';
import { GamePairViewModel } from '../dto/view-models/game-pair.view.model';
import { PlayerProgressViewModel } from '../dto/view-models/player-progress.view.model';
import { AnswerViewModel } from '../dto/view-models/answer.view.model';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { PaginatorViewModel } from '../../common/dto/view-models/paginator.view.model';
import { pagesCount } from '../../common/helpers/helpers';
import { MyStatisticViewModel } from '../dto/view-models/my-statistic.view.model';

export class PairsQueryTypeOrmRepository {
  private findOptionsRelations: FindOptionsRelations<PairEntity>;
  constructor(
    @InjectRepository(PairEntity)
    private readonly pairsRepository: Repository<PairEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playersRepository: Repository<PlayerEntity>,
    private readonly usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private readonly quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
    @InjectDataSource() protected dataSource: DataSource,
  ) {
    this.findOptionsRelations = {
      firstPlayer: { user: true, answers: { question: true } },
      secondPlayer: { user: true, answers: { question: true } },
    };
  }

  async doesPairIdExist(pairId: string) {
    const queryString = `
              SELECT EXISTS (SELECT * 
              FROM pairs 
              WHERE id='${pairId}');
             `;
    const queryResult = await this.dataSource.query(queryString);
    return queryResult[0].exists;
  }

  async getActivePairViewByUserId(userId: string) {
    const pairModel = await this.getPairModelByUserId(+userId);
    if (!pairModel) return null;
    return this.castToPairViewModel(pairModel);
  }
  async getLastAnswerView(
    pairId: string,
    userId: string,
  ): Promise<AnswerViewModel> {
    const pair = await this.getPairModelById(pairId);
    let lastAnswer: Answer = pair.secondPlayer.answers.at(-1);
    if (pair.firstPlayer.user.id === userId) {
      lastAnswer = pair.firstPlayer.answers.at(-1);
    }
    return {
      answerStatus: lastAnswer.answerStatus,
      addedAt: new Date(lastAnswer.addedAt).toISOString(),
      questionId: lastAnswer.question.id,
    };
  }

  async getPairEntityByUserId(userId: number) {
    return this.pairsRepository.findOne({
      relations: this.findOptionsRelations,
      where: [
        { firstPlayer: { userId }, status: Not('Finished') },
        { secondPlayer: { userId }, status: Not('Finished') },
      ],
      order: {
        firstPlayer: { answers: { addedAt: 'ASC' } },
        secondPlayer: { answers: { addedAt: 'ASC' } },
      },
    });
  }

  async getPairModelByUserId(userId: number) {
    const pairEntity = await this.getPairEntityByUserId(userId);
    if (!pairEntity) return null;
    return this.castToPairModel(pairEntity);
  }

  async getOpenPair() {
    const openPair = await this.pairsRepository.findOne({
      relations: {
        firstPlayer: { user: true },
      },
      where: { status: 'PendingSecondPlayer' },
    });
    if (!openPair) return null;
    return this.castToPairModel(openPair);
  }

  async getPairEntityById(id: string) {
    return await this.pairsRepository.findOne({
      relations: this.findOptionsRelations,
      where: { id },
      order: {
        firstPlayer: { answers: { addedAt: 'ASC' } },
        secondPlayer: { answers: { addedAt: 'ASC' } },
      },
    });
  }

  async getPairModelById(pairId: string) {
    const pairEntity = await this.getPairEntityById(pairId);
    if (!pairEntity) return null;
    return this.castToPairModel(pairEntity);
  }

  async getPairViewById(id: string) {
    const pairModel = await this.getPairModelById(id);
    return this.castToPairViewModel(pairModel);
  }

  castToPairViewModel(pairModel: Pair): GamePairViewModel {
    return {
      id: pairModel.id,
      firstPlayerProgress: this.castToPlayerViewModel(pairModel.firstPlayer),
      secondPlayerProgress: pairModel.secondPlayer
        ? this.castToPlayerViewModel(pairModel.secondPlayer)
        : null,
      status: pairModel.status,
      questions:
        pairModel.questions?.length > 0
          ? pairModel.questions.map((q) => ({
              id: q.id,
              body: q.body,
            }))
          : null,
      pairCreatedDate: new Date(pairModel.pairCreatedDate).toISOString(),
      startGameDate: pairModel.startGameDate
        ? new Date(pairModel.startGameDate).toISOString()
        : null,
      finishGameDate: pairModel.finishGameDate
        ? new Date(pairModel.finishGameDate).toISOString()
        : null,
    };
  }

  async castToPairModel(entity: PairEntity) {
    const pairModel = new Pair();
    pairModel.id = entity.id.toString();
    pairModel.firstPlayer = this.castToPlayerModel(entity.firstPlayer);
    if (entity.secondPlayer)
      pairModel.secondPlayer = this.castToPlayerModel(entity.secondPlayer);
    pairModel.status = entity.status;
    pairModel.pairCreatedDate = +entity.pairCreatedDate;
    pairModel.startGameDate = +entity.startGameDate;
    pairModel.finishGameDate = +entity.finishGameDate;
    if (entity.questions.length > 0) {
      pairModel.questions =
        await this.quizQuestionsQueryTypeOrmRepository.getQuestionModelsByIds(
          entity.questions,
        );
    }
    return pairModel;
  }

  castToPlayerViewModel(playerModel: Player): PlayerProgressViewModel {
    playerModel.answers.sort((a, b) => +a.addedAt - +b.addedAt);
    console.log('l3');
    console.log(playerModel.answers);
    return {
      player: {
        id: playerModel.user.id,
        login: playerModel.user.accountData.login,
      },
      score: playerModel.score,
      answers: playerModel.answers.map((a) => this.castToAnswerViewModel(a)),
    };
  }

  castToPlayerModel(entity: PlayerEntity) {
    const playerModel = new Player();
    playerModel.user = this.usersQueryTypeormRepository.castToUserModel(
      entity.user,
    );
    playerModel.id = entity.id.toString();
    playerModel.answers =
      entity.answers?.map((e) => this.castToAnswerModel(e)) || [];
    playerModel.score = entity.score;
    return playerModel;
  }

  castToAnswerModel(entity: AnswerEntity) {
    const answerModel = new Answer(entity.body);
    answerModel.id = entity.id.toString();
    answerModel.question =
      this.quizQuestionsQueryTypeOrmRepository.castToQuestionModel(
        entity.question,
      );
    answerModel.answerStatus = entity.answerStatus as AnswerStatusType;
    answerModel.addedAt = entity.addedAt;
    return answerModel;
  }

  private castToAnswerViewModel(answerModel: Answer): AnswerViewModel {
    return {
      questionId: answerModel.question.id,
      addedAt: new Date(answerModel.addedAt).toISOString(),
      answerStatus: answerModel.answerStatus,
    };
  }

  async getAllPairViewByUserId(
    userId: string,
    paginatorParams: PaginatorInputType,
  ): Promise<PaginatorViewModel<GamePairViewModel>> {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    const findOptionsOrder: FindOptionsOrder<PairEntity> = {
      [sortBy]: sortDirection,
    };
    if (sortBy != 'pairCreatedDate')
      findOptionsOrder['pairCreatedDate'] = 'desc';
    const findOptionsWhere: FindOptionsWhere<PairEntity>[] = [
      { firstPlayer: { userId: +userId } },
      { secondPlayer: { userId: +userId } },
    ];
    const findManyOptions: FindManyOptions<PairEntity> = {
      relations: this.findOptionsRelations,
      where: findOptionsWhere,
      order: findOptionsOrder,
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    };
    const [pairEntities, totalCount] = await this.pairsRepository.findAndCount(
      findManyOptions,
    );
    if (!totalCount)
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize,
        totalCount: 0,
        items: [],
      };
    const items = [];
    for (const pairEntity of pairEntities) {
      const pairModel = await this.castToPairModel(pairEntity);
      items.push(this.castToPairViewModel(pairModel));
    }
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async getUserGamesStatistic(userId: string): Promise<MyStatisticViewModel> {
    const findOptionsWhere: FindOptionsWhere<PlayerEntity> = {
      userId: +userId,
      result: Not(IsNull()),
    };
    const playerEntities = await this.playersRepository.find({
      where: findOptionsWhere,
    });
    const gamesCount = playerEntities.length;
    let sumScore = 0;
    let winsCount = 0;
    let lossesCount = 0;
    let drawsCount = 0;
    for (const p of playerEntities) {
      sumScore += p.score;
      if (p.result === GameResult.won) winsCount++;
      if (p.result === GameResult.lost) lossesCount++;
      if (p.result === GameResult.draw) drawsCount++;
    }
    const avgScores = Math.round((100 * sumScore) / gamesCount) / 100;
    return {
      sumScore,
      avgScores,
      gamesCount,
      drawsCount,
      lossesCount,
      winsCount,
    };
  }
}
