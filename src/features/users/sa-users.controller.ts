import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserInputModel } from './dto/input-models/user-input-model';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateNewUserCommand,
  CreateNewUserUseCase,
} from './providers/use-cases/create-new-user-use-case';
import { DeleteUserCommand } from './providers/use-cases/delete-user-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UsersService } from './providers/users.service';
import { BanUserInputModel } from './dto/input-models/ban -user-input-model.dto';
import { BanUserCommand } from './providers/use-cases/ban-user-use-case';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { PaginatorParam } from '../../common/decorators/paginator-param.decorator';
import { CheckUserIdBannedIncludeGuard } from '../../common/guards/check-user-id-banned-include.guard';
import { UsersQueryTypeormRepository } from './providers/users.query-typeorm.repository';
import { User } from './domain/user';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sa/users')
@UseGuards(AuthGuard('basic'))
@Controller('sa/users')
export class SaUsersController {
  constructor(
    private commandBus: CommandBus,
    private userService: UsersService,
    private createNewUserUseCase: CreateNewUserUseCase,
    private usersQueryRepository: UsersQueryTypeormRepository,
  ) {}

  @UseGuards(CheckUserIdBannedIncludeGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':userId/ban')
  async banUser(
    @Body() banUserInputModel: BanUserInputModel,
    @Param('userId') userId: string,
  ) {
    await this.commandBus.execute(
      new BanUserCommand(userId, banUserInputModel),
    );
  }

  @Post()
  async createUser(@Body() userInputDto: UserInputModel) {
    const user: User = await this.commandBus.execute(
      new CreateNewUserCommand(userInputDto),
    );
    return this.usersQueryRepository.getUserViewById(user.id, true);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getUsers(
    @Query('banStatus') banStatus = 'all',
    @Query('searchLoginTerm') searchLoginTerm: string,
    @Query('searchEmailTerm') searchEmailTerm: string,
    @PaginatorParam() paginatorParams: PaginatorInputType,
  ) {
    return await this.usersQueryRepository.findUsers(
      paginatorParams,
      searchLoginTerm,
      searchEmailTerm,
      banStatus,
      true,
    );
  }

  @UseGuards(CheckUserIdBannedIncludeGuard)
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('userId') userId: string) {
    await this.commandBus.execute(new DeleteUserCommand(userId));
  }
}
