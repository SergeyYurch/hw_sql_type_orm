import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('device_sessions')
export class DeviceSessionsEntity {
  @PrimaryColumn('uuid')
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column({ type: 'bigint' })
  lastActiveDate: number;
  @Column({ type: 'bigint' })
  expiresDate: number;
  @ManyToOne(() => UserEntity, (u) => u.deviceSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
  //   @PrimaryColumn()
  //   userId: number;
}
