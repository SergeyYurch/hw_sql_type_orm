import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionTypeOrmRepository } from '../../../quiz/providers/quiz-question.type-orm.repository';
import { UsersQueryTypeormRepository } from '../../../users/providers/users.query-typeorm.repository';
import { PairsQueryTypeOrmRepository } from '../pairs.query.type-orm.repository';
import { Player } from '../../domain/player';
import { PairsTypeOrmRepository } from '../pairs.type-orm.repository';
import { QuizQuestionsQueryTypeOrmRepository } from '../../../quiz/providers/quiz-questions.query-type-orm.repository';
import { Answer } from '../../domain/answer';

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
    const { userId, answerBody } = command;
    const pairModel =
      await this.pairsQueryTypeOrmRepository.getPairModelByUserId(+userId);
    const answer = new Answer(answerBody);
    let currentPlayer: Player = pairModel.secondPlayer;
    if (pairModel.firstPlayer.user.id === userId) {
      currentPlayer = pairModel.firstPlayer;
    }
    const questionNumber = currentPlayer.answers.length;
    answer.question = pairModel.questions[questionNumber];
    if (answer.question.correctAnswers.includes(answer.body)) {
      answer.answerStatus = 'Correct';
    } else {
      answer.answerStatus = 'Incorrect';
    }
    currentPlayer.answers.push(answer);
    currentPlayer.score = currentPlayer.answers.filter(
      (a) => a.answerStatus === 'Correct',
    ).length;

    await this.pairsTypeOrmRepository.savePair(pairModel);
  }
}