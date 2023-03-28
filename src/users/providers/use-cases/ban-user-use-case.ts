import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserInputModel } from '../../dto/input-models/ban -user-input-model.dto';
import { BanCommentCommand } from '../../../comments/providers/use-cases/ban-comment-use-case';
import { BanCommentLikesCommand } from '../../../comments/providers/use-cases/ban-comment-likes-use-case';
import { BanPostLikesCommand } from '../../../posts/providers/use-cases/ban-post-likes-use-case';
import { BanPostsCommand } from '../../../posts/providers/use-cases/ban-posts-use-case';
import { UsersSqlRepository } from '../users.sql.repository';

export class BanUserCommand {
  constructor(
    public userId: string,
    public banUserInputModel: BanUserInputModel,
  ) {}
}

@Injectable()
@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private readonly usersRepository: UsersSqlRepository,
    private commandBus: CommandBus,
  ) {}
  async execute(command: BanUserCommand) {
    console.log('BanUserCommand');
    const { userId, banUserInputModel } = command;
    const { isBanned, banReason } = banUserInputModel;
    // await this.commandBus.execute(new BanCommentCommand(userId, isBanned));
    // await this.commandBus.execute(new BanCommentLikesCommand(userId, isBanned));
    // await this.commandBus.execute(new BanPostsCommand({ userId, isBanned }));
    // await this.commandBus.execute(new BanPostLikesCommand(userId, isBanned));
    const userModel = await this.usersRepository.getUserModel(userId);
    await userModel.ban(isBanned, banReason, 'saId');
    return await this.usersRepository.save(userModel);
  }
}
