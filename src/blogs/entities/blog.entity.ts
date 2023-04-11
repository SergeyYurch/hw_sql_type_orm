import { BlogsBannedUserEntity } from './blogs-banned-user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('blogs')
export class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column({ type: 'bigint' })
  createdAt: number;
  @Column()
  isMembership: boolean;
  @Column()
  isBanned: boolean;
  @Column({ type: 'bigint' })
  banDate: number | null;
  @ManyToOne(() => UserEntity)
  blogOwner: string;
  @OneToMany(() => BlogsBannedUserEntity, (bu) => bu.blog)
  bannedUsers: BlogsBannedUserEntity[];
}
