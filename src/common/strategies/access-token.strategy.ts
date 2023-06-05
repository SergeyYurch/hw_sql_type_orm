import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersQueryTypeormRepository } from '../../features/users/providers/users.query-typeorm.repository';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(private usersQueryRepository: UsersQueryTypeormRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('AccessTokenStrategy');
    const { userId } = payload;
    console.log(`user id:${userId} was logged in`);
    if (!(await this.usersQueryRepository.doesUserIdExist(userId))) {
      console.log('AccessTokenStrategy throw forbidden by doesUserIdExist');
      throw new ForbiddenException('Forbidden');
    }
    return payload;
  }
}
