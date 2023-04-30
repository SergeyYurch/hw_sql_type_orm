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
    console.log('!!!!save pair!!!!');

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
    console.log('A22- pairEntity');
    console.log(pairEntity.firstPlayer);
    await this.pairsRepository.save(pairEntity);
    console.log('A21- pairEntity');
    console.log(pairEntity);
    await this.checkFinishGame(pairEntity);
    return pairEntity.id;
  }

  async savePlayer(player: Player, playerEntity: PlayerEntity) {
    console.log('a45 - player');
    console.log(player);
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
    console.log('a333 - playerEntity');
    console.log(playerEntity);
    console.log(player);
    await this.playersRepository.save(playerEntity);
    console.log('a16- playerEntity');
    console.log(playerEntity.answers);
    return playerEntity;
  }

  async saveAnswer(answer: Answer, playerId: number) {
    const answerEntity = new AnswerEntity();
    if (answer.id) answerEntity.id = +answer.id;
    answerEntity.questionId = +answer.question.id;
    answerEntity.answerStatus = answer.answerStatus;
    answerEntity.body = answer.body;
    answerEntity.playerId = playerId;
    await this.answersRepository.save(answerEntity);
    console.log('a15 - answerEntity');
    console.log(answerEntity);
    return answerEntity;
  }

  private async checkFinishGame(pairEntity: PairEntity) {
    console.log('a17');
    console.log(pairEntity.firstPlayer?.answers?.length);
    console.log(pairEntity.secondPlayer?.answers?.length);
    if (
      pairEntity.firstPlayer?.answers?.length === 5 &&
      pairEntity.secondPlayer?.answers?.length === 5
    ) {
      console.log('!Start finishing game!');
      let firstPlayerAnsweredFirst = 0;
      let secondPlayerAnsweredFirst = 0;
      pairEntity.finishGameDate = Date.now();
      pairEntity.status = 'Finished';
      for (let i = 0; i < 5; i++) {
        console.log(
          '+pairEntity.firstPlayer.answers[i].addedAt ' +
            +pairEntity.firstPlayer.answers[i].addedAt,
        );

        console.log(
          '+pairEntity.secondPlayer.answers[i].addedAt' +
            +pairEntity.secondPlayer.answers[i].addedAt,
        );
        if (
          +pairEntity.firstPlayer.answers[i].addedAt <
          +pairEntity.secondPlayer.answers[i].addedAt
        ) {
          firstPlayerAnsweredFirst++;
        } else secondPlayerAnsweredFirst++;
      }
      console.log('firstPlayerAnsweredFirst' + firstPlayerAnsweredFirst);
      if (firstPlayerAnsweredFirst === 5 && pairEntity.firstPlayer.score > 0)
        pairEntity.firstPlayer.score++;
      if (secondPlayerAnsweredFirst === 5 && pairEntity.secondPlayer.score > 0)
        pairEntity.secondPlayer.score++;
      console.log(pairEntity.firstPlayer.score);
      await Promise.all([
        await this.playersRepository.save(pairEntity.firstPlayer),
        await this.playersRepository.save(pairEntity.secondPlayer),
        await this.pairsRepository.save(pairEntity),
      ]);
    }
  }
}
