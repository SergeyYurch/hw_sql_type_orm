import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('password_recovery_information')
export class PasswordRecoveryInformationEntity {
  @Column()
  recoveryCode: string;
  @Column({ type: 'bigint' })
  expirationDate: number;
  @OneToOne(() => UserEntity, (u) => u.passwordRecoveryInformation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
  @PrimaryColumn()
  userId: number;
}
