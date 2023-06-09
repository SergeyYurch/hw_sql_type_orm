import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { PostViewModel } from '../posts/dto/view-models/post.view.model';
import { PaginatorViewModel } from '../../common/dto/view-models/paginator.view.model';
import { CurrentUserId } from '../../common/decorators/current-user-id.param.decorator';
import { CheckBlogIdGuard } from '../../common/guards/check-blog-id-guard.service';
import { PaginatorParam } from '../../common/decorators/paginator-param.decorator';
import { BlogsQueryTypeOrmRepository } from './providers/blogs.query.type-orm.repository';
import { PostsQueryTypeOrmRepository } from '../posts/providers/posts.query.type-orm.repository';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CommandBus } from '@nestjs/cqrs';
import { SubscribeCommand } from './providers/use-cases/subscribe-use-case';
import { UnsubscribeCommand } from './providers/use-cases/unsubscribe-use-case';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
    private postsQueryRepository: PostsQueryTypeOrmRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getBlogs(
    @Query('searchNameTerm') searchNameTerm: string | null = null,
    @PaginatorParam() paginatorParams: PaginatorInputType,
    @CurrentUserId() userId: string,
  ) {
    console.log(`[BlogsController ]/getBlogs - run...`);
    return await this.blogsQueryRepository.getBlogs(
      paginatorParams,
      searchNameTerm,
      { currentUserId: userId },
    );
  }

  @UseGuards(CheckBlogIdGuard)
  @Get(':blogId')
  async getBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
  ) {
    console.log(`[BlogsController ]/getBlog - run...`);
    return await this.blogsQueryRepository.getBlogById(blogId, userId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CheckBlogIdGuard)
  @UseGuards(AccessTokenGuard)
  @Post(':blogId/subscription')
  async subscribe(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
  ) {
    console.log(`[BlogsController ]:subscribe - run...`);
    const res = await this.commandBus.execute(
      new SubscribeCommand(blogId, userId),
    );
    if (!res) {
      throw new InternalServerErrorException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CheckBlogIdGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':blogId/subscription')
  async unsubscribe(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
  ) {
    console.log(`[BlogsController ]:unsubscribe - run...`);
    const res = await this.commandBus.execute(
      new UnsubscribeCommand(blogId, userId),
    );
    if (!res) {
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(CheckBlogIdGuard)
  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @PaginatorParam() paginatorParams: PaginatorInputType,
    @CurrentUserId() userId: string,
  ): Promise<PaginatorViewModel<PostViewModel>> {
    return await this.postsQueryRepository.getPosts(
      paginatorParams,
      blogId,
      userId,
    );
  }
}
