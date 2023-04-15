import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from '../entities/like.entity';
import { Repository } from 'typeorm';
import { Post } from '../../posts/domain/post';
import { UsersQueryTypeormRepository } from '../../users/providers/users.query-typeorm.repository';

export class LikesTypeOrmRepository {
  constructor(
    private readonly usersQueryTypeormRepository: UsersQueryTypeormRepository,
    @InjectRepository(LikeEntity)
    private readonly likesRepository: Repository<LikeEntity>,
  ) {}
  async updateLike(post?: Post, comment?: Comment) {
    if (post) {
      let likeEntity = await this.likesRepository.findOne({
        relations: {
          user: true,
          post: true,
        },
        where: {
          user: { id: +post.updatedLike.user.id },
          post: { id: +post.id },
        },
      });
      if (!likeEntity) {
        likeEntity = new LikeEntity();
        likeEntity.likeStatus = post.updatedLike.likeStatus;
        likeEntity.addedAt = Date.now();
        likeEntity.userId = +post.updatedLike.user.id;
        likeEntity.postId = +post.id;
        return this.likesRepository.save(likeEntity);
      }

      likeEntity.likeStatus = post.updatedLike.likeStatus;
      return this.likesRepository.save(likeEntity);
    }
    if (comment) {
    }
  }
}
