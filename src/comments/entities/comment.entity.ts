import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';
import { PostEntity } from '../../posts/entities/post.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  content: string;
  @Column({ type: 'bigint' })
  createdAt: number;
  @Column({ type: 'bigint' })
  updatedAt: number;
  @ManyToOne(() => PostEntity)
  post: PostEntity;
  @Column()
  postId: number;
  @ManyToOne(() => UserEntity)
  commentator: UserEntity;
  @Column()
  commentatorId: number;
  @VirtualColumn({
    type: 'int',
    query: (CommentEntity) =>
      `SELECT COUNT(*) FROM likes l LEFT JOIN users u ON u.id=l."userId"  WHERE l."commentId" = ${CommentEntity}.id  AND l."likeStatus"='Like' AND u."isBanned"=false`,
  })
  likesCount: number;
  @VirtualColumn({
    type: 'int',
    query: (CommentEntity) =>
      `SELECT COUNT(*) FROM likes l LEFT JOIN users u ON u.id=l."userId"  WHERE l."commentId" = ${CommentEntity}.id  AND l."likeStatus"='Dislike' AND u."isBanned"=false`,
  })
  dislikesCount: number;
}
