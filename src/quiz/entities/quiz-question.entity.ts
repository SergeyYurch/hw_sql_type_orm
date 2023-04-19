import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quiz_questions')
export class QuizQuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  body: string;
  @Column({ type: 'array' })
  correctAnswers: string[];
  @Column({ default: false })
  published: false;
  @Column()
  createdAt: number;
  @Column()
  updatedAt: number;
}
