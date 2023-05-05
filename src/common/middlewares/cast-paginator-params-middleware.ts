import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CastPaginatorParamsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.paginatorParams = {
      pageNumber: req.query.pageNumber ? +req.query.pageNumber : 1,
      pageSize: req.query.pageSize ? +req.query.pageSize : 10,
      sortBy: req.query.sortBy ? String(req.query.sortBy) : 'createdAt',
      sortDirection: req.query.sortDirection
        ? (req.query.sortDirection as 'desc' | 'asc')
        : 'desc',
      sort: [],
    };
    next();
  }
}
