import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { AnswerEntity } from './ansver.entity';

@Entity('players')
export class PlayerEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: number;
  @ManyToOne(() => UserEntity)
  user: UserEntity;
  @OneToMany(() => AnswerEntity, (a) => a.player)
  @JoinColumn()
  answers: AnswerEntity[];
  @Column()
  score: number;
  @Column({ nullable: true })
  result: GameResultEnum;
}

export enum GameResultEnum {
  lost = 'lost',
  won = 'won',
  draw = 'draw',
}
