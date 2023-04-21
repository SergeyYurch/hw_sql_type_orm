import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairEntity } from '../entities/pair.entity';
import { Pair } from '../domain/pair';
import { PlayerEntity } from '../entities/player.entity';
import { Player } from '../domain/player';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { AnswerEntity } from '../entities/ansver.entity';
import { Answer } from '../domain/answer';
import { QuizQuestionsQueryTypeOrmRepository } from '../../quiz/providers/quiz-questions.query-type-orm.repository';
import { AnswerStatusType } from '../types/answer-status.type';

export class PairsQueryTypeOrmRepository {
  constructor(
    @InjectRepository(PairEntity)
    private readonly pairsRepository: Repository<PairEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playersRepository: Repository<PlayerEntity>,
    private readonly usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private readonly quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
  ) {}

  async getPairEntityByUserId(userId: number) {
    return this.pairsRepository.findOne({
      relations: {
        firstPlayer: { user: true },
        secondPlayer: { user: true },
      },
      where: [{ firstPlayerId: userId }, { secondPlayerId: userId }],
    });
  }
  async getPairModelByUserId(userId: string) {
    const pairEntity = await this.getPairEntityByUserId(+userId);
    if (!pairEntity) return null;
    return this.castToPairModel(pairEntity);
  }

  async getOpenPair() {
    const openPair = await this.pairsRepository.findOne({
      relations: {
        firstPlayer: { user: true },
        secondPlayer: { user: true },
      },
      where: { status: 'PendingSecondPlayer' },
    });
    if (!openPair) return null;
    return this.castToPairModel(openPair);
  }

  castToPairModel(entity: PairEntity) {
    const pairModel = new Pair();
    pairModel.id = entity.id.toString();
    pairModel.firstPlayer = this.castToPlayerModel(entity.firstPlayer);
    if (entity.secondPlayer)
      pairModel.secondPlayer = this.castToPlayerModel(entity.secondPlayer);
    pairModel.questions = entity.questions;
    pairModel.status = entity.status;
    pairModel.pairCreatedDate = entity.pairCreatedDate;
    pairModel.startGameDate = entity.startGameDate;
    pairModel.finishGameDate = entity.finishGameDate;
    return pairModel;
  }

  castToPlayerModel(entity: PlayerEntity) {
    const playerModel = new Player();
    playerModel.user = this.usersQueryTypeormRepository.castToUserModel(
      entity.user,
    );
    playerModel.answers = entity.answers.map((e) => this.castToAnswerModel(e));
    playerModel.score = entity.score;
    return playerModel;
  }

  castToAnswerModel(entity: AnswerEntity) {
    const answerModel = new Answer();
    answerModel.question =
      this.quizQuestionsQueryTypeOrmRepository.castToQuestionModel(
        entity.question,
      );
    answerModel.answerStatus = entity.answerStatus as AnswerStatusType;
    answerModel.addedAt = entity.addedAt;
    return answerModel;
  }

  getPairEntityById(id: number) {
    return this.pairsRepository.findOne({
      relations: {
        firstPlayer: { user: true },
        secondPlayer: { user: true },
      },
      where: { id },
    });
  }

  async getPairModelById(pairId: string) {
    const pairEntity = await this.getPairEntityById(+pairId);
    if (!pairEntity) return null;
    return this.castToPairModel(pairEntity);
  }
}
