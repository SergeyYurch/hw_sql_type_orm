import { AnswerViewModel } from './answer.view.model';

export class PlayerProgressViewModel {
  answers: AnswerViewModel[];
  player: {
    id: string;
    login: string;
  };
  score: number;
}
