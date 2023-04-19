import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionInputModel } from './dto/inputModels/question.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from './providers/use-cases/create-question.use-case';
import { QuizQuestionsQueryTypeOrmRepository } from './providers/quiz-questions.query-type-orm.repository';

@UseGuards(AuthGuard('basic'))
@Controller('sa/quiz/questions')
export class SaQuizQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private readonly quizQuestionsQueryTypeOrmRepository: QuizQuestionsQueryTypeOrmRepository,
  ) {}
  @Get()
  async getQuestions() {
    return true;
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
  async updateQuestion() {
    return true;
  }

  @Put(':id/publish')
  @HttpCode(204)
  async publishQuestion() {
    return true;
  }
}
