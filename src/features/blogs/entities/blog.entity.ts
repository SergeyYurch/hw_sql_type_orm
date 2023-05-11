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
}
