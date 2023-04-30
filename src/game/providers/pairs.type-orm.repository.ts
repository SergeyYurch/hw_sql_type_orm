import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairEntity } from '../entities/pair.entity';
import { Pair } from '../domain/pair';
import { PairsQueryTypeOrmRepository } from './pairs.query.type-orm.repository';
import { PlayerEntity } from '../entities/player.entity';
import { Answer } from '../domain/answer';
import { AnswerEntity } from '../entities/ansver.entity';
import { Player } from '../domain/player';
import { QuizQuestionsQueryTypeOrmRepository } from '../../quiz/providers/quiz-questions.query-type-orm.repository';

export class PairsTypeOrmRepository {
  constructor(
    private readonly quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
    private readonly pairsQueryTypeOrmRepository: PairsQueryTypeOrmRepository,
    @InjectRepository(PairEntity)
    private readonly pairsRepository: Repository<PairEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answersRepository: Repository<AnswerEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playersRepository: Repository<PlayerEntity>,
  ) {}
  async savePair(pair: Pair) {
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
    await this.pairsRepository.save(pairEntity);
    await this.checkFinishGame(pairEntity);
    return pairEntity.id;
  }

  async savePlayer(player: Player, playerEntity: PlayerEntity) {
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
        await this.answersRepository.save(answerEntity);
        playerEntity.answers[i] = answerEntity;
      }
    }
    playerEntity.userId = +player.user.id;
    playerEntity.score = player.score;
    await this.playersRepository.save(playerEntity);
    return playerEntity;
  }

  private async checkFinishGame(pairEntity: PairEntity) {
    console.log('!!!!Start finishing game!!!!!');
    console.log(
      'firstPlayer всего ответов: ' + pairEntity.firstPlayer?.answers?.length,
    );
    console.log(
      'secondPlayer всего ответов: ' + pairEntity.secondPlayer?.answers?.length,
    );
    if (
      pairEntity.firstPlayer?.answers?.length === 5 &&
      pairEntity.secondPlayer?.answers?.length === 5
    ) {
      let firstPlayerAnsweredFirst = 0;
      let secondPlayerAnsweredFirst = 0;
      pairEntity.finishGameDate = Date.now();
      pairEntity.status = 'Finished';
      for (let i = 0; i < 5; i++) {
        console.log(
          'Ответ firstPlayer ID: ' +
            +pairEntity.firstPlayer.answers[i].id +
            'зафиксирован: ' +
            pairEntity.firstPlayer.answers[i].addedAt,
        );

        console.log(
          'Ответ secondPlayer ID:' +
            +pairEntity.secondPlayer.answers[i].id +
            'завиксирован' +
            +pairEntity.secondPlayer.answers[i].addedAt,
        );
        if (
          +pairEntity.firstPlayer.answers[i].addedAt <
          +pairEntity.secondPlayer.answers[i].addedAt
        ) {
          firstPlayerAnsweredFirst++;
        } else secondPlayerAnsweredFirst++;
      }
      console.log(
        'Результат количетсво первых ответов: firstPlayerAnsweredFirst: ' +
          firstPlayerAnsweredFirst,
      );
      console.log(
        'Результат количетсво первых ответов: secondPlayerAnsweredFirst: ' +
          secondPlayerAnsweredFirst,
      );
      if (firstPlayerAnsweredFirst === 5 && pairEntity.firstPlayer.score > 0)
        pairEntity.firstPlayer.score++;
      if (secondPlayerAnsweredFirst === 5 && pairEntity.secondPlayer.score > 0)
        pairEntity.secondPlayer.score++;
      await Promise.all([
        await this.playersRepository.save(pairEntity.firstPlayer),
        await this.playersRepository.save(pairEntity.secondPlayer),
        await this.pairsRepository.save(pairEntity),
      ]);
    }
  }
}
