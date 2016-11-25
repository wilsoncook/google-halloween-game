import { GameLevel } from '../core/GameLevel';

import { Player } from '../sprites/Player';

/**
 * 第一关
 */
export class GameLevelOne extends GameLevel {
  
  create() {
    let player = new Player(this.game);
  }

}