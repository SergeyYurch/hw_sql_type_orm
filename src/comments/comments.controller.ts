import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { CommentInputModel } from './dto/comment-input.model';
import { LikeInputModel } from '../common/dto/input-models/like.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteCommentCommand } from './providers/use-cases/delete-comment-use-case';
import { UpdateCommentCommand } from './providers/use-cases/update-comment-use-case';
import { UpdateLikeStatusCommand } from './providers/use-cases/update-like-status-use-case';
import { CurrentUserId } from '../common/decorators/current-user-id.param.decorator';
import { CheckCommentIdGuard } from '../common/guards/check-comment-id.guard';
import { CommentOwnerGuard } from '../common/guards/comment-owner.guard';
import { CommentsQueryTypeOrmRepository } from './providers/comments.query.type-orm.repository';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryTypeOrmRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(CheckCommentIdGuard)
  @Get(':commentId')
  async getCommentsForPost(
    @Param('commentId') commentId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.commentsQueryRepository.getCommentById(commentId, { userId });
  }

  @UseGuards(CommentOwnerGuard)
  @UseGuards(CheckCommentIdGuard)
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Delete(':commentId')
  async delete(@Param('commentId') commentId: string) {
    await this.commandBus.execute(new DeleteCommentCommand(commentId));
  }

  @UseGuards(CommentOwnerGuard)
  @UseGuards(CheckCommentIdGuard)
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Put(':commentId')
  async update(
    @Param('commentId') commentId: string,
    @Body() commentDto: CommentInputModel,
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(commentId, commentDto),
    );
  }

  @UseGuards(CheckCommentIdGuard)
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Put(':commentId/like-status')
  async updateLikeStatus(
    @Param('commentId') commentId: string,
    @Body() likeDto: LikeInputModel,
    @CurrentUserId() userId: string,
  ) {
    return this.commandBus.execute(
      new UpdateLikeStatusCommand(commentId, userId, likeDto.likeStatus),
    );
  }
}
