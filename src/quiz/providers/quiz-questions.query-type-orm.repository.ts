import { Question } from '../domain/question';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../entities/quiz-question.entity';
import { Repository } from 'typeorm';
import { QuestionViewModel } from '../dto/viewModels/question.view.model';

export class QuizQuestionsQueryTypeOrmRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private quizQuestionRepository: Repository<QuizQuestionEntity>,
  ) {}
  async getQuestionById(id: string) {
    const questionEntity = await this.quizQuestionRepository.findOne({
      where: { id: +id },
    });
    if (!questionEntity) return null;
    const questionModel = this.castToQuestionModel(questionEntity);
    return this.castToViewModel(questionModel);
  }

  castToQuestionModel(entity: QuizQuestionEntity): Question {
    const questionModel = new Question({
      body: entity.body,
      correctAnswers: entity.correctAnswers,
    });
    questionModel.updatedAt = +entity.updatedAt;
    questionModel.createdAt = +entity.createdAt;
    questionModel.published = entity.published;
    questionModel.id = entity.id.toString();
    return questionModel;
  }

  castToViewModel(model: Question): QuestionViewModel {
    return {
      body: model.body,
      correctAnswers: model.correctAnswers,
      createdAt: new Date(model.createdAt).toISOString(),
      updatedAt: new Date(model.updatedAt).toISOString(),
      published: model.published,
      id: model.id,
    };
  }
}
