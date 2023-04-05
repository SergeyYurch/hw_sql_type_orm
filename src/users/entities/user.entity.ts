import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmailConfirmationEntity } from './email-confirmation.entity';

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
}
