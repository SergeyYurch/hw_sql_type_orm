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
        +pair.id,
      );
    }
    pairEntity.firstPlayer = await this.savePlayer(pair.firstPlayer);
    if (pair.secondPlayer)
      pairEntity.secondPlayer = await this.savePlayer(pair.secondPlayer);
    debugger;

    pairEntity.questions = pair.questions.map((p) => +p.id);
    pairEntity.status = pair.status;
    pairEntity.pairCreatedDate = pair.pairCreatedDate;
    pairEntity.startGameDate = pair.startGameDate;
    pairEntity.finishGameDate = pair.finishGameDate;
    debugger;
    await this.pairsRepository.save(pairEntity);
    debugger;
    await this.checkFinishGame(pairEntity);
    debugger;
    return pairEntity.id.toString();
  }

  async savePlayer(player: Player) {
    const playerEntity = new PlayerEntity();
    playerEntity.answers = [];
    if (player.id) playerEntity.id = +player.id;
    if (player.answers.length > 0) {
      for (const answer of player.answers) {
        playerEntity.answers.push(await this.saveAnswer(answer, +player.id));
      }
    }
    playerEntity.userId = +player.user.id;
    playerEntity.score = player.score;
    await this.playersRepository.save(playerEntity);
    debugger;
    return playerEntity;
  }

  async saveAnswer(answer: Answer, playerId: number) {
    const answerEntity = new AnswerEntity();
    if (answer.id) answerEntity.id = +answer.id;
    answerEntity.questionId = +answer.question.id;
    answerEntity.answerStatus = answer.answerStatus;
    answerEntity.body = answer.body;
    answerEntity.playerId = playerId;
    return this.answersRepository.save(answerEntity);
  }

  private async checkFinishGame(pairEntity: PairEntity) {
    if (
      pairEntity.firstPlayer.answers.length === 5 &&
      pairEntity.secondPlayer.answers.length === 5
    ) {
      let firstPlayerAnsweredFirst = 0;
      let secondPlayerAnsweredFirst = 0;
      pairEntity.finishGameDate = Date.now();
      pairEntity.status = 'Finished';
      for (let i = 0; i < 5; i++) {
        if (
          pairEntity.firstPlayer.answers[i].addedAt >
          pairEntity.secondPlayer.answers[i].addedAt
        ) {
          firstPlayerAnsweredFirst++;
        } else secondPlayerAnsweredFirst++;
      }
      if (firstPlayerAnsweredFirst === 5 && pairEntity.firstPlayer.score > 0)
        pairEntity.firstPlayer.score++;
      if (secondPlayerAnsweredFirst === 5 && pairEntity.secondPlayer.score > 0)
        pairEntity.secondPlayer.score++;
      await this.pairsRepository.save(pairEntity);
    }
  }
}
