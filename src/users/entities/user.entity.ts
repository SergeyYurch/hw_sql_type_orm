import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmationEntity } from './email-confirmation.entity';
import { DeviceSessionsEntity } from './device-sessions.entity';
import { PasswordRecoveryInformationEntity } from './password-recovery-information.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  login: string;
  @Column()
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
  @OneToOne(() => EmailConfirmationEntity, (ec) => ec.user)
  emailConfirmation: EmailConfirmationEntity;
  @OneToMany(() => DeviceSessionsEntity, (ds) => ds.user)
  deviceSessions: DeviceSessionsEntity[];
  @OneToOne(() => PasswordRecoveryInformationEntity, (pri) => pri.user)
  passwordRecoveryInformation: PasswordRecoveryInformationEntity;
}
