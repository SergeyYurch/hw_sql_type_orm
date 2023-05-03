import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { PairEntity } from '../entities/pair.entity';
import { Pair } from '../domain/pair';
import { PairsQueryTypeOrmRepository } from './pairs.query.type-orm.repository';
import { PlayerEntity } from '../entities/player.entity';
import { AnswerEntity } from '../entities/ansver.entity';
import { Player } from '../domain/player';
import { QuizQuestionsQueryTypeOrmRepository } from '../../quiz/providers/quiz-questions.query-type-orm.repository';

export class PairsTypeOrmRepository {
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let pairEntity = new PairEntity();
      if (pair.id) {
        pairEntity = await this.pairsQueryTypeOrmRepository.getPairEntityById(
          pair.id,
        );
      }
      pairEntity.firstPlayer = await this.savePlayer(
        queryRunner,
        pair.firstPlayer,
        pairEntity.firstPlayer,
      );
      if (pair.secondPlayer)
        pairEntity.secondPlayer = await this.savePlayer(
          queryRunner,
          pair.secondPlayer,
          pairEntity.secondPlayer,
        );
      pairEntity.questions = pair.questions.map((p) => +p.id);
      pairEntity.status = pair.status;
      pairEntity.pairCreatedDate = pair.pairCreatedDate;
      pairEntity.startGameDate = pair.startGameDate;
      pairEntity.finishGameDate = pair.finishGameDate;
      await queryRunner.manager.save(pairEntity);
      await this.checkFinishGame(queryRunner, pairEntity);
      await queryRunner.commitTransaction();
      return pairEntity.id;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async savePlayer(
    queryRunner: QueryRunner,
    player: Player,
    playerEntity: PlayerEntity,
  ) {
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
        await queryRunner.manager.save(answerEntity);
        playerEntity.answers[i] = answerEntity;
      }
    }
    playerEntity.userId = +player.user.id;
    playerEntity.score = player.score;
    await queryRunner.manager.save(playerEntity);
    console.log('player have been saved, id:' + player.id + ' ' + Date.now());
    return playerEntity;
  }

  private async checkFinishGame(
    queryRunner: QueryRunner,
    pairEntity: PairEntity,
  ) {
    if (
      pairEntity.firstPlayer?.answers?.length === 5 &&
      pairEntity.secondPlayer?.answers?.length === 5
    ) {
      console.log(
        `!!!!Start finishing game!!!!!1 player answers: ${pairEntity.firstPlayer?.answers?.length} 1 player answers: ${pairEntity.secondPlayer?.answers?.length} :`,
      );
      pairEntity.finishGameDate = Date.now();
      pairEntity.status = 'Finished';
      if (
        +pairEntity.firstPlayer.answers[5].addedAt <
          +pairEntity.secondPlayer.answers[5].addedAt &&
        pairEntity.firstPlayer.score > 0
      )
        pairEntity.firstPlayer.score++;
      if (
        +pairEntity.firstPlayer.answers[5].addedAt >
          +pairEntity.secondPlayer.answers[5].addedAt &&
        pairEntity.secondPlayer.score > 0
      )
        pairEntity.secondPlayer.score++;
      await Promise.all([
        await queryRunner.manager.save(pairEntity.firstPlayer),
        await queryRunner.manager.save(pairEntity.secondPlayer),
        await queryRunner.manager.save(pairEntity),
      ]);
    }
  }
}
