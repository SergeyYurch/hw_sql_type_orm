import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from '../entities/like.entity';
import { Repository } from 'typeorm';
import { Post } from '../../posts/domain/post';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';
import { Comment } from '../../comments/domain/comment';

export class LikesTypeOrmRepository {
  constructor(
    private readonly usersQueryTypeormRepository: UsersQueryTypeormRepository,
    @InjectRepository(LikeEntity)
    private readonly likesRepository: Repository<LikeEntity>,
  ) {}
  async updateLike(criteria: { post?: Post; comment?: Comment }) {
    const { post, comment } = criteria;
    let likeEntity: LikeEntity;
    if (post) {
      likeEntity = await this.likesRepository.findOne({
        relations: {
          user: true,
          post: true,
        },
        where: {
          user: { id: +post.updatedLike.user.id },
          post: { id: +post.id },
        },
      });
    }
    if (comment) {
      likeEntity = await this.likesRepository.findOne({
        relations: {
          user: true,
          post: true,
        },
        where: {
          user: { id: +comment.newLike.user.id },
          comment: { id: +comment.id },
        },
      });
    }
    if (!likeEntity) {
      likeEntity = new LikeEntity();
      likeEntity.likeStatus =
        post?.updatedLike.likeStatus || comment.newLike.likeStatus;
      likeEntity.addedAt = Date.now();
      likeEntity.userId =
        +post?.updatedLike.user.id || +comment.newLike.user.id;
      if (post) likeEntity.postId = +post.id;
      if (comment) likeEntity.commentId = +comment.id;
      return this.likesRepository.save(likeEntity);
    }

    likeEntity.likeStatus =
      post?.updatedLike.likeStatus || comment?.newLike.likeStatus;
    return this.likesRepository.save(likeEntity);
  }
}
