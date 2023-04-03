import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { EmailConfirmation, User } from '../domain/user';

@Entity()
export class EmailConfirmationEntity {
  @Column()
  isConfirmed: boolean;
  @Column()
  confirmationCode: string | null;
  @Column()
  expirationDate: number | null;
  @Column()
  dateSendingConfirmEmail: number | null;
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  constructor(data: EmailConfirmation) {
    this.isConfirmed = data.isConfirmed;
    this.confirmationCode = data.confirmationCode;
    this.expirationDate = data.expirationDate;
    this.dateSendingConfirmEmail = data.dateSendingConfirmEmail;
  }
}
