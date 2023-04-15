import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { PostEntity } from '../../posts/entities/post.entity';

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
  @ManyToOne(() => PostEntity)
  post: PostEntity;
  // comment:CommentEntity
}
