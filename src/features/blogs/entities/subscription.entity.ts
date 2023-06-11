import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogEntity } from './blog.entity';

@Entity('subscriptions')
export class SubscriptionEntity {
  // @PrimaryGeneratedColumn()
  // id: number;
  @Column()
  subscribedAt: Date;
  @Column({ nullable: true })
  unsubscribedAt: Date | null;
  @Column({ nullable: true })
  status: string;
  @ManyToOne(() => UserEntity, { nullable: false })
  user: UserEntity;
  @PrimaryColumn()
  userId: number;
  @ManyToOne(() => BlogEntity, { nullable: false })
  blog: BlogEntity;
  @PrimaryColumn()
  blogId: number;
}
