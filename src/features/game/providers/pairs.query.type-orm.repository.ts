import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  Not,
  Repository,
} from 'typeorm';
import { PairEntity } from '../entities/pair.entity';
import { Pair } from '../domain/pair';
import { PlayerEntity } from '../entities/player.entity';
import { Player } from '../domain/player';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { AnswerEntity } from '../entities/ansver.entity';
import { Answer } from '../domain/answer';
import { QuizQuestionsQueryTypeOrmRepository } from '../../quiz/providers/quiz-questions.query-type-orm.repository';
import { AnswerStatusEntity } from '../types/answer-status.entity';
import { GamePairViewModel } from '../dto/view-models/game-pair.view.model';
import { PlayerProgressViewModel } from '../dto/view-models/player-progress.view.model';
import { AnswerViewModel } from '../dto/view-models/answer.view.model';
import { PaginatorInputType } from '../../../common/dto/input-models/paginator.input.type';
import { PaginatorViewModel } from '../../../common/dto/view-models/paginator.view.model';
import { pagesCount } from '../../../common/helpers/helpers';
import { MyStatisticViewModel } from '../dto/view-models/my-statistic.view.model';
import { Question } from '../../quiz/domain/question';
import { GameStatusEnum } from '../types/game-status.enum';
import { UsersService } from '../../users/providers/users.service';

