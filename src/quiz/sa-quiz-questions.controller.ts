import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionInputModel } from './dto/inputModels/question.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from './providers/use-cases/create-question.use-case';
import { QuizQuestionsQueryTypeOrmRepository } from './providers/quiz-questions.query-type-orm.repository';
import { UpdateQuestionCommand } from './providers/use-cases/update-question.use-case';
import { PaginatorParam } from '../common/decorators/paginator-param.decorator';
import { PaginatorInputType } from '../common/dto/input-models/paginator.input.type';

@UseGuards(AuthGuard('basic'))
@Controller('sa/quiz/questions')
export class SaQuizQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private readonly quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
  ) {}
  @Get()
  async getQuestions(
    @Query('bodySearchTerm') bodySearchTerm: string,
    @Query('publishedStatus') publishedStatus = 'all',
    @PaginatorParam() paginatorParams: PaginatorInputType,
  ) {
    return await this.quizQuestionsQueryTypeOrmRepository.getQuestions(
      paginatorParams,
      publishedStatus,
      bodySearchTerm,
    );
  }

  @Post()
  async createQuestion(@Body() question: QuestionInputModel) {
    const questionId = await this.commandBus.execute(
      new CreateQuestionCommand(question),
    );
    return this.quizQuestionsQueryTypeOrmRepository.getQuestionById(questionId);
  }

  @Delete(':id')
  async deleteQuestion() {
    return true;
  }

  @Put(':id')
  @HttpCode(204)
  async updateQuestion(
    @Body() updateData: QuestionInputModel,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(new UpdateQuestionCommand(id, updateData));
  }

  @Put(':id/publish')
  @HttpCode(204)
  async publishQuestion() {
    return true;
  }
}
