import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionTypeOrmRepository } from '../quiz-question.type-orm.repository';
import { QuizQuestionsQueryTypeOrmRepository } from '../quiz-questions.query-type-orm.repository';

export class PublishQuestionCommand {
  constructor(public questionId: string, public published: boolean) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase
  implements ICommandHandler<PublishQuestionCommand>
{
  constructor(
    private quizQuestionRepository: QuizQuestionTypeOrmRepository,
    private quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
  ) {}
  async execute(command: PublishQuestionCommand) {
    const { questionId, published } = command;
    const questionModel =
      await this.quizQuestionsQueryTypeOrmRepository.getQuestionModel(
        questionId,
      );
    questionModel.publish(published);
    return !!(await this.quizQuestionRepository.save(questionModel));
  }
}
