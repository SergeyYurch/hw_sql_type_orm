import { AnswerViewModel } from './answer.view.model';
import { PlayerViewModel } from './player.view.model';

export class PlayerProgressViewModel {
  answers: AnswerViewModel[];
  player: PlayerViewModel;
  score: number;
}
