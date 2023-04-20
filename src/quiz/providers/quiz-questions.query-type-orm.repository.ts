import { Question } from '../domain/question';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../entities/quiz-question.entity';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { QuestionViewModel } from '../dto/viewModels/question.view.model';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { BlogEntity } from '../../blogs/entities/blog.entity';
import { pagesCount } from '../../common/helpers/helpers';

export class QuizQuestionsQueryTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(QuizQuestionEntity)
    private quizQuestionRepository: Repository<QuizQuestionEntity>,
  ) {}

  async doesQuestionIdExist(id: string) {
    const queryString = `
              SELECT EXISTS (SELECT * 
              FROM quiz_questions 
              WHERE id=${+id});
             `;
    console.log(queryString);
    const queryResult = await this.dataSource.query(queryString);
    return queryResult[0].exists;
  }
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

  async find(
    paginatorParams: PaginatorInputType,
    publishedStatus: string,
    bodySearchTerm?: string,
  ): Promise<[QuizQuestionEntity[], number]> {
    const { sortBy, sortDirection, pageSize, pageNumber } = paginatorParams;
    const findOptionsWhere: FindOptionsWhere<BlogEntity> = {};
    if (publishedStatus !== 'all') {
      findOptionsWhere['published'] = publishedStatus === 'published';
    }
    if (bodySearchTerm) {
      findOptionsWhere['body'] = ILike(`%${bodySearchTerm}%`);
    }
    console.log(findOptionsWhere);
    const findOptions: FindManyOptions<QuizQuestionEntity> = {
      order: { [sortBy]: sortDirection },
      where: findOptionsWhere,
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    };
    return await this.quizQuestionRepository.findAndCount(findOptions);
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
      updatedAt: model.updatedAt
        ? new Date(model.updatedAt).toISOString()
        : null,
      published: model.published,
      id: model.id,
    };
  }

  async getQuestionModel(id: string) {
    const questionEntity = await this.findById(+id);
    if (!questionEntity) return null;
    return this.castToQuestionModel(questionEntity);
  }

  async getQuestions(
    paginatorParams: PaginatorInputType,
    publishedStatus: string,
    bodySearchTerm?: string,
  ) {
    const { pageSize, pageNumber } = paginatorParams;

    const [questionEntities, totalCount] = await this.find(
      paginatorParams,
      publishedStatus,
      bodySearchTerm,
    );
    const items = [];
    for (const q of questionEntities) {
      const qModel = this.castToQuestionModel(q);
      items.push(this.castToViewModel(qModel));
    }
    return {
      pagesCount: pagesCount(totalCount, pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }
}
