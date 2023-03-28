import { CommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../users.sql.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersSqlRepository) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    return this.usersRepository.deleteUser(command.userId);
  }
}
