import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QuizQuestionEntity } from '../../quiz/entities/quiz-question.entity';
import { PlayerEntity } from './player.entity';

@Entity('answers')
export class AnswerEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => QuizQuestionEntity)
  question: QuizQuestionEntity;
  @Column()
  questionId: number;
  @Column()
  answerStatus: string;
  @Column()
  body: string;
  @Column({ type: 'bigint' })
  addedAt: number;
  @ManyToOne(() => PlayerEntity, (p) => p.answers)
  player: PlayerEntity;
  @Column()
  playerId: number;
}
