import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { PairEntity } from '../entities/pair.entity';
import { Pair } from '../domain/pair';
import { PairsQueryTypeOrmRepository } from './pairs.query.type-orm.repository';
import { PlayerEntity } from '../entities/player.entity';
import { AnswerEntity } from '../entities/ansver.entity';
import { Player } from '../domain/player';
import { QuizQuestionsQueryTypeOrmRepository } from '../../quiz/providers/quiz-questions.query-type-orm.repository';
import { GameStatusEnum } from '../types/game-status.enum';

export class PairsTypeOrmRepository {
  private queryRunner: QueryRunner;
  constructor(
    private readonly quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
    private readonly pairsQueryTypeOrmRepository: PairsQueryTypeOrmRepository,
    private dataSource: DataSource,
    @InjectRepository(PairEntity)
    private readonly pairsRepository: Repository<PairEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answersRepository: Repository<AnswerEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playersRepository: Repository<PlayerEntity>,
  ) {}
  async savePair(pair: Pair) {
    console.log('start save pair');
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();

    try {
      let pairEntity = new PairEntity();
      if (pair.id) {
        pairEntity = await this.pairsQueryTypeOrmRepository.getPairEntityById(
          pair.id,
        );
      }
      pairEntity.firstPlayer = await this.savePlayer(
        pair.firstPlayer,
        pairEntity.firstPlayer,
      );
      if (pair.secondPlayer)
        pairEntity.secondPlayer = await this.savePlayer(
          pair.secondPlayer,
          pairEntity.secondPlayer,
        );
      pairEntity.questions = pair.questions.map((p) => +p.id);
      pairEntity.status = pair.status;
      pairEntity.pairCreatedDate = pair.pairCreatedDate;
      pairEntity.startGameDate = pair.startGameDate;
      pairEntity.finishGameDate = pair.finishGameDate;
      await this.queryRunner.manager.save(pairEntity);
      //  await this.checkFinishGame(pairEntity);
      await this.queryRunner.commitTransaction();
      if (pair.status === GameStatusEnum.FINISHED) {
        console.log('pairEntity has been saved');
        console.log(pairEntity);
      }
      return pairEntity.id;
    } catch (err) {
      console.log('pair save transaction error');
      console.log(err);
      // since we have errors lets rollback the changes we made
      await this.queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await this.queryRunner.release();
    }
  }

  async savePlayer(player: Player, playerEntity: PlayerEntity) {
    console.log('start save player, id:' + player.id + ' ' + Date.now());
    if (!playerEntity) {
      playerEntity = new PlayerEntity();
      playerEntity.answers = [];
    }
    if (player.answers.length > 0) {
      for (let i = 0; i < player.answers.length; i++) {
        let answerEntity = new AnswerEntity();
        if (player.answers[i].id) answerEntity = playerEntity.answers[i];
        answerEntity.questionId = +player.answers[i].question.id;
        answerEntity.answerStatus = player.answers[i].answerStatus;
        answerEntity.body = player.answers[i].body;
        answerEntity.playerId = +player.id;
        await this.queryRunner.manager.save(answerEntity);
        playerEntity.answers[i] = answerEntity;
      }
    }
    playerEntity.userId = +player.user.id;
    playerEntity.score = player.score;
    playerEntity.result = player.result;
    await this.queryRunner.manager.save(playerEntity);
    console.log('player have been saved, id:' + player.id + ' ' + Date.now());
    return playerEntity;
  }
}
