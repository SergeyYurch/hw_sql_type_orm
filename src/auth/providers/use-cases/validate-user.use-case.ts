import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../users/providers/users.sql.repository';
import { UnauthorizedException } from '@nestjs/common';
import { UNAUTHORIZED_MESSAGE } from '../../constants/auth.constant';
import { UsersService } from '../../../users/providers/users.service';
import { UsersQuerySqlRepository } from '../../../users/providers/users.query-sql.repository';

export class ValidateUserCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}
@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(
    private userRepository: UsersSqlRepository,
    private userQueryRepository: UsersQuerySqlRepository,
    private usersService: UsersService,
  ) {}

  async execute(command: ValidateUserCommand) {
    const { loginOrEmail, password } = command;
    const user = await this.userQueryRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );
    let passwordSalt: string;
    let passwordHash: string;
    if (user) {
      passwordSalt = user.accountData.passwordSalt;
      passwordHash = await this.usersService.getPasswordHash(
        password,
        passwordSalt,
      );
    }
    if (
      !user ||
      user.banInfo.isBanned ||
      !(await user.validateCredentials(passwordHash))
    ) {
      throw new UnauthorizedException([
        { message: UNAUTHORIZED_MESSAGE, field: 'loginOrEmail' },
      ]);
    }
    return user;
  }
}
