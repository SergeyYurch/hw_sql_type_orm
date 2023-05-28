import { BlogsBannedUserEntity } from './blogs-banned-user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BloggerImageEntity } from '../../image/entities/blogger-image.entity';

@Entity('blogs')
export class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ collation: 'C' })
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column({ type: 'bigint' })
  createdAt: number;
  @Column({ default: false })
  isMembership: boolean;
  @Column({ default: false })
  isBanned: boolean;
  @Column({ type: 'bigint', nullable: true })
  banDate: number | null;
  @ManyToOne(() => UserEntity, { nullable: true })
  blogOwner: UserEntity;
  @OneToMany(() => BlogsBannedUserEntity, (bu) => bu.blog)
  bannedUsers: BlogsBannedUserEntity[];
  @OneToOne(() => BloggerImageEntity, { nullable: true })
  @JoinColumn()
  wallpaper: BloggerImageEntity;
  @OneToOne(() => BloggerImageEntity, { nullable: true })
  @JoinColumn()
  icon: BloggerImageEntity;
}
