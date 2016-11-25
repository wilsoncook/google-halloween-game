/**
 * 所有精灵的基类，这里用于提供一些方法
 */

import { Point } from './Utils';

export abstract class Sprite {

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
    //子类初始化
    this.initialize();
  }

  //覆盖设置配置值
  protected setConfig(): Config { return null };

  //创建精灵对象
  protected createSprite() {
    console.log('-----', this.config.spriteKey);
    return this.game.add.sprite(this.config.x, this.config.y, this.config.spriteKey);
  }

  //[子类]用于初始化
  protected abstract initialize(): void;

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