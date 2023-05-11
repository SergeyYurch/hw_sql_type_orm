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
import { CommandBus } from '@nestjs/cqrs';
import { BloggerBanUserInputModel } from './dto/input-models/blogger-ban -user-input-model.dto';
import { BloggerBanUserCommand } from '../blogs/providers/use-cases/blogger-ban-user-use-case';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { BlogOwnerGuard } from '../../common/guards/blog-owner.guard';
import { CheckUserIdGuard } from '../../common/guards/check-user-id.guard';
import { PaginatorParam } from '../../common/decorators/paginator-param.decorator';
import { CheckBlogIdGuard } from '../../common/guards/check-blog-id-guard.service';
import { BlogsQueryTypeOrmRepository } from '../blogs/providers/blogs.query.type-orm.repository';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('posts')
@UseGuards(AccessTokenGuard)
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
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
