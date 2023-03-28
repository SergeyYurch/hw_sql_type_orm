import { PipeTransform, Injectable } from '@nestjs/common';
import { PaginatorInputType } from '../dto/input-models/paginator.input.type';

@Injectable()
export class CastPaginatorParamsPipe implements PipeTransform {
  async transform(query) {
    const queryParams = new PaginatorInputType();
    queryParams.pageNumber = query.pageNumber ? +query.pageNumber : 1;
    queryParams.pageSize = 44; // query.pageSize ? +query.pageSize : 10;
    queryParams.sortBy = query.sortBy ?? 'createdAt';
    queryParams.sortDirection = query.sortDirection ?? 'desc';
    query.paginatorParams = queryParams;
    return query;
  }
}
