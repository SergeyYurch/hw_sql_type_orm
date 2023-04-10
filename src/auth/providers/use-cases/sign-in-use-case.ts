import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { tokenService } from '../token.service';
import { ValidateUserCommand } from './validate-user.use-case';
import { UsersTypeOrmRepository } from '../../../users/providers/users.typeorm.repository';
import { User } from '../../../users/domain/user';

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
    private userRepository: UsersTypeOrmRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: SignInCommand) {
    const { title, password, loginOrEmail, ip } = command;
    const userModel: User = await this.commandBus.execute(
      new ValidateUserCommand(loginOrEmail, password),
    );
    const deviceId = uuidv4();
    const { accessToken, refreshToken, expiresDate, lastActiveDate } =
      await this.authService.getTokens(userModel.id, deviceId);
    userModel.signIn(deviceId, ip, title, expiresDate, lastActiveDate);
    await this.userRepository.save(userModel);
    return { accessToken, refreshToken, expiresDate };
  }
}
