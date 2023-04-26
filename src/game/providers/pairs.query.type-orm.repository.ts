import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { PairEntity } from '../entities/pair.entity';
import { Pair } from '../domain/pair';
import { PlayerEntity } from '../entities/player.entity';
import { Player } from '../domain/player';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { AnswerEntity } from '../entities/ansver.entity';
import { Answer } from '../domain/answer';
import { QuizQuestionsQueryTypeOrmRepository } from '../../quiz/providers/quiz-questions.query-type-orm.repository';
import { AnswerStatusType } from '../types/answer-status.type';
import { GamePairViewModel } from '../dto/view-models/game-pair.view.model';
import { PlayerProgressViewModel } from '../dto/view-models/player-progress.view.model';
import { AnswerViewModel } from '../dto/view-models/answer.view.model';

export class PairsQueryTypeOrmRepository {
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
  ) {}

  async doesPairIdExist(pairId: string) {
    const queryString = `
              SELECT EXISTS (SELECT * 
              FROM pairs 
              WHERE id=${+pairId});
             `;
    console.log(queryString);
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
    const pair = await this.getPairModelById(+pairId);
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
      relations: {
        firstPlayer: { user: true, answers: { question: true } },
        secondPlayer: { user: true, answers: { question: true } },
      },
      where: [
        { firstPlayer: { userId }, status: Not('Finished') },
        { secondPlayer: { userId }, status: Not('Finished') },
      ],
    });
  }
  async getPairModelByUserId(userId: number) {
    const pairEntity = await this.getPairEntityByUserId(userId);
    if (!pairEntity) return null;
    return this.castToPairModel(pairEntity);
  }

  async getOpenPair() {
    console.log('getOpenPair');
    const openPair = await this.pairsRepository.findOne({
      relations: {
        firstPlayer: { user: true },
      },
      where: { status: 'PendingSecondPlayer' },
    });
    console.log(openPair);
    if (!openPair) return null;
    return this.castToPairModel(openPair);
  }

  async getPairEntityById(id: number) {
    console.log('getPairEntityById');
    return this.pairsRepository.findOne({
      relations: {
        firstPlayer: { user: true, answers: { question: true } },
        secondPlayer: { user: true, answers: { question: true } },
      },
      where: { id },
    });
  }

  async getPairModelById(pairId: number) {
    const pairEntity = await this.getPairEntityById(pairId);
    if (!pairEntity) return null;
    return this.castToPairModel(pairEntity);
  }

  async getPairViewById(id: string) {
    const pairModel = await this.getPairModelById(+id);
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
    console.log('castToPairModel');
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
    console.log('castToPlayerModel');
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
    console.log('castToAnswerModel');
    const answerModel = new Answer(entity.body);
    answerModel.id = entity.id.toString();
    answerModel.question =
      this.quizQuestionsQueryTypeOrmRepository.castToQuestionModel(
        entity.question,
      );
    answerModel.answerStatus = entity.answerStatus as AnswerStatusType;
    answerModel.addedAt = +entity.addedAt;
    return answerModel;
  }
  private castToAnswerViewModel(answerModel: Answer): AnswerViewModel {
    return {
      questionId: answerModel.question.id,
      addedAt: new Date(answerModel.addedAt).toISOString(),
      answerStatus: answerModel.answerStatus,
    };
  }
}
