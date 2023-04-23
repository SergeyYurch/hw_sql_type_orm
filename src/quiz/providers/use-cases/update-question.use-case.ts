import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionTypeOrmRepository } from '../quiz-question.type-orm.repository';
import { QuizQuestionsQueryTypeOrmRepository } from '../quiz-questions.query-type-orm.repository';
import { UpdateQuestionDto } from '../../dto/update-question.dto';
import { QuestionInputModel } from '../../dto/inputModels/question.input.model';

export class UpdateQuestionCommand {
  constructor(
    public questionId: string,
    public inputUpdateData: QuestionInputModel,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(
    private quizQuestionRepository: QuizQuestionTypeOrmRepository,
    private quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
  ) {}
  async execute(command: UpdateQuestionCommand) {
    const { questionId, inputUpdateData } = command;
    const updateData: UpdateQuestionDto = {
      body: inputUpdateData.body,
      correctAnswers: inputUpdateData.correctAnswers,
    };
    const questionModel =
      await this.quizQuestionsQueryTypeOrmRepository.getQuestionModelById(
        questionId,
      );
    questionModel.update(updateData);
    return !!(await this.quizQuestionRepository.save(questionModel));
  }
}
