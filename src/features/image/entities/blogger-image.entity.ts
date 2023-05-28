import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogEntity } from '../../blogs/entities/blog.entity';
import { PostEntity } from '../../posts/entities/post.entity';

@Entity('images')
export class BloggerImageEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  url: string;
  @Column()
  width: number;
  @Column()
  height: number;
  @Column()
  fileSize: number;
  @Column()
  format: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToOne(() => BlogEntity, { nullable: true })
  blog: BlogEntity;
  @OneToOne(() => PostEntity, { nullable: true })
  post: PostEntity;
}
