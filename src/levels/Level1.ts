import Level from '../core/Level';
import { LifeFigureValue } from '../lib/LifeFigure';

/**
 * 第一关
 */
class Level1 extends Level {

  private fresher;

  setupScene() {
    this.setBackground('level-1');
  }

  setupGhosts() {
    let game = this.scene.game, player = this.scene.player;
    this.fresher = this.createGhost('Fresher', 100, 100, {
      lifeValues: [LifeFigureValue.BULGE, LifeFigureValue.HEART, LifeFigureValue.SUNKEN, LifeFigureValue.VERTICAL, LifeFigureValue.HORIZONTAL, LifeFigureValue.LIGHTNING]
    });
    // this.fresher = this.createGhost('Fresher', game.width / 2, game.height / 2, {
    //   // lifeValues: [LifeFigureValue.BULGE, LifeFigureValue.HEART, LifeFigureValue.SUNKEN, LifeFigureValue.VERTICAL, LifeFigureValue.HORIZONTAL, LifeFigureValue.LIGHTNING]
    //   lifeValues: [LifeFigureValue.BULGE]
    // });

    console.log('Level1', this.ghosts.children);

    //test
    // window['fresher'] = this.fresher;
    // window['player'] = player;
  }

  // render() {
  //   super.render();
  //   let debug = this.scene.game.debug;
  //   if (this.fresher) {
  //     debug.bodyInfo(this.fresher, 15, 20);
  //     // debug.body(this.fresher, 'rgba(0, 0, 255, 0.5)');
  //     // debug.spriteBounds(this.fresher, 'rgba(0, 255, 0, 0.5)');
  //     // debug.spriteCoords(this.fresher, 15, 20);

  //     let shadow = this.fresher.shadow;
  //     // debug.spriteBounds(shadow);
  //     // debug.spriteInfo(shadow, 15, 20);
  //     // debug.spriteCoords(shadow, 15, 20);
  //   }
  // }

}

export default Level1;