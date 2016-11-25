/// <reference path="../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../node_modules/phaser/typescript/pixi.d.ts" />

//引入全局性的库，将暴露出PIXI,P2这种全局变量
import 'pixi';
import 'p2';

import { Game } from './Game';
window.onload = () => {
  new Game().run();
};