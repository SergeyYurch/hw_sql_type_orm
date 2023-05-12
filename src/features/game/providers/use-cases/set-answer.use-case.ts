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
    let pairModel = await this.pairsQueryTypeOrmRepository.getPairModelByUserId(
      +userId,
    );
    if (!pairModel) return null;
    if (pairModel.status !== 'Active') return null;
    const answer = new Answer(answerBody);
    let currentPlayer: Player = pairModel.secondPlayer;
    let otherPlayer: Player = pairModel.firstPlayer;
    if (pairModel.firstPlayer.user.id === userId) {
      currentPlayer = pairModel.firstPlayer;
      otherPlayer = pairModel.secondPlayer;
    }
    if (currentPlayer.answers.length === 5) return null;
    const numberOfQuestion = currentPlayer.answers.length;
    answer.question = pairModel.questions[numberOfQuestion];
    if (answer.question.correctAnswers.includes(answer.body)) {
      answer.answerStatus = 'Correct';
      currentPlayer.score++;
    } else {
      answer.answerStatus = 'Incorrect';
    }
    currentPlayer.answers.push(answer);
    const pairId = await this.pairsTypeOrmRepository.savePair(pairModel);

    //check final answer
    if (currentPlayer.answers.length === 5) {
      pairModel = await this.pairsQueryTypeOrmRepository.getPairModelByUserId(
        +pairId,
      );
      if (pairModel.status !== 'Active') return pairId;
      setTimeout(() => {
        for (let i = otherPlayer.answers.length; i < 6; i++) {
          const answer = new Answer('Empty answer');
          answer.question = pairModel.questions[numberOfQuestion];
          answer.answerStatus = 'Incorrect';
          otherPlayer.answers[i] = answer;
        }
        this.pairsTypeOrmRepository.savePair(pairModel);
      }, 10000);
    }
    return pairId;
  }
}
