import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AccountData, User } from '../domain/user';

@Entity()
export class AccountDataEntity {
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  passwordHash: string;
  @Column()
  passwordSalt: string;
  @Column()
  createdAt: number;
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
  constructor(data: AccountData) {
    this.login = data.login;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.passwordSalt = data.passwordSalt;
    this.createdAt = data.createdAt;
  }
}
