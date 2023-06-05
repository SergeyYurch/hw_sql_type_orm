import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogEntity } from './blog.entity';

@Entity('subscriptions')
export class SubscriptionEntity {
  // @PrimaryGeneratedColumn()
  // id: number;
  @Column({ nullable: true })
  subscribedAt: Date | null;
  @Column({ nullable: true })
  unsubscribedAt: Date | null;
  @Column({ nullable: true })
  code: string;
  @ManyToOne(() => UserEntity, { nullable: false })
  user: UserEntity;
  @PrimaryColumn()
  userId: number;
  @ManyToOne(() => BlogEntity, { nullable: false })
  blog: BlogEntity;
  @PrimaryColumn()
  blogId: number;
}
