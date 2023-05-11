import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('password_recovery_information')
export class PasswordRecoveryInformationEntity {
  // @PrimaryGeneratedColumn()
  // id: number;
  @Column({ nullable: true })
  recoveryCode: string;
  @Column({ type: 'bigint', nullable: true })
  expirationDate: number;
  @OneToOne(() => UserEntity, (u) => u.passwordRecoveryInformation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
  @PrimaryColumn()
  userId: number;
}
