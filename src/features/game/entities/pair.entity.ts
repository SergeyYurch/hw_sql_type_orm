import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameStatusEnum } from '../types/game-status.enum';
import { PlayerEntity } from './player.entity';

@Entity('pairs')
export class PairEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
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
  status: GameStatusEnum;
  @Column()
  pairCreatedDate: Date;
  @Column({ nullable: true })
  startGameDate: Date;
  @Column({ nullable: true })
  finishGameDate: Date;
}
