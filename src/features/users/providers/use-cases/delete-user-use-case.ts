import { CommandHandler } from '@nestjs/cqrs';
import { UsersTypeOrmRepository } from '../users.typeorm.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersTypeOrmRepository) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    return this.usersRepository.deleteUser(command.userId);
  }
}
