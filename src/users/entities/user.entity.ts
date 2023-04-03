import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AccountDataEntity } from './account-data.entity';
import { EmailConfirmationEntity } from './email-confirmation.entity';
import { PasswordRecoveryInformationEntity } from './password-recovery-information.entity';
import { DeviceSessionsEntity } from './device-sessions.entity';
import { BanInfoEntity } from './ban-info.entity';
@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @OneToOne(() => AccountDataEntity, (ad) => ad.user)
  accountData: AccountDataEntity;
  @OneToOne(() => EmailConfirmationEntity, (ec) => ec.user)
  emailConfirmation: EmailConfirmationEntity;
  @OneToOne(() => PasswordRecoveryInformationEntity, (pri) => pri.user)
  passwordRecoveryInformation: null | PasswordRecoveryInformationEntity;
  @OneToMany(() => DeviceSessionsEntity, (ds) => ds.user)
  deviceSessions: DeviceSessionsEntity[];
  @OneToOne(() => BanInfoEntity, (bi) => bi.user)
  banInfo: null | BanInfoEntity;
}
