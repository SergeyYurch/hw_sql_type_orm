import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quiz_questions')
export class QuizQuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  body: string;
  @Column('char', { array: true })
  correctAnswers: string[];
  @Column({ default: false })
  published: boolean;
  @Column()
  createdAt: number;
  @Column()
  updatedAt: number;
}
