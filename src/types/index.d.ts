import { JwtPayloadType } from '../blogs/types/jwt-payload.type';
import { PaginatorInputType } from '../common/dto/input-models/paginator.input.type';

declare global {
  declare namespace Express {
    export interface User {
      userId: string;
      deviceId: string;
      iat: number;
      exp: number;
    }
    export interface Request {
      jwtPayload: JwtPayloadType;
      paginatorParams: PaginatorInputType;
    }
  }
}
