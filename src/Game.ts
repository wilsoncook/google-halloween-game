import AudioManager from './lib/AudioManager';
//基本场景
import Boot from './states/Boot';
import Preloader from './states/Preloader';
//引入关卡管理
import GameLevel from './states/GameLevel';
//主角
import Player from './players/Player';

/**
 * 游戏入口对象
 */
class Game extends Phaser.Game {

  audio: AudioManager; //全局唯一的音效管理（将在Preloader处进行进一步初始化和加载）

  constructor() {
    super(640, 360, Phaser.AUTO, 'content');
    // super(1000, 360, Phaser.AUTO, 'content');
    //音效管理
    this.audio = new AudioManager(this);
    //基本场景
    this.state.add('Boot', Boot);
    this.state.add('Preloader', Preloader);
    //游戏关卡
    this.state.add('GameLevel', GameLevel);
  }

  //开始游戏
  run() {
    this.state.start('Boot');
  }

  // //析构所有游戏资源
  // destruct() {
  //   //TODO
  // }

}

export default Game;