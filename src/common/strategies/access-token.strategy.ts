import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { tokenService } from '../../features/auth/providers/token.service';
import { UsersQueryTypeormRepository } from '../../features/users/providers/users.query-typeorm.repository';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: tokenService,
    private usersQueryRepository: UsersQueryTypeormRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
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
