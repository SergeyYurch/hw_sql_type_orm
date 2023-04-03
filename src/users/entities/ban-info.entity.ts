import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../domain/user';

@Entity()
export class BanInfoEntity {
  @Column()
  isBanned: boolean;
  @Column()
  banDate: number | null;
  @Column()
  banReason: string | null;
  @Column()
  sa: string | null;
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
