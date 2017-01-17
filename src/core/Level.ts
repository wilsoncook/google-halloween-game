// import Player from '../players/Player';
// import Game from '../Game';
import GameLevel from '../states/GameLevel';
//ghost
import { GhostOptions } from './sprite/Ghost';
import Fresher from '../ghosts/Fresher';
import Ghost from './sprite/Ghost';

/**
 * 游戏关卡虚基类
 */
abstract class Level {

  //ghost类型
  static GhostTypes = {
    'Fresher': Fresher
  };

  scene: GameLevel; //各关卡的总场景对象
  ghosts: Phaser.Group; //存放该关卡的所有ghost

  constructor(scene: GameLevel) {
    this.scene = scene;
    this.ghosts = new Phaser.Group(this.scene.game);
  }

  //场景布置（如：设置背景图，周边固定动画元素等，比如蜡烛动画）
  abstract setupScene(): void;
  
  //[子类可重写]
  render(): void {
    // //【性能消耗】显示所有ghost的body、sprite本身、shadow本身的轮廓
    // this.ghosts.forEachAlive((ghost) => {
    //   if (ghost instanceof Ghost) {
    //     let debug = this.scene.game.debug;
    //     debug.body(ghost, 'rgba(0, 255, 0, 0.3)'); //body - 绿色
    //     debug.spriteBounds(ghost, 'rgba(255, 0, 0, 0.3)'); //sprite本身 - 红色
    //     if (ghost.shadow) { debug.spriteBounds(ghost.shadow, 'rgba(0, 0, 255, 0.3)'); } //shadow本身 - 蓝色
    //   }
    // }, null);
  }

  //创建GHOST对象
  abstract setupGhosts(): void;

  //创建ghost
  createGhost(name: string, x: number, y: number, options?: GhostOptions) {
    let ghostClass = Level.GhostTypes[name], player = this.scene.player, game = this.scene.game;
    if (ghostClass) {
      let ghost: Ghost = new ghostClass(player, Object.assign({
        game: game,
        x: x, y: y,
        flipHorizontal: x < game.width / 2 //若处于左边区域，则进行水平翻转
      }, options));
      return this.ghosts.add(ghost);
    } else {
      throw new Error('找不到要创建的Ghost对象');
    }
  }

  // //ghost生成器
  // generateGhosts(name: string, options: GenerateOptions) {
  //   options = Object.assign({
  //     positions: new Phaser.Point(0, 0),
  //     regionRadius: 0, //默认在基础点上生成
  //     amount: 1 //默认仅生成一个
  //   }, options);
    
  //   // let
  //   //   totalPoints = Array.isArray(options.positions) ? options.positions.length : 1, //总基础点数
  //   //   average = options.amount > 1 ? Math.floor(options.amount / totalPoints) : 1; //平均生成个数
  //   // for (let count = 0; count < options.amount; i++) {}
  // }
  
  //切换背景图片（切换帧），若frameName为空，则隐藏背景
  setBackground(frameName) {
    let background = this.scene.background;
    if (frameName) {
      background.frameName = frameName;
      background.visible = true; //显示
    } else {
      background.visible = false; //隐藏
    }
  }

}

export default Level;

//////////////////////

//ghost生成器选项
interface GenerateOptions {
  positions?: Phaser.Point[] | Phaser.Point; //生成基础坐标点
  regionRadius?: number; //基础点半径范围（将在此范围内随机生成）
  amount?: number; //生成总数量（会均分到每个坐标点）
}