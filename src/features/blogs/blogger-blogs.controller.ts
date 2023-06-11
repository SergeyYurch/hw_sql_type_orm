import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BlogInputModel } from './dto/input-models/blog.input.model';
import { PostViewModel } from '../posts/dto/view-models/post.view.model';
import { BlogPostInputModel } from './dto/input-models/blog-post.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateNewBlogCommand } from './providers/use-cases/create-new-blog-use-case';
import { EditBlogCommand } from './providers/use-cases/edit-blog-use-case';
import { DeleteBlogCommand } from './providers/use-cases/delete-blog-use-case';
import { CreateNewPostCommand } from '../posts/providers/use-cases/create-new-post-use-case';
import { EditPostCommand } from '../posts/providers/use-cases/edit-post-use-case';
import { DeletePostCommand } from '../posts/providers/use-cases/delete-post-use-case';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUserId } from '../../common/decorators/current-user-id.param.decorator';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { BlogOwnerGuard } from '../../common/guards/blog-owner.guard';
import { PaginatorParam } from '../../common/decorators/paginator-param.decorator';
import { CheckPostIdGuard } from '../../common/guards/check-post-id.guard';
import { CheckBlogIdGuard } from '../../common/guards/check-blog-id-guard.service';
import { LoggerGuard } from '../../common/guards/logger.guard';
import { BlogsQueryTypeOrmRepository } from './providers/blogs.query.type-orm.repository';
import { PostsQueryTypeOrmRepository } from '../posts/providers/posts.query.type-orm.repository';
import { CommentsQueryTypeOrmRepository } from '../comments/providers/comments.query.type-orm.repository';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccountImageFile } from '../../common/types/account-image-file';
import { imageFileValidate } from '../../common/custom-validate/image-file.validate';
import { UploadBlogWallpaperCommand } from './providers/use-cases/upload-blog-wallpaper.use-case';
import { UploadBlogIconCommand } from './providers/use-cases/upload-blog-icon.use-case';
import { UploadPostIconCommand } from './providers/use-cases/upload-post-icon.use-case';
import { SubscribeCommand } from './providers/use-cases/subscribe-use-case';
import { UnsubscribeCommand } from './providers/use-cases/unsubscribe-use-case';
import { CreateNewPostNotificationCommand } from '../posts/providers/use-cases/create-new-post-notification.use-case';

