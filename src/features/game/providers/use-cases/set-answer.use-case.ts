import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionTypeOrmRepository } from '../../../quiz/providers/quiz-question.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { PairsQueryTypeOrmRepository } from '../pairs.query.type-orm.repository';
import { Player } from '../../domain/player';
import { PairsTypeOrmRepository } from '../pairs.type-orm.repository';
import { QuizQuestionsQueryTypeOrmRepository } from '../../../quiz/providers/quiz-questions.query-type-orm.repository';
import { Answer } from '../../domain/answer';
import { Pair } from '../../domain/pair';
import { GameStatusEnum } from '../../types/game-status.enum';
import { AnswerStatusEntity } from '../../types/answer-status.entity';
import { PairEntity } from '../../entities/pair.entity';
import { GameResultEnum } from '../../entities/player.entity';

export class SetAnswerCommand {
  constructor(public userId: string, public answerBody: string) {}
}

@CommandHandler(SetAnswerCommand)
export class SetAnswerUseCase implements ICommandHandler<SetAnswerCommand> {
  constructor(
    private quizQuestionRepository: QuizQuestionTypeOrmRepository,
    private readonly quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
    private usersQueryTypeormRepository: UsersQueryTypeormRepository,
    private readonly pairsQueryTypeOrmRepository: PairsQueryTypeOrmRepository,
    private readonly pairsTypeOrmRepository: PairsTypeOrmRepository,
  ) {}

  async execute(command: SetAnswerCommand) {
    console.log('SetAnswerUseCase');
    const { userId, answerBody } = command;
    const pairModel =
      await this.pairsQueryTypeOrmRepository.getPairModelByUserId(+userId);
    if (!pairModel) return null;
    if (pairModel.status !== 'Active') return null;
    const answer = new Answer(answerBody);
    const { currentPlayer, otherPlayer } = pairModel.getCurrentPlayer(userId);
    if (currentPlayer.answers.length === 5) return null;
    const numberOfQuestion = currentPlayer.answers.length;
    answer.question = pairModel.questions[numberOfQuestion];
    if (answer.question.correctAnswers.includes(answer.body)) {
      answer.answerStatus = AnswerStatusEntity.CORRECT;
      currentPlayer.score++;
    } else {
      answer.answerStatus = AnswerStatusEntity.INCORRECT;
    }
    currentPlayer.answers.push(answer);
    const pairId = await this.pairsTypeOrmRepository.savePair(pairModel);

    //check final answer
    if (currentPlayer.answers.length === 5) {
      if (otherPlayer.answers.length === 5) {
        await this.finishGame(pairId);
      } else {
        setTimeout(() => {
          console.log('Timer is out: finish game');
          this.finishGame(pairId);
        }, 8000);
      }
    }
    return pairId;
  }

  async finishGame(pairId: string) {
    console.log('finishGame');
    const pairModel: Pair =
      await this.pairsQueryTypeOrmRepository.getPairModelById(pairId);
    console.log(pairModel);
    if (pairModel.status === GameStatusEnum.FINISHED) return;
    pairModel.finishGame();
    await this.pairsTypeOrmRepository.savePair(pairModel);
    console.log('pairModel after finish');
    console.log(pairModel);
  }
}
