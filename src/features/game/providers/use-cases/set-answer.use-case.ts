import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionTypeOrmRepository } from '../../../quiz/providers/quiz-question.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { PairsQueryTypeOrmRepository } from '../pairs.query.type-orm.repository';
import { PairsTypeOrmRepository } from '../pairs.type-orm.repository';
import { QuizQuestionsQueryTypeOrmRepository } from '../../../quiz/providers/quiz-questions.query-type-orm.repository';
import { Answer } from '../../domain/answer';
import { Pair } from '../../domain/pair';
import { GameStatusEnum } from '../../types/game-status.enum';
import { AnswerStatusEntity } from '../../types/answer-status.entity';

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
          this.finishGame(pairId);
        }, 10000);
      }
    }
    return pairId;
  }

  async finishGame(pairId: string) {
    const pairModel: Pair =
      await this.pairsQueryTypeOrmRepository.getPairModelById(pairId);
    if (pairModel.status === GameStatusEnum.FINISHED) return;
    pairModel.finishGame();
    await this.pairsTypeOrmRepository.savePair(pairModel);
  }
}
