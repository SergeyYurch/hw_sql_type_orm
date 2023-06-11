import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from '../../features/blogs/types/jwt-payload.type';

@Injectable()
export class CheckUserIdMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      return next();
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
      const payload = <JwtPayloadType>(
        this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET })
      );
      if (payload) {
        req.user = payload;
      }
      return next();
    } catch (e) {
      return next();
    }
  }
}
