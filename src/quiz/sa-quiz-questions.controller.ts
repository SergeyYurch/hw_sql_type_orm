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
import { PublishQuestionCommand } from './providers/use-cases/publish-question.use-case';
import { PublishInputModel } from './dto/inputModels/publish.input.model';
import { CheckQuestionIdGuard } from '../common/guards/check-question-id-guard.service';
import { DeleteQuestionCommand } from './providers/use-cases/delete-question.use-case';

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

  @UseGuards(CheckQuestionIdGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteQuestion(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteQuestionCommand(id));
  }

  @UseGuards(CheckQuestionIdGuard)
  @Put(':id')
  @HttpCode(204)
  async updateQuestion(
    @Body() updateData: QuestionInputModel,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(new UpdateQuestionCommand(id, updateData));
  }
  @UseGuards(CheckQuestionIdGuard)
  @Put(':id/publish')
  @HttpCode(204)
  async publishQuestion(
    @Body() data: PublishInputModel,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(
      new PublishQuestionCommand(id, data.published),
    );
  }
}
