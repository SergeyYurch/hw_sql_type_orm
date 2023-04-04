import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('email_confirmation')
export class EmailConfirmationEntity {
  @Column({ default: false })
  isConfirmed: boolean;
  confirmationCode: string | null;
  @Column({ type: 'bigint', nullable: true })
  expirationDate: number | null;
  @Column({ type: 'bigint', nullable: true })
  dateSendingConfirmEmail: number | null;
  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
  @PrimaryColumn()
  userId: number;

  // constructor(data: EmailConfirmation) {
  //   this.isConfirmed = data.isConfirmed;
  //   this.confirmationCode = data.confirmationCode;
  //   this.expirationDate = data.expirationDate;
  //   this.dateSendingConfirmEmail = data.dateSendingConfirmEmail;
  // }
}
