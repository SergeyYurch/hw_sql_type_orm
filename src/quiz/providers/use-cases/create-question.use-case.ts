import { QuestionInputModel } from '../../dto/inputModels/question.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateQuestionCommand {
  constructor(public inputQuestionDto: QuestionInputModel) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  async execute(command: CreateQuestionCommand) {
    const { inputQuestionDto } = command;
    return true;
  }
}
