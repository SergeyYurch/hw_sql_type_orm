import { User } from '../../users/domain/user';
import { Answer } from './answer';
import { GameResultEnum } from '../entities/player.entity';

export class Player {
  id: string;
  user: User;
  answers: Answer[];
  score: number;
  result: GameResultEnum;
  constructor() {
    this.answers = [];
    this.score = 0;
  }
}
