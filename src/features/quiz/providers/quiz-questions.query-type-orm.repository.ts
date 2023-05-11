import { Question } from '../domain/question';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../entities/quiz-question.entity';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { QuestionViewModel } from '../dto/viewModels/question.view.model';
import { PaginatorInputType } from '../../../common/dto/input-models/paginator.input.type';
import { BlogEntity } from '../../blogs/entities/blog.entity';
import { pagesCount } from '../../../common/helpers/helpers';

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
    const queryResult = await this.dataSource.query(queryString);
    return queryResult[0].exists;
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

  async getQuestionModelById(id: string) {
    const questionEntity = await this.findById(+id);
    if (!questionEntity) return null;
    return this.castToQuestionModel(questionEntity);
  }

  async getQuestionViewById(id: string) {
    const questionModel = await this.getQuestionModelById(id);
    if (!questionModel) return null;
    return this.castToViewModel(questionModel);
  }

  async getSetOfRandomQuestionModels(count: number) {
    const ids = await this.getSetRandomIdsOfQuestions(count);
    return await this.getQuestionModelsByIds(ids);
  }

  async getQuestionModelsByIds(ids: number[]) {
    const setOfQuestionEntities = await this.quizQuestionRepository.findBy({
      id: In(ids),
    });
    return setOfQuestionEntities.map((qe) => this.castToQuestionModel(qe));
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

  async getSetRandomIdsOfQuestions(count: number) {
    const result = await this.quizQuestionRepository.find({
      select: { id: true },
      where: { published: true },
    });
    const allIds = result.map((q) => +q.id);
    const questionSet = [];
    while (questionSet.length < count) {
      const n = Math.floor(Math.random() * allIds.length);
      if (!questionSet.includes(allIds[n])) questionSet.push(allIds[n]);
    }
    return questionSet;
  }
}
