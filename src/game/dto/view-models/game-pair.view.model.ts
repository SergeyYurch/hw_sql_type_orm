import { PlayerProgressViewModel } from './player-progress.view.model';
import { GameStatusType } from '../../types/game-status.type';

export class GamePairViewModel {
  id: string;
  firstPlayerProgress: PlayerProgressViewModel;
  secondPlayerProgress: PlayerProgressViewModel;
  questions: {
    id: string;
    body: string;
  }[];
  status: GameStatusType;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
}
