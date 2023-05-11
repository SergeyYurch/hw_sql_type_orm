import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserInputModel } from '../../dto/input-models/ban -user-input-model.dto';
import { UsersTypeOrmRepository } from '../users.typeorm.repository';

export class BanUserCommand {
  constructor(
    public userId: string,
    public banUserInputModel: BanUserInputModel,
  ) {}
}

@Injectable()
@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(private readonly usersRepository: UsersTypeOrmRepository) {}
  async execute(command: BanUserCommand) {
    console.log('BanUserCommand');
    const { userId, banUserInputModel } = command;
    const { isBanned, banReason } = banUserInputModel;
    const userModel = await this.usersRepository.getUserModel(userId);
    userModel.ban(isBanned, banReason, 'saId');
    await this.usersRepository.save(userModel);
  }
}
