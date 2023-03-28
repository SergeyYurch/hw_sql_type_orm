import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from './providers/users.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { BloggerBanUserInputModel } from './dto/input-models/blogger-ban -user-input-model.dto';
import { BloggerBanUserCommand } from '../blogs/providers/use-cases/blogger-ban-user-use-case';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { BlogsQuerySqlRepository } from '../blogs/providers/blogs.query.sql.repository';
import { PaginatorInputType } from '../common/dto/input-models/paginator.input.type';
import { BlogOwnerGuard } from '../common/guards/blog-owner.guard';
import { CheckUserIdGuard } from '../common/guards/check-user-id.guard';
import { PaginatorParam } from '../common/decorators/paginator-param.decorator';
import { CheckBlogIdGuard } from '../common/guards/check-blog-id-guard.service';

@UseGuards(AccessTokenGuard)
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepository,
    private blogsQueryRepository: BlogsQuerySqlRepository,
  ) {}

  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckUserIdGuard)
  @HttpCode(204)
  @Put(':userId/ban')
  async banUser(
    @Body() bloggerBanUserInputModel: BloggerBanUserInputModel,
    @Param('userId') userId: string,
  ) {
    const { isBanned, banReason, blogId } = bloggerBanUserInputModel;
    await this.commandBus.execute(
      new BloggerBanUserCommand({ userId, isBanned, banReason, blogId }),
    );
  }

  //Returns all banned users for blog
  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckBlogIdGuard)
  @Get('blog/:blogId')
  async getUsers(
    @Query('searchLoginTerm') searchLoginTerm: string,
    @PaginatorParam() paginatorParams: PaginatorInputType,
    @Param('blogId') blogId: string,
  ) {
    return await this.blogsQueryRepository.getBannedUsers(
      blogId,
      paginatorParams,
      searchLoginTerm,
    );
  }
}
