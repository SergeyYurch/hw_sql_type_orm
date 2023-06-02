import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
    private postsQueryRepository: PostsQueryTypeOrmRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query('searchNameTerm') searchNameTerm: string | null = null,
    @PaginatorParam() paginatorParams: PaginatorInputType,
  ) {
    console.log(`[BlogsController ]/getBlogs - run...`);
    return await this.blogsQueryRepository.findBlogs(
      paginatorParams,
      searchNameTerm,
    );
  }

  @UseGuards(CheckBlogIdGuard)
  @Get(':blogId')
  async getBlog(@Param('blogId') blogId: string) {
    console.log(`[BlogsController ]/getBlog - run...`);
    return await this.blogsQueryRepository.getBlogById(blogId);
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
