/**
 * 所有精灵的基类，这里用于提供一些方法
 */

import { Point } from '../Utils';

abstract class Sprite {

  static defaultRate = 60; //[常数]默认频率
  protected game: Phaser.Game;
  protected sprite: Phaser.Sprite; //原始Phaser.Sprite的引用
  protected config: Config = { //默认配置
    spriteKey: null,
    x: 0,
    y: 0
  };

  constructor(game: Phaser.Game) {
    this.game = game;
    //配置初始化
    this.config = Object.assign(this.config, this.setConfig());
    //创建精灵
    this.sprite = this.createSprite();
    //动画初始化
    this.initializeAnimations();
  }

  //创建精灵对象
  protected createSprite() {
    console.log('-----', this.config.spriteKey);
    return this.game.add.sprite(this.config.x, this.config.y, this.config.spriteKey);
  }

  //[子类]覆盖设置配置值
  protected abstract setConfig(): Config;
  //[子类]初始化动画
  protected abstract initializeAnimations(): void;

  //获取当前触点所在坐标
  public getActivePoint(gap: number = 0): Point {
    let pointer = this.game.input.activePointer;
    return new Point(pointer.x - gap, pointer.y - gap);
  }

}

interface Config {
  spriteKey: string; //创建sprite时，指定采用的资源key
  x?: number;
  y?: number;
}

export { Sprite };