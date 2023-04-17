import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PaginatorInputType } from '../common/dto/input-models/paginator.input.type';
import { PostViewModel } from '../posts/dto/view-models/post.view.model';
import { PaginatorViewModel } from '../common/dto/view-models/paginator.view.model';
import { CurrentUserId } from '../common/decorators/current-user-id.param.decorator';
import { CheckBlogIdGuard } from '../common/guards/check-blog-id-guard.service';
import { PaginatorParam } from '../common/decorators/paginator-param.decorator';
import { BlogsQueryTypeOrmRepository } from './providers/blogs.query.type-orm.repository';
import { PostsQueryTypeOrmRepository } from '../posts/providers/posts.query.type-orm.repository';

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
}
