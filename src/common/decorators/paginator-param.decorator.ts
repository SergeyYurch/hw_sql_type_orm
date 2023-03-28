import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { PaginatorInputType } from '../dto/input-models/paginator.input.type';
import { validate } from 'class-validator';

export const PaginatorParam = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const paginatorParams = new PaginatorInputType();

    paginatorParams.pageNumber = req.query.pageNumber
      ? +req.query.pageNumber
      : 1;
    paginatorParams.pageSize = req.query.pageSize ? +req.query.pageSize : 10;
    paginatorParams.sortBy = req.query.sortBy
      ? String(req.query.sortBy)
      : 'createdAt';
    paginatorParams.sortDirection = req.query.sortDirection
      ? (req.query.sortDirection as 'desc' | 'asc')
      : 'desc';
    const errors = await validate(paginatorParams, { stopAtFirstError: true });
    // errors is an array of validation errors
    console.log(errors);
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
