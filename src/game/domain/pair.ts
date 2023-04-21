import { GameStatusType } from '../types/game-status.type';
import { Player } from './player';

export class Pair {
  id: string;
  firstPlayer: Player;
  secondPlayer: Player;
  questions: number[];
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

  connectSecondPlayer(player: Player, questions: number[]) {
    this.secondPlayer = player;
    this.questions = questions;
    this.status = 'Active';
    this.startGameDate = Date.now();
  }
}