export class PairsQueryTypeOrmRepository {
  findOptionsRelations: FindOptionsRelations<PairEntity>;
  constructor(
    @InjectRepository(PairEntity)
    private readonly pairsRepository: Repository<PairEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playersRepository: Repository<PlayerEntity>,
    private readonly usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private readonly quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
    private readonly usersService: UsersService,
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
    console.log('t15');
    console.log(userId);
    const pairModel = await this.getPairModelByUserId(+userId);
    if (!pairModel) return null;
    return this.castToPairViewModel(pairModel);
  }
  async getLastAnswerView(
    pairId: string,
    userId: string,
  ): Promise<AnswerViewModel> {
    console.log('getLastAnswerView');
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
        { firstPlayer: { userId }, status: Not(GameStatusEnum.FINISHED) },
        { secondPlayer: { userId }, status: Not(GameStatusEnum.FINISHED) },
      ],
      order: {
        firstPlayer: { answers: { addedAt: 'ASC' } },
        secondPlayer: { answers: { addedAt: 'ASC' } },
      },
    });
  }

  async getPairModelByUserId(userId: number) {
    console.log('t14');
    console.log(userId);
    const pairEntity = await this.getPairEntityByUserId(userId);
    if (!pairEntity) return null;
    return this.castToPairModel(pairEntity);
  }

  async getOpenPair() {
    const openPair = await this.pairsRepository.findOne({
      relations: {
        firstPlayer: { user: true },
      },
      where: { status: GameStatusEnum.PENDING },
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

  async castToPairModel(pairEntity: PairEntity) {
    const pairModel = new Pair();
    pairModel.id = pairEntity.id.toString();
    pairModel.status = pairEntity.status;
    if (pairEntity.questions.length > 0) {
      pairModel.questions =
        await this.quizQuestionsQueryTypeOrmRepository.getQuestionModelsByIds(
          pairEntity.questions,
        );
    }
    pairModel.firstPlayer = this.castToPlayerModel(
      pairModel,
      pairEntity.firstPlayer,
    );
    if (pairEntity.secondPlayer)
      pairModel.secondPlayer = this.castToPlayerModel(
        pairModel,
        pairEntity.secondPlayer,
      );
    pairModel.pairCreatedDate = pairEntity.pairCreatedDate;
    pairModel.startGameDate = pairEntity.startGameDate;
    pairModel.finishGameDate = pairEntity.finishGameDate;

    return pairModel;
  }

  castToPlayerViewModel(playerModel: Player): PlayerProgressViewModel {
    playerModel.answers.sort((a, b) => +a.addedAt - +b.addedAt);
    return {
      player: {
        id: playerModel.user.id,
        login: playerModel.user.accountData.login,
      },
      score: playerModel.score,
      answers: playerModel.answers.map((a) => this.castToAnswerViewModel(a)),
    };
  }

  castToPlayerModel(pairModel: Pair, playerEntity: PlayerEntity) {
    const playerModel = new Player();
    playerModel.user = this.usersService.mapToUserDomainModel(
      playerEntity.user,
    );
    playerModel.id = playerEntity.id.toString();
    playerModel.answers = [];
    const countOfAnswers =
      pairModel.status === GameStatusEnum.FINISHED
        ? 5
        : playerEntity.answers?.length || 0;
    for (let i = 0; i < countOfAnswers; i++) {
      playerModel.answers[i] = this.castToAnswerModel(
        pairModel.questions[i],
        playerEntity.answers[i],
      );
    }
    playerModel.score = playerEntity.score;
    return playerModel;
  }

  castToAnswerModel(questionModel: Question, answerEntity?: AnswerEntity) {
    const answerModel = new Answer(answerEntity?.body || 'empty');
    answerModel.id = answerEntity?.id.toString() || '0';
    answerModel.question = questionModel;
    answerModel.answerStatus =
      answerEntity?.answerStatus || AnswerStatusEntity.INCORRECT;
    answerModel.addedAt = answerEntity?.addedAt || new Date();
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
    console.log('t20');
    console.log(sortBy);
    delete findOptionsOrder['createdAt'];
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
    console.log(findManyOptions);
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
    const query = await this.getBasePlayerStatQueryBuilder().andWhere(
      'u.id=:userId',
      { userId: +userId },
    );
    const rawPlayer = await query.getRawOne();
    console.log('t111');
    console.log(rawPlayer);
    const stat = this.castRawPlayerStatistic(rawPlayer);
    delete stat.player;
    return stat;
  }

  async getTopUsersViewModel(paginatorParams: PaginatorInputType) {
    const { sort, pageSize, pageNumber } = paginatorParams;
    const orderOption = {};
    for (const sortItem of sort) {
      const field = Object.keys(sortItem)[0];
      const fieldAlias = this.getAlias(field);
      orderOption[fieldAlias] = sortItem[field];
    }
    const countRes = await this.dataSource.query(`
      SELECT COUNT(DISTINCT p."userId") 
      FROM players p 
      WHERE p.result IS NOT NULL
`);
    const totalCount = +countRes[0].count;

    const rawPlayers = await this.getBasePlayerStatQueryBuilder()
      .offset(pageSize * (pageNumber - 1))
      .limit(pageSize)
      .orderBy(orderOption)
      .getRawMany();
    const items = rawPlayers.map((rp) => this.castRawPlayerStatistic(rp));
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  private getBasePlayerStatQueryBuilder() {
    return this.playersRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .select('COUNT(*) as games_count')
      .addSelect((subQuery) => {
        return subQuery
          .select('SUM(pl.score)')
          .from(PlayerEntity, 'pl')
          .where(`pl.userId=u.id AND pl.result IS NOT NULL`);
      }, 'sum_score')
      .addSelect('1.0*SUM(p.score)/COUNT(*) as avg_scores')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(PlayerEntity, 'pl')
          .where(`pl.userId=u.id AND pl.result='won'`);
      }, 'wins_count')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(PlayerEntity, 'pl')
          .where(`pl.userId=u.id AND pl.result='lost'`);
      }, 'losses_count')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(PlayerEntity, 'pl')
          .where(`pl.userId=u.id AND pl.result='draw'`);
      }, 'draws_count')
      .addSelect('u.id, u.login')
      .where('p.result IS NOT NULL')
      .groupBy('u.id');
  }

  private castRawPlayerStatistic(rp) {
    console.log('t55');
    console.log(rp);

    return {
      sumScore: +rp.sum_score,
      avgScores: Math.round(rp.avg_scores * 100) / 100,
      gamesCount: +rp.games_count,
      winsCount: +rp.wins_count,
      lossesCount: +rp.losses_count,
      drawsCount: +rp.draws_count,
      player: { id: String(rp.id), login: rp.login },
    };
  }

  private getAlias(field: string) {
    switch (field) {
      case 'sumScore':
        return 'sum_score';
      case 'avgScores':
        return 'avg_scores';
      case 'gamesCount':
        return 'games_count';
      case 'winsCount':
        return 'wins_count';
      case 'lossesCount':
        return 'losses_count';
      case 'drawsCount':
        return 'draws_count';
      default:
        return 'u.id';
    }
  }
}
