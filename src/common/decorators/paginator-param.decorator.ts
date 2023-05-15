import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { PaginatorInputType } from '../dto/input-models/paginator.input.type';
import { validate } from 'class-validator';
import { PaginatorType } from '../types/paginator.type';
import { SortParamType } from '../types/sort-param.type';
import { SortDirectionEnum } from '../types/sort-direction.enum';

export const PaginatorParam = createParamDecorator(
  async (
    defaultValues: PaginatorType | undefined,
    context: ExecutionContext,
  ) => {
    const castSortParam = (param: string): SortParamType => {
      const constituents = param.split(' ');
      let sortDirection: SortDirectionEnum;
      switch (constituents[1].toLowerCase()) {
        case 'desc':
          sortDirection = SortDirectionEnum.DESK;
          break;
        case 'asc':
          sortDirection = SortDirectionEnum.ASC;
          break;
        default:
          sortDirection = undefined;
      }
      if (!sortDirection) return;
      return {
        [constituents[0]]: sortDirection,
      };
    };
    const paginatorParams = new PaginatorInputType();
    const req = context.switchToHttp().getRequest();
    const sortParam = req.query.sort || ['avgScores desc', 'sumScore desc'];
    if (Array.isArray(sortParam)) {
      sortParam.forEach((p) => {
        if (castSortParam(p)) {
          paginatorParams.sort ??= [];
          paginatorParams.sort = [...paginatorParams.sort, castSortParam(p)];
        }
      });
    }
    if (typeof sortParam === 'string') {
      const param = castSortParam(sortParam);
      if (param) paginatorParams.sort = [param];
    }
    paginatorParams.sort ??= [
      { avgScores: SortDirectionEnum.DESK },
      { sumScore: SortDirectionEnum.DESK },
    ];
    paginatorParams.pageNumber =
      +req.query.pageNumber || defaultValues?.pageNumber || 1;
    paginatorParams.pageSize =
      +req.query.pageSize || defaultValues?.pageSize || 10;

    console.log('t33');
    console.log(typeof req.query.sortBy);
    if (typeof req.query.sortBy === 'string') {
      paginatorParams.sortBy = String(req.query.sortBy);
    }

    paginatorParams.sortBy ??= defaultValues?.sortBy || 'createdAt';

    paginatorParams.sortDirection = req.query.sortDirection
      ? (req.query.sortDirection as 'desc' | 'asc')
      : (defaultValues?.sortDirection as 'desc' | 'asc') || 'desc';
    const errors = await validate(paginatorParams, {
      stopAtFirstError: true,
    });
    // errors is an array of validation errors
    if (errors.length > 0) {
      const errorsForResponse = [];
      for (const e of errors) {
        const key = Object.keys(e.constraints)[0];
        errorsForResponse.push({
          message: e.constraints[key],
          field: e.property,
        });
      }
      throw new BadRequestException(errorsForResponse);
    }
    return paginatorParams;
  },
);
