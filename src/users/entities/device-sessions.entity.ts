import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../domain/user';

@Entity()
export class DeviceSessionsEntity {
  @Column()
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: number;
  @Column()
  expiresDate: number;
  @ManyToOne(() => User, (u) => u.deviceSessions)
  @JoinColumn()
  user: User;
}
