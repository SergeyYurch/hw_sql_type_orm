import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogEntity } from './blog.entity';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  subscribedAt: Date;
  @Column()
  unsubscribedAt: Date;
  @Column({ nullable: true })
  code: string;
  @ManyToOne(() => UserEntity, { nullable: false })
  user: UserEntity;
  @Column()
  userId: number;
  @ManyToOne(() => BlogEntity, { nullable: false })
  blog: BlogEntity;
  @Column()
  blogId: number;
}
