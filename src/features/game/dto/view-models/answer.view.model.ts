import { AnswerStatusEntity } from '../../types/answer-status.entity';

export class AnswerViewModel {
  questionId: string;
  answerStatus: AnswerStatusEntity;
  addedAt: string;
}
