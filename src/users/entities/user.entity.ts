import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmationEntity } from './email-confirmation.entity';
import { BanInfoEntity } from './ban-info.entity';
import { DeviceSessionsEntity } from './device-sessions.entity';
import { PasswordRecoveryInformationEntity } from './password-recovery-information.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: string;
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
  @OneToOne(() => EmailConfirmationEntity, (ec) => ec.user)
  emailConfirmation: EmailConfirmationEntity;
  @OneToOne(() => BanInfoEntity, (bi) => bi.user)
  banInfo: BanInfoEntity;
  @OneToMany(() => DeviceSessionsEntity, (ds) => ds.user)
  deviceSessions: DeviceSessionsEntity[];
  @OneToOne(() => PasswordRecoveryInformationEntity, (pri) => pri.user)
  passwordRecoveryInformation: PasswordRecoveryInformationEntity;
}
