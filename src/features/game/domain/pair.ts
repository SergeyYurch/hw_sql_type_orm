import { GameStatusEnum } from '../types/game-status.enum';
import { Player } from './player';
import { Question } from '../../quiz/domain/question';
import { GameResultEnum } from '../entities/player.entity';

export class Pair {
  id: string;
  firstPlayer: Player;
  secondPlayer: Player;
  questions: Question[];
  status: GameStatusEnum;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
  createNewPair(player: Player) {
    this.pairCreatedDate = new Date();
    this.firstPlayer = player;
    this.status = GameStatusEnum.PENDING;
    this.questions = [];
  }

  connectSecondPlayer(player: Player) {
    this.secondPlayer = player;
    this.status = GameStatusEnum.ACTIVE;
    this.startGameDate = new Date();
  }

  private setExtraScore(playerOne: Player, playerTwo: Player) {
    if (playerOne.score > 0) {
      if (playerOne.answers[4] && playerTwo.answers[4]) {
        if (+playerOne.answers[4].addedAt < +playerTwo.answers[4].addedAt)
          playerOne.score++;
      }
      if (playerOne.answers[4] && !playerTwo.answers[4]) playerOne.score++;
    }
    if (playerTwo.id === this.firstPlayer.id) return;
    this.setExtraScore(this.secondPlayer, this.firstPlayer);
  }

  finishGame() {
    console.log('Pair start finishing');
    this.status = GameStatusEnum.FINISHED;
    this.finishGameDate = new Date();
    this.setExtraScore(this.firstPlayer, this.secondPlayer);
    if (this.firstPlayer.score === this.secondPlayer.score) {
      this.firstPlayer.result = GameResultEnum.draw;
      this.secondPlayer.result = GameResultEnum.draw;
    }
    if (this.firstPlayer.score > this.secondPlayer.score) {
      this.firstPlayer.result = GameResultEnum.won;
      this.secondPlayer.result = GameResultEnum.lost;
    }
    if (this.firstPlayer.score < this.secondPlayer.score) {
      this.firstPlayer.result = GameResultEnum.lost;
      this.secondPlayer.result = GameResultEnum.won;
    }
  }

  getCurrentPlayer(userId: string) {
    let currentPlayer: Player = this.secondPlayer;
    let otherPlayer = this.firstPlayer;
    if (this.firstPlayer.user.id === userId) {
      currentPlayer = this.firstPlayer;
      otherPlayer = this.secondPlayer;
    }
    return { currentPlayer, otherPlayer };
  }
}
