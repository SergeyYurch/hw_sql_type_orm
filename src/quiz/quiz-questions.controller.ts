import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller('quiz/quiestions')
export class QuizQuestionsController {
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
