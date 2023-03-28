import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { tokenService } from '../../auth/providers/token.service';
import { UsersQuerySqlRepository } from '../../users/providers/users.query-sql.repository';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: tokenService,
    private usersQueryRepository: UsersQuerySqlRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || 11,
    });
  }

  async validate(payload: any) {
    console.log('AccessTokenStrategy');
    const { userId } = payload;
    if (!(await this.usersQueryRepository.doesUserIdExist(userId))) {
      console.log('AccessTokenStrategy throw forbidden by doesUserIdExist');
      throw new ForbiddenException('Forbidden');
    }
    return payload;
  }
}
