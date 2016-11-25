import * as Phaser from 'phaser';

/**
 * state基类，用于实现不同场景
 */
export abstract class State extends Phaser.State {

  state: Phaser.StateManager; //phaser.d.ts里面没有描述这个属性，但这里属性是存在的。。。
  //TODO

  render() {
    let pointer = this.game.input.activePointer;
    this.game.debug.text(`当前鼠标位置: ${pointer.x}, ${pointer.y}`, 10, 20, '0x000000');
  }

}