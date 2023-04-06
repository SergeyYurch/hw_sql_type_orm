import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('ban_info')
export class BanInfoEntity {
  @Column()
  isBanned: boolean;
  @Column({ type: 'bigint' })
  banDate: number | null;
  @Column()
  banReason: string | null;
  @Column()
  sa: string | null;
  @OneToOne(() => UserEntity, (u) => u.banInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @PrimaryColumn()
  userId: number;
}
