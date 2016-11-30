/**
 * 所有精灵的基类，这里用于提供一些方法
 */

import { Point } from '../Utils';

abstract class Sprite extends Phaser.Sprite {

  static defaultRate = 60; //[常数]默认频率
  public game: Phaser.Game;
  public sprite: Phaser.Sprite; //原始Phaser.Sprite的引用
  // private config: Config; //实例私有的配置（由子类和父类合并而来）
  
  // static config: Config = { //默认静态配置
  //   spriteKey: null,
  //   x: 0,
  //   y: 0
  // };

  // constructor(game: Phaser.Game) {
  //   let Child = <typeof Sprite>this.constructor;
  //   //属性设置
  //   this.game = game;
  //   //配置初始化(私有)
  //   this.config = Object.assign({}, Sprite.config, Child.config);
  //   //创建精灵
  //   this.sprite = this.createSprite();
  //   //动画初始化
  //   this.initializeAnimations();
  // }

  // //创建精灵对象
  // protected createSprite() {
  //   console.log('-----', this.config.spriteKey);
  //   return this.game.add.sprite(this.config.x, this.config.y, this.config.spriteKey);
  // }

  constructor(game: Phaser.Game, x: number, y: number, key?: string | Phaser.RenderTexture | Phaser.BitmapData | PIXI.Texture, frame?: string | number) {
    super(game, x, y, key, frame);
    //初始化body
    this.game.physics.arcade.enable(this);
    this.anchor.setTo(0.5);
    //添加到世界中
    this.game.add.existing(this);
    //动画初始化
    this.initializeAnimations();
    // let ChildClass = <typeof Sprite>this.constructor, config = ChildClass.config;
    // this.key = config.spriteKey;
    // this.x = config.x;
    // this.y = config.y;
  }

  // //[子类]覆盖设置配置值
  // protected abstract setConfig(): Config;
  //[子类]初始化动画
  protected abstract initializeAnimations(): void;

  //获取当前触点所在坐标
  public getActivePoint(gap: number = 0): Point {
    let pointer = this.game.input.activePointer;
    return new Point(pointer.x - gap, pointer.y - gap);
  }

}

// interface Config {
//   spriteKey: string; //创建sprite时，指定采用的资源key
//   x?: number;
//   y?: number;
// }

export default Sprite;