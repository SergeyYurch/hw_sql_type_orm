import {
  Controller,
  Get,
  HttpCode,
  Body,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PaginatorInputType } from '../../common/dto/input-models/paginator.input.type';
import { LikeInputModel } from '../../common/dto/input-models/like.input.model';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CommentInputModel } from '../comments/dto/comment-input.model';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostLikeStatusCommand } from './providers/use-cases/update-post-like-status-use-case';
import { CreateCommentCommand } from '../comments/providers/use-cases/create-comment-use-case';
import { CurrentUserId } from '../../common/decorators/current-user-id.param.decorator';
import { UserBloggerBanGuard } from '../../common/guards/user-blogger-ban.guard';
import { CheckPostIdGuard } from '../../common/guards/check-post-id.guard';
import { PaginatorParam } from '../../common/decorators/paginator-param.decorator';
import { PostsQueryTypeOrmRepository } from './providers/posts.query.type-orm.repository';
import { CommentsQueryTypeOrmRepository } from '../comments/providers/comments.query.type-orm.repository';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryTypeOrmRepository,
    private commentsQueryRepository: CommentsQueryTypeOrmRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(UserBloggerBanGuard)
  @UseGuards(CheckPostIdGuard)
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Put(':postId/like-status')
  async updatePostLikeStatus(
    @Param('postId') postId: string,
    @Body() likeDto: LikeInputModel,
    @CurrentUserId() userId: string,
  ) {
    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(postId, userId, likeDto.likeStatus),
    );
  }

  //Returns comments for specified post

  @UseGuards(CheckPostIdGuard)
  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @PaginatorParam() paginatorParams: PaginatorInputType,
    @CurrentUserId() userId: string,
  ) {
    return this.commentsQueryRepository.getCommentsByPostId(
      paginatorParams,
      postId,
      { userId },
    );
  }

  //Create comment for a specific post
  @UseGuards(UserBloggerBanGuard)
  @UseGuards(CheckPostIdGuard)
  @UseGuards(AccessTokenGuard)
  @Post(':postId/comments')
  async createCommentForPost(
    @Param('postId') postId: string,
    @Body() commentDto: CommentInputModel,
    @CurrentUserId() userId: string,
  ) {
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand(commentDto.content, userId, postId),
    );
    return this.commentsQueryRepository.getCommentById(commentId, { userId });
  }

  @Get()
  async findPosts(
    @PaginatorParam() paginatorParams: PaginatorInputType,
    @CurrentUserId() userId: string,
  ) {
    return await this.postsQueryRepository.getPosts(
      paginatorParams,
      null,
      userId,
    );
  }

  @UseGuards(CheckPostIdGuard)
  @Get(':postId')
  async getPost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string,
  ) {
    return await this.postsQueryRepository.getPostViewModelById(postId, userId);
  }
}
