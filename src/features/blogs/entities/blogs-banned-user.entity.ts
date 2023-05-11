import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogEntity } from './blog.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('blogs_banned_users')
export class BlogsBannedUserEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  banReason: string;
  @Column({ type: 'bigint' })
  banDate: number;
  @Column({ type: 'bigint' })
  createdAt: number;
  @ManyToOne(() => BlogEntity)
  @JoinColumn()
  blog: BlogEntity;
  @Column()
  blogId: number;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: number;
}
