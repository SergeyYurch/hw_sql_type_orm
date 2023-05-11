import { QuestionInputModel } from '../../dto/inputModels/question.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../../dto/create-question.dto';
import { Question } from '../../domain/question';
import { QuizQuestionTypeOrmRepository } from '../quiz-question.type-orm.repository';

export class CreateQuestionCommand {
  constructor(public inputQuestionDto: QuestionInputModel) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(private quizQuestionRepository: QuizQuestionTypeOrmRepository) {}
  async execute(command: CreateQuestionCommand) {
    const { inputQuestionDto } = command;
    const createQuestion: CreateQuestionDto = {
      body: inputQuestionDto.body,
      correctAnswers: inputQuestionDto.correctAnswers,
    };
    return this.quizQuestionRepository.save(new Question(createQuestion));
  }
}
