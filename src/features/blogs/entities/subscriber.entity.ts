import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogEntity } from './blog.entity';

@Entity('subscribers')
export class SubscriberEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdAt: number;
  @Column()
  code: string;
  @ManyToOne(() => UserEntity)
  user: UserEntity;
  @ManyToOne(() => BlogEntity)
  blog: BlogEntity;
}
