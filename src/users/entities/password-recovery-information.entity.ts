import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../domain/user';

@Entity()
export class PasswordRecoveryInformationEntity {
  @Column()
  recoveryCode: string;
  @Column()
  expirationDate: number;
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
