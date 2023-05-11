import { Question } from '../domain/question';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../entities/quiz-question.entity';
import { Repository } from 'typeorm';

export class QuizQuestionTypeOrmRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private quizQuestionRepository: Repository<QuizQuestionEntity>,
  ) {}
  async save(questionModel: Question) {
    const questionEntity = new QuizQuestionEntity();
    if (questionModel.id) questionEntity.id = +questionModel.id;
    questionEntity.body = questionModel.body;
    questionEntity.correctAnswers = questionModel.correctAnswers;
    questionEntity.createdAt = questionModel.createdAt;
    questionEntity.updatedAt = questionModel.updatedAt || null;
    questionEntity.published = questionModel.published;
    const result = await this.quizQuestionRepository.save(questionEntity);
    return result.id;
  }

  async delete(questionId: string): Promise<boolean> {
    const result = await this.quizQuestionRepository.delete({
      id: +questionId,
    });
    return result.affected === 1;
  }
}
