import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogEntity } from './blog.entity';

@Entity('blogs_banned_users')
export class BlogsBannedUserEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  banReason: string;
  @Column({ type: 'bigint' })
  banDate: number;
  @ManyToOne(() => BlogEntity)
  @JoinColumn()
  blog: BlogEntity;
}
