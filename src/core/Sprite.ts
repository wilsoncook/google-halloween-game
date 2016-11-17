/**
 * base class for all sprites
 */

import { Point } from './Utils';

export abstract class Sprite {

  protected game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.initialize();
  }

  //resources loading before game started
  public abstract preload(): void;

  //[子类]用于初始化
  protected abstract initialize(): void;

  //获取当前触点所在坐标
  public getActivePoint(gap: number = 0): Point {
    let pointer = this.game.input.activePointer;
    return new Point(pointer.x - gap, pointer.y - gap);
  }

};