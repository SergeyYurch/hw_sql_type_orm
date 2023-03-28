import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { SecurityService } from './providers/security.service';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';
import { Request } from 'express';
import { CurrentUserJwtInfo } from '../common/decorators/current-user.param.decorator';
import { JwtPayloadType } from '../blogs/types/jwt-payload.type';
import { CommandBus } from '@nestjs/cqrs';
import { GetSessionsByUserIdCommand } from './providers/use-cases/get-sessions-by-user-id.use-case';
import { DeleteAllSessionExcludeCurrentCommand } from './providers/use-cases/delete-all-sessions-exclude-current.use-case';
import { DeleteSessionByIdCommand } from './providers/use-cases/delete-session-by-id.use-case';

@UseGuards(RefreshTokenGuard)
@Controller('security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
    private commandBus: CommandBus,
  ) {}

  @Get('devices')
  async getDeviceSessions(@Req() req: Request) {
    console.log('get:/devices');
    const userId = req.user.userId;
    return await this.commandBus.execute(
      new GetSessionsByUserIdCommand(userId),
    );
  }

  @HttpCode(204)
  @Delete('devices')
  async deleteOtherDeviceSessions(@Req() req: Request) {
    const { deviceId, userId } = req.user;
    return await this.commandBus.execute(
      new DeleteAllSessionExcludeCurrentCommand(deviceId, userId),
    );
  }

  @HttpCode(204)
  @Delete('devices/:deviceId')
  async deleteDeviceSession(
    @Param('deviceId') deviceId: string,
    @CurrentUserJwtInfo() userInfo: JwtPayloadType,
  ) {
    const { userId } = userInfo;
    await this.commandBus.execute(
      new DeleteSessionByIdCommand(deviceId, userId),
    );
  }
}
