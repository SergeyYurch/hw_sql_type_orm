import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PaginatorInputType } from '../common/dto/input-models/paginator.input.type';
import { PostViewModel } from '../posts/dto/view-models/post.view.model';
import { PaginatorViewModel } from '../common/dto/view-models/paginator.view.model';
import { PostsQuerySqlRepository } from '../posts/providers/posts.query.sql.repository';
import { CurrentUserId } from '../common/decorators/current-user-id.param.decorator';
import { BlogsQuerySqlRepository } from './providers/blogs.query.sql.repository';
import { CheckBlogIdGuard } from '../common/guards/check-blog-id-guard.service';
import { PaginatorParam } from '../common/decorators/paginator-param.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private postsQueryRepository: PostsQuerySqlRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query('searchNameTerm') searchNameTerm: string | null = null,
    @PaginatorParam() paginatorParams: PaginatorInputType,
  ) {
    console.log(`[BlogsController ]/getBlogs - run...`);
    const result = await this.blogsQueryRepository.findBlogs(
      paginatorParams,
      searchNameTerm,
    );
    console.log(result);
    return result;
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

  @UseGuards(CheckBlogIdGuard)
  @Get(':blogId')
  async getBlog(@Param('blogId') blogId: string) {
    return await this.blogsQueryRepository.getBlogById(blogId);
  }
}
