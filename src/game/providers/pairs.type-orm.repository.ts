import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairEntity } from '../entities/pair.entity';
import { Pair } from '../domain/pair';
import { PairsQueryTypeOrmRepository } from './pairs.query.type-orm.repository';
import { PlayerEntity } from '../entities/player.entity';
import { Answer } from '../domain/answer';
import { AnswerEntity } from '../entities/ansver.entity';
import { Player } from '../domain/player';

export class PairsTypeOrmRepository {
  constructor(
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
    pairEntity.firstPlayer = await this.savePlayer(pair.firstPlayer);
    if (pair.secondPlayer)
      pairEntity.secondPlayer = await this.savePlayer(pair.secondPlayer);
    if (pair.id) {
      pairEntity = await this.pairsQueryTypeOrmRepository.getPairEntityById(
        +pair.id,
      );
    }
    pairEntity.questions = pair.questions;
    pairEntity.status = pair.status;
    pairEntity.pairCreatedDate = pair.pairCreatedDate;
    pairEntity.startGameDate = pair.startGameDate;
    pairEntity.finishGameDate = pair.finishGameDate;
    await this.pairsRepository.save(pairEntity);
    return pairEntity.id.toString();
  }

  async savePlayer(player: Player) {
    const playerEntity = new PlayerEntity();
    if (player.id) playerEntity.id = +player.id;
    if (player.answers.length > 0) {
      for (const answer of player.answers) {
        playerEntity.answers.push(await this.saveAnswer(answer, player.id));
      }
    }
    playerEntity.userId = +player.user.id;
    playerEntity.score = player.score;
    return await this.playersRepository.save(playerEntity);
  }

  async saveAnswer(answer: Answer, playerId: string) {
    const answerEntity = new AnswerEntity();
    if (answer.id) answerEntity.id = +answer.id;
    answerEntity.questionId = +answer.question.id;
    answerEntity.answerStatus = answer.answerStatus;
    answerEntity.body = answer.body;
    answerEntity.addedAt = answer.addedAt || Date.now();
    answerEntity.playerId = +playerId;
    return this.answersRepository.save(answerEntity);
  }
}
