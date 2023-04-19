import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeviceSessionsEntity } from './device-sessions.entity';
import { PasswordRecoveryInformationEntity } from './password-recovery-information.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true, collation: 'C' })
  login: string;
  @Column({ unique: true, collation: 'C' })
  email: string;
  @Column()
  passwordHash: string;
  @Column()
  passwordSalt: string;
  @Column({ type: 'bigint' })
  createdAt: number;
  @Column({ default: false })
  isBanned: boolean;
  @Column({ type: 'bigint', nullable: true })
  banDate: number | null;
  @Column({ nullable: true })
  banReason: string | null;
  @Column({ default: false })
  isConfirmed: boolean;
  @Column({ nullable: true })
  confirmationCode: string | null;
  @Column({ type: 'bigint', nullable: true })
  expirationDate: number | null;
  @Column({ type: 'bigint', nullable: true })
  dateSendingConfirmEmail: number | null;
  @OneToOne(() => PasswordRecoveryInformationEntity, (pri) => pri.user)
  passwordRecoveryInformation: PasswordRecoveryInformationEntity;
  @OneToMany(() => DeviceSessionsEntity, (ds) => ds.user)
  deviceSessions: DeviceSessionsEntity[];
}
