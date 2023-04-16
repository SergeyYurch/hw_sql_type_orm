import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogEntity } from '../../blogs/entities/blog.entity';
import { LikeEntity } from '../../likes/entities/like.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
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
  @OneToMany(() => LikeEntity, (l) => l.post)
  @JoinColumn()
  newestLikes: LikeEntity[];
  @VirtualColumn({
    type: 'int',
    query: (PostEntity) =>
      `SELECT COUNT(*) FROM likes l LEFT JOIN users u ON u.id=l."userId"  WHERE l."postId" = ${PostEntity}.id  AND l."likeStatus"='Like' AND u."isBanned"=false`,
  })
  likesCount: number;
  @VirtualColumn({
    type: 'int',
    query: (PostEntity) =>
      `SELECT COUNT(*) FROM likes l LEFT JOIN users u ON u.id=l."userId"  WHERE l."postId" = ${PostEntity}.id  AND l."likeStatus"='Dislike' AND u."isBanned"=false`,
  })
  dislikesCount: number;
}
