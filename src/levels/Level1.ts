import Level from '../core/Level';
import { LifeFigureValue } from '../lib/LifeFigure';

/**
 * 第一关
 */
class Level1 extends Level {

  // private fresher;

  setupScene() {
    this.setBackground('level-1');
  }

  setupGhosts() {
    let game = this.scene.game, player = this.scene.player;
    this.createGhost('Fresher', game.width - 30, 60, {
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

  render() {
    // if (this.fresher) {
    //   this.scene.game.debug.bodyInfo(this.fresher, 15, 20);
    //   this.scene.game.debug.body(this.fresher);
    // }
  }

}

export default Level1;