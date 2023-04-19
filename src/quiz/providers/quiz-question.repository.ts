import { Question } from '../domain/question';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../entities/quiz-question.entity';
import { Repository } from 'typeorm';

export class QuizQuestionRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private quizQuestionRepository: Repository<QuizQuestionEntity>,
  ) {}
  async save(questionModel: Question) {
    const questionEntity = new QuizQuestionEntity();
    if (questionModel.id) questionEntity.id = questionModel.id;
    questionEntity.body = questionModel.body;
    questionEntity.correctAnswers = questionModel.correctAnswers;
    questionEntity.createdAt = questionModel.createdAt;
    questionEntity.updatedAt = questionModel.updatedAt;
    questionEntity.published = questionModel.published;

    await this.quizQuestionRepository.save(questionEntity);
    return questionEntity.id;
  }
}
