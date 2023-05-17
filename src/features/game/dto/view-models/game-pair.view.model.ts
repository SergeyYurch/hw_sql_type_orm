import { PlayerProgressViewModel } from './player-progress.view.model';
import { GameStatusEnum } from '../../types/game-status.enum';
import { GameQuestionViewModel } from './game-question.view.model';

export class GamePairViewModel {
  id: string;
  firstPlayerProgress: PlayerProgressViewModel;
  secondPlayerProgress: PlayerProgressViewModel;
  questions: GameQuestionViewModel[];
  status: GameStatusEnum;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
}
