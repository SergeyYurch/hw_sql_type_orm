import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { tokenService } from '../token.service';
import { UsersSqlRepository } from '../../../users/providers/users.sql.repository';
import { ValidateUserCommand } from './validate-user.use-case';

export class SignInCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
    public ip = '0.0.0.0',
    public title = 'no data',
  ) {}
}

@CommandHandler(SignInCommand)
export class SignInUseCase implements ICommandHandler<SignInCommand> {
  constructor(
    private authService: tokenService,
    private userRepository: UsersSqlRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: SignInCommand) {
    const { title, password, loginOrEmail, ip } = command;
    const userModel = await this.commandBus.execute(
      new ValidateUserCommand(loginOrEmail, password),
    );
    const deviceId = uuidv4();
    const { accessToken, refreshToken, expiresDate, lastActiveDate } =
      await this.authService.getTokens(userModel.id, deviceId);
    await userModel.signIn(deviceId, ip, title, expiresDate, lastActiveDate);
    await this.userRepository.save(userModel);
    return { accessToken, refreshToken, expiresDate };
  }
}
