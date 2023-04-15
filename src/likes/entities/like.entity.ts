import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { PostEntity } from '../../posts/entities/post.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';

@Entity('likes')
export class LikeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  likeStatus: string;
  @Column({ type: 'bigint' })
  addedAt: number;
  @ManyToOne(() => UserEntity)
  user: UserEntity;
  @Column({ nullable: true })
  userId: number;
  @ManyToOne(() => PostEntity, { nullable: true })
  post: PostEntity;
  @Column({ nullable: true })
  postId: number;
  @ManyToOne(() => CommentEntity, { nullable: true })
  comment: CommentEntity;
}
