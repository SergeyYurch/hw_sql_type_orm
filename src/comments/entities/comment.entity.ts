import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from '../../posts/entities/post.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  content: string;
  @Column({ type: 'bigint' })
  createdAt: number;
  @Column({ type: 'bigint' })
  updatedAt: number;
  @ManyToOne(() => PostEntity)
  post: PostEntity;
  @ManyToOne(() => UserEntity)
  commentator: UserEntity;
}
