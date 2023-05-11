import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionTypeOrmRepository } from '../quiz-question.type-orm.repository';

export class DeleteQuestionCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(private quizQuestionRepository: QuizQuestionTypeOrmRepository) {}
  async execute(command: DeleteQuestionCommand) {
    const { questionId } = command;
    return this.quizQuestionRepository.delete(questionId);
  }
}
