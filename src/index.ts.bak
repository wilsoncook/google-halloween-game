/// <reference path="../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../node_modules/phaser/typescript/pixi.d.ts" />

import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import { Player } from './sprites/Player';

class HalloweenGame {

  game: Phaser.Game;
  logo: Phaser.Sprite;
  cursors: Phaser.CursorKeys;

  test: Phaser.Sprite;
  bmd: Phaser.BitmapData;
  bmd2: Phaser.BitmapData;

  brush: Phaser.Graphics;

  constructor() {
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', this);
  }

  init() {
    this.game.stage.setBackgroundColor('0xffffff');  
  }

  preload() {
    // this.game.load.image('logo', './assets/images/mushroom2.png');

    // this.game.load.spritesheet('test', './assets/images/first_9x3.png', 111, 123);
    // this.game.load.atlasJSONArray('waiting', './assets/images/waiting.png', './assets/images/waiting.json');
    this.game.load.atlasJSONArray('waiting', './assets/images/atlas.png', './assets/images/atlas.json');
    // this.game.load.atlasJSONHash('test', './assets/images/sprites.png', null, );
  }

  create() {
    let player = new Player(this.game);

    // let isDrawing = false;
    // let pointer = this.game.input.activePointer;
    // this.brush = this.game.add.graphics(0, 0);
    // this.brush.lineStyle(10, 0xff0000, 1);
    // // this.brush.beginFill(0xff0000, 1);
    // // this.brush.moveTo(100, 100);
    // // setTimeout(() => this.brush.lineTo(200, 100), 2000);
    // // setTimeout(() => this.brush.lineTo(200, 200), 5000);
    // // this.brush.lineTo(200, 100);
    // // this.brush.lineTo(200, 200);
    // // this.brush.endFill();

    // //TEST draw

    // interface Point {
    //   x: number,
    //   y: number
    // }
    // function midPointBtw(p1: Point, p2: Point) {
    //   return {
    //     x: p1.x + (p2.x - p1.x) / 2,
    //     y: p1.y + (p2.y - p1.y) / 2
    //   };
    // }
    // this.bmd = this.game.make.bitmapData(800, 600);
    // this.bmd.addToWorld();
    // let ctx = this.bmd.ctx;
    // let points: Point[] = [];
    // ctx.beginPath();
    // ctx.strokeStyle = 'black';
    // ctx.lineWidth = 10;
    // ctx.lineJoin = ctx.lineCap = 'round';

    // // this.bmd2 = this.game.add.bitmapData(32, 32);
    // // this.bmd2.circle(16, 16, 16, 'rgba(255, 0, 0, 1)');

    // // bmd.circle(300, 300, 16, 'rgba(255, 0, 0, 1)');
    // // this.bmd.line(10, 10, 200, 200, '#000', 4);
    // // this.game.input.addMoveCallback((pointer: Phaser.Pointer, x: number, y: number) => {
    // //   console.log('----move');
    // //   if (pointer.isDown) {
    // //     // console.log('----draw');
    // //     // bmd.circle(pointer.x, pointer.y, 16, 'rgba(255, 0, 0, 1)');
    // //     this.bmd.draw(this.bmd2, x - 16, y - 16);
    // //   }
    // // }, this

    // this.game.input.onDown.add(() => {
    //   isDrawing = true;
    //   points.push({ x: pointer.clientX, y: pointer.clientY });
    //   // ctx.moveTo(pointer.clientX - 5, pointer.clientY - 5);
    //   // console.log('onDown:',arguments, this);
    //   // this.brush.beginFill(0x00ff00, 1);
    //   // this.brush.moveTo(pointer.clientX, pointer.clientY);
    //   console.log('---start', pointer.clientX, pointer.clientY);
    // });
    // this.game.input.addMoveCallback(() => {
    //   if (isDrawing) {
    //     // ctx.lineTo(pointer.clientX - 5, pointer.clientY - 5);
    //     // ctx.stroke();
    //     points.push({ x: pointer.clientX, y: pointer.clientY });
    //     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear all
    //     let p1 = points[0], p2 = points[1];
    //     ctx.beginPath();
    //     ctx.moveTo(p1.x, p1.y);
    //     for (let i = 1, len = points.length; i < len; i++) {
    //       // we pick the point between pi+1 & pi+2 as the
    //       // end point and p1 as our control point
    //       let midPoint = midPointBtw(p1, p2);
    //       ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
    //       p1 = points[i];
    //       p2 = points[i + 1];
    //     }
    //     // Draw last line as a straight line while
    //     // we wait for the next point to be able to calculate
    //     // the bezier control point
    //     ctx.lineTo(p1.x, p1.y);
    //     ctx.stroke();

    //     this.bmd.dirty = true;
    //     console.log('---move', pointer.clientX, pointer.clientY);
    //     // this.brush.lineTo(pointer.clientX, pointer.clientY);
    //   }
    // }, this);
    // this.game.input.onUp.add(() => {
    //   // console.log('onUp:',arguments);
    //   isDrawing = false;
    //   points = [];
    //   // this.brush.endFill();
    //   console.log('---end', pointer.clientX, pointer.clientY, ctx);
    // });

    // // this.logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    // // this.logo.anchor.setTo(0.5, 0.5);
    // this.cursors = this.game.input.keyboard.createCursorKeys();

    // // var test2 = this.game.add.sprite(300, 300, 'test', 5);
    // // test2.animations.add('test', [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 16], 4, true);
    // // test2.animations.play('test');

    // this.test = this.game.add.sprite(100, 100, 'waiting');
    // this.test.anchor.set(0.5, 0.5);
    // // this.test.animations.add('waiting', Phaser.Animation.generateFrameNames('frame_', 0, 7, '.png', 4), 4, true, false);
    // this.test.animations.add('waiting', Phaser.Animation.generateFrameNames('first_waiting_', 1, 8, '.png'), 4, true);
    // // this.test.animations.add('waiting', ['p3_1.png', 'p3_2.png', 'p3_3.png', 'p3_4.png', 'p3_5.png', 'p3_6.png', 'p3_7.png', 'p3_8.png'], 6, true, false)
    // this.test.animations.play('waiting');
  }

  update() {
    // let pointer = this.game.input.activePointer;
    // // this.brush.lineTo(pointer.clientX, pointer.clientY);
    // if (pointer.isDown) {
    //   this.bmd.ctx.lineTo(pointer.clientX, pointer.clientY);
    //   this.bmd.ctx.stroke();
    //   this.bmd.dirty = true;
    //   // this.brush.lineTo(pointer.clientX, pointer.clientY);
    //   // this.brush.drawCircle(pointer.clientX, pointer.clientY, 32);
    // }
    // let pointer = this.game.input.activePointer;
    // if (pointer.isDown) {
    //   this.bmd.draw(this.bmd2, pointer.x - 16, pointer.y - 16);
    //   // this.bmd.circle(pointer.x, pointer.y, 16, 'rgba(255, 0, 0, 1)');
    // }
    // console.log('is down:', this.game.input.activePointer.isDown);
    // this.game.input.update();
    // if (this.cursors.down.isDown) { this.logo.position.y += 10; }
    // if (this.cursors.up.isDown) { this.logo.position.y -= 10; }
    // if (this.cursors.left.isDown) { this.logo.position.x -= 10; }
    // if (this.cursors.right.isDown) { this.logo.position.x += 10; }
  }

  render() {
    let pointer = this.game.input.activePointer;
    this.game.debug.text(`Mouse position: ${pointer.x} , ${pointer.y}`, 10, 10, 'rgba(0,0,0,1)');
  }

}

window.onload = () => {
  const game = new HalloweenGame();
};