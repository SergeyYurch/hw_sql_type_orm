import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { QuizQuestionsQueryTypeOrmRepository } from '../../features/quiz/providers/quiz-questions.query-type-orm.repository';

@Injectable()
export class CheckQuestionIdGuard implements CanActivate {
  constructor(
    private quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CheckQuestionIdGuard');
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    if (!Number.isInteger(+id)) throw new NotFoundException();
    if (+id < 0) throw new NotFoundException();
    if (
      !(await this.quizQuestionsQueryTypeOrmRepository.doesQuestionIdExist(id))
    ) {
      throw new NotFoundException();
    }
    return true;
  }
}
