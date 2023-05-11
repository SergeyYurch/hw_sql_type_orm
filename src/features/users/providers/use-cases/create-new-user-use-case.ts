import { Injectable } from '@nestjs/common';
import { UserInputModel } from '../../dto/input-models/user-input-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCreatDto } from '../../dto/user-creat.dto';
import { UsersService } from '../users.service';
import { UsersTypeOrmRepository } from '../users.typeorm.repository';
import { User } from '../../domain/user';

export class CreateNewUserCommand {
  constructor(public userInputModel: UserInputModel) {}
}

@Injectable()
@CommandHandler(CreateNewUserCommand)
export class CreateNewUserUseCase
  implements ICommandHandler<CreateNewUserCommand>
{
  constructor(
    private readonly usersRepository: UsersTypeOrmRepository,
    private readonly usersService: UsersService,
  ) {}
  async execute(command: CreateNewUserCommand): Promise<User> {
    const { userInputModel } = command;
    const { login, email, password } = userInputModel;
    const passwordSalt = await this.usersService.getPasswordSalt();
    const passwordHash = await this.usersService.getPasswordHash(
      password,
      passwordSalt,
    );
    const user: UserCreatDto = {
      login,
      email,
      passwordSalt,
      passwordHash,
      isConfirmed: true,
    };
    const userModel = await this.usersRepository.createUserModel();
    await userModel.initialize(user);
    return await this.usersRepository.save(userModel);
  }
}
