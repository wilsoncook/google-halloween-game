import { Ghost, GhostOptions } from '../core/sprite/Ghost';
import Utils from '../core/Utils';
import Player from '../players/Player';

/**
 * [初级]ghost
 */
class Fresher extends Ghost {

  constructor(player: Player, options: GhostOptions) {
    super(player, Object.assign({ //默认配置
      // game: game, 
      // x: 100, y: 100, key: 'Ghost.Fresher', frame: 'normal',
      shadow: {
        x: -75, y: -75,
        // x: 0, y: 0,
        key: 'GhostFresher',
        frame: 'normal'
      },
      speed: Ghost.defaultRate * 0.6,
      // lifeOptions: {
      //   offset: { x: -30, y: -35 }
      // },
      // anchor: { x: 0, y: 0 },
      // anchor: { x: 0.9, y: 1.1 },
      bodySize: { width: 59, height: 75, offsetX: 0, offsetY: 0 }
      // bodySize: { width: 150, height: 150, offsetX: 0, offsetY: 0 }
    }, options));

    //初始动画
    // this.play('normal');
//     this.playUpdown();
// console.log('----fresher', this);
    // super(game, game.world.randomX, game.world.randomY, 'Ghost.Fresher');
    //test
    // this.game.physics.arcade.moveToObject(this, player.body, 300);
    // this.game.physics.arcade.accelerateToObject(this, player, 200);
    
  }

  onBeforeMarch() {
    this.playUpdown();
  }
  onAfterMarch() {
    this.stopUpdown();
  }

  onBeforeAttack() {
    this.game.audio.playEffect('fresher-attack-disappear');
    this.shadow.play('attack');
  }
  onAfterAttack() {
    this.alive = false; //直接静默式地死亡(不摧毁，后面手动摧毁)
    console.log('-----onAfterAttack');
    this.game.time.events.add(Phaser.Timer.HALF, () => { //等半秒后再消失摧毁
      console.log('-----not occur');
      this.playTween('disappear').onComplete.addOnce(() => this.destruct());
    });
  }

  onBeforeHurt() {
    super.onBeforeHurt();
    return this.exPlay('hurt', true);
  }

  onBeforeDie() {
    super.onBeforeDie();
    return this.exPlay('die', true);
  }
  
  initializeAnimations() {
    let animations = this.shadow.animations, frameRate = Ghost.defaultRate;
    //normal
    animations.add('normal', ['normal']);
    //attack
    animations.add('attack', Utils.concatRepeat([], 'attack/1', 4, 'attack/2', 5, 'attack/3', 5, 'attack/4', 5, 'attack/5', 5, 'attack/6', 5, 'attack/7', 1), frameRate);
    //hurt
    let hurt = animations.add('hurt', Utils.concatRepeat([], 'hurt/1', 4, 'hurt/2', 5, 'hurt/3', 5, 'hurt/4', 5, 'hurt/5', 21), frameRate);
    hurt.onComplete.add(() => animations.play('normal'));
    //die
    animations.add('die', Utils.concatRepeat([], 'die/1', 4, 'die/2', 5, 'die/3', 5, 'die/4', 5, 'die/5', 5, 'die/6', 5, 'die/7', 5, 'die/8', 5), frameRate);
    //disappear（攻击完毕后消失）
    this.createTween('disappear', true).to({ alpha: 0 }, 1000, 'Linear', false);
    //updown上下游荡
    let shadowY = this.shadow.y;
    this.createTween('updown', true)
      .to({ y: shadowY - 5 }, 500).to({ y: shadowY }, 500)
      .to({ y: shadowY + 5 }, 500).to({ y: shadowY }, 500)
      .loop();
  }

  playUpdown() { this.getTween('updown').start(); }
  stopUpdown() { this.getTween('updown').pause(); }

}

export default Fresher;