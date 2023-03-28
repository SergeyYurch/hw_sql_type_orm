import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { tokenService } from '../../auth/providers/token.service';
import { UsersQuerySqlRepository } from '../../users/providers/users.query-sql.repository';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateUserDeviceSessionCommand } from '../../auth/providers/use-cases/validate-user-device-session.use-case';
import { JwtPayloadType } from '../../blogs/types/jwt-payload.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private jwtService: JwtService,
    private authService: tokenService,
    private usersQueryRepository: UsersQuerySqlRepository,
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
    console.log(req.cookies['refreshToken']);
    if (req.cookies && 'refreshToken' in req.cookies) {
      return req.cookies['refreshToken'];
    }
    return null;
  }

  async validate(payload: any) {
    const jwtPayload: JwtPayloadType = <JwtPayloadType>(
      this.jwtService.decode(payload.cookies['refreshToken'])
    );
    const { userId } = jwtPayload;
    if (!(await this.usersQueryRepository.doesUserIdExist(userId))) {
      throw new ForbiddenException('Forbidden');
    }
    const deviceIdIsValid = await this.commandBus.execute(
      new ValidateUserDeviceSessionCommand(jwtPayload),
    );
    if (!deviceIdIsValid) {
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
