import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BLOG_NOT_CREATED, WRONG_BLOG_ID } from './constants/blogs.constant';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogWithUserCommand } from './providers/use-cases/bind-blog-with-user-use-case';
import { BanBlogInputModel } from './dto/input-models/ban-blog.input.model';
import { BanBlogCommand } from './providers/use-cases/ban-blog-use-case';
import { UsersService } from '../users/providers/users.service';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { BlogInputModel } from './dto/input-models/blog.input.model';
import { CreateNewBlogCommand } from './providers/use-cases/create-new-blog-use-case';
import { PaginatorParam } from '../../common/decorators/paginator-param.decorator';
import { CheckUserIdGuard } from '../../common/guards/check-user-id.guard';
import { CheckBlogIdGuardForSa } from '../../common/guards/check-blog-id-for-sa.guard';
import { BlogsQueryTypeOrmRepository } from './providers/blogs.query.type-orm.repository';
import { UsersQueryTypeormRepository } from '../users/providers/users.query-typeorm.repository';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sa/blogs')
@UseGuards(AuthGuard('basic'))
@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private usersService: UsersService,
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
    private usersQueryRepository: UsersQueryTypeormRepository,
    private commandBus: CommandBus,
  ) {}

  @Post()
  async createBlog(@Body() blog: BlogInputModel) {
    const blogId = await this.commandBus.execute(
      new CreateNewBlogCommand(blog),
    );
    if (blogId === BLOG_NOT_CREATED) throw new InternalServerErrorException();
    return this.blogsQueryRepository.getBlogById(blogId);
  }

  @Get()
  async getBlogs(
    @Query('searchNameTerm') searchNameTerm: string | null = null,
    @PaginatorParam() paginatorParams: PaginatorInputType,
  ) {
    return await this.blogsQueryRepository.findBlogs(
      paginatorParams,
      searchNameTerm,
      { bannedBlogInclude: true },
    );
  }

  @UseGuards(CheckUserIdGuard)
  @UseGuards(CheckBlogIdGuardForSa)
  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async editBlog(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    const errors = [];
    const blogOwner = await this.blogsQueryRepository.getBlogOwner(blogId);
    if (blogOwner?.userId) {
      errors.push({ message: WRONG_BLOG_ID, field: 'id' });
    }
    if (errors.length > 0) throw new BadRequestException(errors);
    await this.commandBus.execute(new BindBlogWithUserCommand(blogId, userId));
  }

  @UseGuards(CheckBlogIdGuardForSa)
  @Put(':blogId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(
    @Param('blogId') blogId: string,
    @Body() banStatus: BanBlogInputModel,
  ) {
    await this.commandBus.execute(
      new BanBlogCommand(blogId, banStatus.isBanned),
    );
  }
}
