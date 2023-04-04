import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('device_sessions')
export class DeviceSessionsEntity {
  @PrimaryColumn()
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column({ type: 'bigint' })
  lastActiveDate: number;
  @Column({ type: 'bigint' })
  expiresDate: number;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
  @PrimaryColumn()
  userId: number;
}
