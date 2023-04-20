import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quiz_questions')
export class QuizQuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ collation: 'C' })
  body: string;
  @Column('text', { array: true })
  correctAnswers: string[];
  @Column({ default: false })
  published: boolean;
  @Column({ type: 'bigint' })
  createdAt: number;
  @Column({ type: 'bigint' })
  updatedAt: number;
}
