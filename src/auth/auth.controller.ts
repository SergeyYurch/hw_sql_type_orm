import {
  Body,
  Controller,
  Ip,
  Post,
  Headers,
  Res,
  Get,
  UseGuards,
  Req,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginInputModel } from './dto/login.input.model';
import { Response, Request } from 'express';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';
import { UserInputModel } from '../users/dto/input-models/user-input-model';
import { RegistrationConfirmationCodeInputModel } from './dto/registration-confirmation-code.input.model';
import { RegistrationEmailResendingInputModel } from './dto/registration-email-resending.input.model';
import { PasswordRecoveryInputModel } from './dto/password-recovery.input.model';
import { NewPasswordRecoveryInputModel } from './dto/new-password-recovery.input.model';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUserJwtInfo } from '../common/decorators/current-user.param.decorator';
import { JwtPayloadType } from '../blogs/types/jwt-payload.type';
import { CommandBus } from '@nestjs/cqrs';
import { SignInCommand } from './providers/use-cases/sign-in-use-case';
import { LogoutCommand } from './providers/use-cases/logout-use-case';
import { RefreshTokenCommand } from './providers/use-cases/refresh-token-use-cases';
import { RegistrationUserCommand } from '../users/providers/use-cases/registration-user-use-case';
import { RegistrationConfirmationCommand } from './providers/use-cases/registration-confirmation-use-case';
import { RegistrationEmailResendingCommand } from './providers/use-cases/registration-email-resending-use-case';
import { PasswordRecoveryCommand } from './providers/use-cases/password-recovery-use-case';
import { SetNewPasswordCommand } from './providers/use-cases/set-new-password-use-case';
import { UsersQueryTypeormRepository } from '../users/providers/users.query-typeorm.repository';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private usersQueryRepository: UsersQueryTypeormRepository,
    private commandBus: CommandBus,
  ) {}

  @SkipThrottle()
  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getAuthInfo(@CurrentUserJwtInfo() { userId }: JwtPayloadType) {
    const result = await this.usersQueryRepository.getMeInfo(userId);
    if (!result) {
      throw new UnauthorizedException();
    }
    return result;
  }

  // @UseGuards(LocalAuthGuard)
  // @SkipThrottle()
  @HttpCode(200)
  @Post('/login')
  async signIn(
    @Body() loginDto: LoginInputModel,
    @Ip() ip: string,
    @Headers('X-Forwarded-For') title: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken, expiresDate } =
      await this.commandBus.execute(
        new SignInCommand(loginDto.loginOrEmail, loginDto.password, ip, title),
      );
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(expiresDate),
      secure: true,
      httpOnly: true,
    });
    console.log(
      `[AuthController]/signIn: login  user: ${loginDto.loginOrEmail}, refreshToken: ${refreshToken}`,
    );
    return { accessToken: accessToken };
  }

  @SkipThrottle()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const { userId, deviceId } = req.user;
    await this.commandBus.execute(new LogoutCommand(userId, deviceId));
    res.clearCookie('refreshToken');
    return res.sendStatus(204);
  }

  @SkipThrottle()
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-token')
  async refreshTokens(
    @Ip() ip: string,
    @Headers('X-Forwarded-For') title: string,
    @Res() res: Response, //{ passthrough: true }
    @CurrentUserJwtInfo() { userId, deviceId }: JwtPayloadType,
  ) {
    console.log(
      `[AuthController]/POST:/refresh-token:userID: ${userId}, deviceId:${deviceId}`,
    );
    const { accessToken, refreshToken, expiresDate } =
      await this.commandBus.execute(new RefreshTokenCommand(userId, deviceId));
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(expiresDate),
      secure: true,
      httpOnly: true,
    });
    return res.status(200).json({ accessToken: accessToken });
  }

  @HttpCode(204)
  @Post('/registration')
  async registration(@Body() userInputDto: UserInputModel) {
    await this.commandBus.execute(new RegistrationUserCommand(userInputDto));
  }

  @HttpCode(204)
  @Post('/registration-confirmation')
  async registrationConfirmation(
    @Body() codeDto: RegistrationConfirmationCodeInputModel,
  ) {
    await this.commandBus.execute(
      new RegistrationConfirmationCommand(codeDto.code),
    );
  }

  @HttpCode(204)
  @Post('/registration-email-resending')
  async registrationEmailResending(
    @Body() emailResendingDto: RegistrationEmailResendingInputModel,
  ) {
    await this.commandBus.execute(
      new RegistrationEmailResendingCommand(emailResendingDto.email),
    );
  }

  @HttpCode(204)
  @Post('/password-recovery')
  async passwordRecovery(
    @Body() passwordRecoveryDto: PasswordRecoveryInputModel,
  ) {
    await this.commandBus.execute(
      new PasswordRecoveryCommand(passwordRecoveryDto.email),
    );
  }

  @HttpCode(204)
  @Post('/new-password')
  async newPassword(@Body() newPasswordDto: NewPasswordRecoveryInputModel) {
    await this.commandBus.execute(
      new SetNewPasswordCommand(
        newPasswordDto.recoveryCode,
        newPasswordDto.newPassword,
      ),
    );
  }

  @HttpCode(204)
  @Get('/test')
  async test() {
    await this.usersQueryRepository.test();
  }
}
