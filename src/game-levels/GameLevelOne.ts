import GameLevel from '../core/state/GameLevel';

import Player from '../players/Player';

import Fresher from '../ghosts/Fresher';

/**
 * 第一关
 */
export class GameLevelOne extends GameLevel {

  player: Player;
  fresher: Fresher;
  
  create() {
    this.player = new Player(this.game);
    this.fresher = new Fresher(this.game, this.player);
    // setTimeout(() => {
    //   this.fresher.sprite.destroy();
    // }, 10000);
  }

  // update() {
  //   // this.game.physics.arcade.moveToObject(this.fresher.sprite, this.player.sprite, 10);
  //   this.game.physics.arcade.overlap(this.player.sprite, this.fresher.sprite, () => {
  //     // this.fresher.sprite.body.stopMovement(true);
  //     this.fresher.sprite.body.velocity.set(0);
  //   });
  // }

  render() {
    this.game.debug.inputInfo(30, 30);

    this.game.debug.bodyInfo(this.fresher, 275, 10);
    this.game.debug.body(this.player);
    this.game.debug.body(this.fresher);
  }

}