import { User } from '../../users/domain/user';
import { Answer } from './answer';

export class Player {
  id: string;
  user: User;
  answers: Answer[];
  score: number;
  constructor() {
    this.answers = [];
    this.score = 0;
  }
}
