import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { tokenService } from '../../features/auth/providers/token.service';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateUserDeviceSessionCommand } from '../../features/auth/providers/use-cases/validate-user-device-session.use-case';
import { JwtPayloadType } from '../../features/blogs/types/jwt-payload.type';
import { UsersQueryTypeormRepository } from '../../features/users/providers/users.query-typeorm.repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private jwtService: JwtService,
    private authService: tokenService,
    private usersQueryRepository: UsersQueryTypeormRepository,
    private commandBus: CommandBus,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.extractJWT,
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && 'refreshToken' in req.cookies) {
      return req.cookies['refreshToken'];
    }
    console.log('RefreshTokenStrategy: cookies does not found');
    return null;
  }

  async validate(payload: any) {
    const jwtPayload: JwtPayloadType = <JwtPayloadType>(
      this.jwtService.decode(payload.cookies['refreshToken'])
    );
    const { userId } = jwtPayload;
    if (!(await this.usersQueryRepository.doesUserIdExist(userId))) {
      console.log(
        'RefreshTokenStrategy: refreshToken is invalid, user does not exist',
      );
      throw new ForbiddenException('Forbidden');
    }
    const deviceIdIsValid = await this.commandBus.execute(
      new ValidateUserDeviceSessionCommand(jwtPayload),
    );
    if (!deviceIdIsValid) {
      console.log('RefreshTokenStrategy:deviceId is not valid');

      throw new UnauthorizedException();
    }
    return {
      userId: jwtPayload.userId,
      deviceId: jwtPayload.deviceId,
      iat: jwtPayload.iat,
      exp: jwtPayload.exp,
    };
  }
}