@ApiTags('blogger/blogs')
@UseGuards(AccessTokenGuard)
@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryTypeOrmRepository,
    private postsQueryRepository: PostsQueryTypeOrmRepository,
    private commentsQueryRepository: CommentsQueryTypeOrmRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(CheckBlogIdGuard)
  @UseGuards(LoggerGuard)
  @Post(':blogId/subscription')
  @HttpCode(HttpStatus.NO_CONTENT)
  async subscribe(
    @CurrentUserId() userId: string,
    @Param('blogId') blogId: string,
  ) {
    console.log(`[BloggerBlogController]:subscribe start...`);
    const res = await this.commandBus.execute(
      new SubscribeCommand(blogId, userId),
    );
    if (!res) throw new InternalServerErrorException();
  }

  @UseGuards(CheckBlogIdGuard)
  @UseGuards(LoggerGuard)
  @Delete(':blogId/subscription')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribe(
    @CurrentUserId() userId: string,
    @Param('blogId') blogId: string,
  ) {
    console.log(`[BloggerBlogController]:unsubscribe start...`);
    await this.commandBus.execute(new UnsubscribeCommand(blogId, userId));
  }

  @Get('comments')
  async getComments(
    @PaginatorParam() paginatorParams: PaginatorInputType,
    @CurrentUserId() bloggerId: string,
  ) {
    return await this.commentsQueryRepository.getBloggersComments(
      paginatorParams,
      bloggerId,
    );
  }

  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckBlogIdGuard)
  @UseGuards(LoggerGuard)
  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async editBlog(
    @Param('blogId') blogId: string,
    @Body() changes: BlogInputModel,
  ) {
    await this.commandBus.execute(new EditBlogCommand(blogId, changes));
  }

  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckBlogIdGuard)
  @UseGuards(LoggerGuard)
  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('blogId') blogId: string) {
    await this.commandBus.execute(new DeleteBlogCommand(blogId));
  }

  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckBlogIdGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @Post(':blogId/images/wallpaper')
  async uploadBlogWallpaper(
    @Param('blogId') blogId: string,
    @UploadedFile(
      imageFileValidate({ maxFileSizeKB: 100, width: 1028, height: 312 }),
    )
    file: AccountImageFile,
  ) {
    await this.commandBus.execute(new UploadBlogWallpaperCommand(blogId, file));
    return this.blogsQueryRepository.getBlogImages(blogId);
  }

  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckBlogIdGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @Post(':blogId/images/main')
  async uploadBlogIcon(
    @Param('blogId') blogId: string,
    @UploadedFile(
      imageFileValidate({ maxFileSizeKB: 100, width: 156, height: 156 }),
    )
    file: AccountImageFile,
  ) {
    console.log('uploadBlogIcon start');
    await this.commandBus.execute(new UploadBlogIconCommand(blogId, file));
    return this.blogsQueryRepository.getBlogImages(blogId);
  }

  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckBlogIdGuard)
  @UseGuards(CheckPostIdGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @Post(':blogId/posts/:postId/images/main')
  async uploadPostIcon(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @UploadedFile(
      imageFileValidate({ maxFileSizeKB: 100, width: 940, height: 432 }),
    )
    file: AccountImageFile,
  ) {
    await this.commandBus.execute(
      new UploadPostIconCommand(blogId, postId, file),
    );
    return this.postsQueryRepository.getPostImages(postId);
  }

  @UseGuards(LoggerGuard)
  @Post()
  async createBlog(
    @Body() blog: BlogInputModel,
    @CurrentUserId() userId: string,
  ) {
    const blogId = await this.commandBus.execute(
      new CreateNewBlogCommand(blog, userId),
    );
    if (!blogId) return null;
    const createdBlog = await this.blogsQueryRepository.getBlogById(
      blogId,
      userId,
    );
    console.log(`Blog id:${blogId} was created`);
    console.log(createdBlog);
    return createdBlog;
  }
  //sdd
  @UseGuards(LoggerGuard)
  @Get()
  async getBlogs(
    @Query('searchNameTerm') searchNameTerm: string | null = null,
    @PaginatorParam() paginatorParams: PaginatorInputType,
    @CurrentUserId() userId: string,
  ) {
    console.log(`[BloggerBlogsController]/getBlogs - run...`);
    return await this.blogsQueryRepository.findBlogs(
      paginatorParams,
      searchNameTerm,
      { blogOwnerId: userId },
    );
  }

  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckBlogIdGuard)
  @UseGuards(LoggerGuard)
  @Post(':blogId/posts')
  async createPostForBlog(
    @CurrentUserId() userId: string,
    @Param('blogId') blogId: string,
    @Body() blogPostInputModel: BlogPostInputModel,
  ): Promise<PostViewModel> {
    const postId = await this.commandBus.execute(
      new CreateNewPostCommand(userId, blogId, blogPostInputModel),
    );
    await this.commandBus.execute(new CreateNewPostNotificationCommand(blogId));
    return await this.postsQueryRepository.getPostViewModelById(postId);
  }

  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckPostIdGuard)
  @UseGuards(CheckBlogIdGuard)
  @UseGuards(LoggerGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async editPost(
    @Param('postId') postId: string,
    @Body() postChanges: BlogPostInputModel,
  ) {
    console.log('editPost');
    await this.commandBus.execute(new EditPostCommand(postId, postChanges));
  }

  @UseGuards(BlogOwnerGuard)
  @UseGuards(CheckBlogIdGuard)
  @UseGuards(CheckPostIdGuard)
  @UseGuards(LoggerGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('postId') postId: string) {
    await this.commandBus.execute(new DeletePostCommand(postId));
  }
}
