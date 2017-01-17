/// <reference path="../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../node_modules/phaser/typescript/pixi.d.ts" />
/// <reference path="../definitions/definitions.d.ts" /> //通用声明

// //引入全局性的库，将暴露出PIXI,P2这种全局变量
// import 'pixi';
// import 'p2';
// import 'phaser';

import Game from './Game';

window.onload = () => {
  new Game().run();
};