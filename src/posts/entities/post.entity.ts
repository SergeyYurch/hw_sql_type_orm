import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogEntity } from '../../blogs/entities/blog.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column({ default: false })
  isBanned: boolean;
  @Column({ type: 'bigint' })
  createdAt: number;
  @ManyToOne(() => UserEntity)
  blogger: UserEntity;
  @Column()
  bloggerId: number;
  @ManyToOne(() => BlogEntity)
  blog: BlogEntity;
  @Column()
  blogId: number;
}
