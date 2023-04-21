import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionTypeOrmRepository } from '../../../quiz/providers/quiz-question.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { Pair } from '../../domain/pair';
import { PairsQueryTypeOrmRepository } from '../pairs.query.type-orm.repository';
import { Player } from '../../domain/player';
import { PairsTypeOrmRepository } from '../pairs.type-orm.repository';
import { QuizQuestionsQueryTypeOrmRepository } from '../../../quiz/providers/quiz-questions.query-type-orm.repository';

export class ConnectionCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectionCommand)
export class ConnectionUseCase implements ICommandHandler<ConnectionCommand> {
  constructor(
    private quizQuestionRepository: QuizQuestionTypeOrmRepository,
    private readonly quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
    private usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private readonly pairsQueryTypeOrmRepository: PairsQueryTypeOrmRepository,
    private readonly pairsTypeOrmRepository: PairsTypeOrmRepository,
  ) {}
  async execute(command: ConnectionCommand) {
    const { userId } = command;
    const playerModel = new Player();
    playerModel.user = await this.usersQueryTypeormRepository.getUserModelById(
      userId,
    );
    let pairModel = await this.pairsQueryTypeOrmRepository.getOpenPair();
    if (!pairModel) {
      pairModel = new Pair();
      pairModel.createNewPair(playerModel);
      const pairId = await this.pairsTypeOrmRepository.savePair(pairModel);
      return this.pairsQueryTypeOrmRepository.getPairModelById(pairId);
    }
    const questions =
      await this.quizQuestionsQueryTypeOrmRepository.getRandomSetOfQuestionsForPair(
        5,
      );
    pairModel.connectSecondPlayer(playerModel, questions);
    const pairId = await this.pairsTypeOrmRepository.savePair(pairModel);
    return this.pairsQueryTypeOrmRepository.getPairModelByUserId(pairId);
  }
}
