import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { CommentsQueryTypeOrmRepository } from './comments.query.type-orm.repository';
import { LikeEntity } from '../../likes/entities/like.entity';
import { LikesTypeOrmRepository } from '../../likes/providers/likes.type-orm.repository';

@Injectable()
export class CommentsTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private commentsQueryRepository: CommentsQueryTypeOrmRepository,
    private likesTypeOrmRepository: LikesTypeOrmRepository,
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
    @InjectRepository(LikeEntity)
    private readonly likesRepository: Repository<LikeEntity>,
  ) {}

  async deleteComment(commentId: string) {
    try {
      await this.likesRepository.delete({ commentId: +commentId });
      await this.commentsRepository.delete(+commentId);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteComments(criteria: { postId?: string; blogId?: string }) {
    try {
      const { postId, blogId } = criteria;
      let comments: CommentEntity[];
      if (postId) {
        comments = await this.commentsRepository.find({
          where: { postId: +postId },
          select: { id: true },
        });
      }

      if (blogId) {
        comments = await this.commentsRepository.find({
          relations: {
            post: { blog: true },
          },
          where: { post: { blogId: +blogId } },
          select: { id: true },
        });
      }
      const commentIds = comments.map((c) => c.id);
      if (commentIds.length > 0) {
        for (const cid of commentIds) {
          await this.likesRepository.delete({ commentId: cid });
        }
        console.log(commentIds);
        await this.commentsRepository.delete(commentIds);
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async save(comment: Comment) {
    let commentEntity = new CommentEntity();
    if (comment.id)
      commentEntity = await this.commentsQueryRepository.findById(+comment.id);
    commentEntity.commentatorId = +comment.commentator.id;
    commentEntity.postId = +comment.post.id;
    commentEntity.content = comment.content;
    commentEntity.createdAt = comment.createdAt;
    commentEntity.updatedAt = comment.updatedAt;
    await this.commentsRepository.save(commentEntity);
    if (comment.newLike)
      await this.likesTypeOrmRepository.updateLike({ comment });
    return commentEntity.id;
  }
}
