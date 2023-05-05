import { PlayerProgressViewModel } from './player-progress.view.model';
import { GameStatusType } from '../../types/game-status.type';
import { GameQuestionViewModel } from './game-question.view.model';

export class GamePairViewModel {
  id: string;
  firstPlayerProgress: PlayerProgressViewModel;
  secondPlayerProgress: PlayerProgressViewModel;
  questions: GameQuestionViewModel[];
  status: GameStatusType;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
}
