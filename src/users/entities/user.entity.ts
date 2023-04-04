import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
