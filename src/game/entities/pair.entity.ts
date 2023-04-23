import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameStatusType } from '../types/game-status.type';
import { PlayerEntity } from './player.entity';

@Entity('pairs')
export class PairEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  firstPlayerId: number;
  @ManyToOne(() => PlayerEntity)
  firstPlayer: PlayerEntity;
  @Column({ nullable: true })
  secondPlayerId: number;
  @ManyToOne(() => PlayerEntity, { nullable: true })
  secondPlayer: PlayerEntity;
  @Column('int', { array: true, default: [] })
  questions: number[];
  @Column()
  status: GameStatusType;
  @Column({ type: 'bigint' })
  pairCreatedDate: number;
  @Column({ type: 'bigint', nullable: true })
  startGameDate: number;
  @Column({ type: 'bigint', nullable: true })
  finishGameDate: number;
}
