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
    const questionModel = await this.getQuestionModel(id);
    if (!questionModel) return null;
    return this.castToViewModel(questionModel);
  }

  async findById(id: number) {
    return await this.quizQuestionRepository.findOne({
      where: { id },
    });
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

  async getQuestionModel(id: string) {
    const questionEntity = await this.findById(+id);
    if (!questionEntity) return null;
    return this.castToQuestionModel(questionEntity);
  }
}
