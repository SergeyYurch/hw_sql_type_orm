import { GameStatusType } from '../types/game-status.type';
import { Player } from './player';
import { Question } from '../../quiz/domain/question';

export class Pair {
  id: string;
  firstPlayer: Player;
  secondPlayer: Player;
  questions: Question[];
  status: GameStatusType;
  pairCreatedDate: number;
  startGameDate: number;
  finishGameDate: number;
  createNewPair(player: Player) {
    this.pairCreatedDate = Date.now();
    this.firstPlayer = player;
    this.status = 'PendingSecondPlayer';
    this.questions = [];
  }

  connectSecondPlayer(player: Player) {
    this.secondPlayer = player;
    this.status = 'Active';
    this.startGameDate = Date.now();
  }
}
