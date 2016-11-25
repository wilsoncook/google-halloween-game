//基本场景
import { Boot } from './states/Boot';
import { Preloader } from './states/Preloader';
//引入关卡
import { GameLevelOne } from './game-levels/GameLevelOne';

/**
 * 游戏入口对象
 */
export class Game {

  private game: Phaser.Game;

  constructor() {
    //游戏对象
    this.game = new Phaser.Game(1024, 768, Phaser.AUTO, 'content');
    //基本场景
    this.game.state.add('Boot', Boot);
    this.game.state.add('Preloader', Preloader);
    //游戏场景关卡
    this.game.state.add('GameLevelOne', GameLevelOne);
  }

  //开始游戏
  run() {
    this.game.state.start('Boot');
  }

}