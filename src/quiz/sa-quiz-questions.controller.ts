import { Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('basic'))
@Controller('sa/quiz/questions')
export class SaQuizQuestionsController {
  @Get()
  async getQuestions() {
    return true;
  }
  @Post()
  async createQuestion() {
    return true;
  }

  @Delete(':id')
  async deleteQuestion() {
    return true;
  }

  @Put(':id')
  async updateQuestion() {
    return true;
  }

  @Put(':id/publish')
  async publishQuestion() {
    return true;
  }
}
