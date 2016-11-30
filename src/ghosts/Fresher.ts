import Ghost from '../core/sprite/Ghost';
import Utils from '../core/Utils';
import Player from '../players/Player';

/**
 * [初级]ghost
 */
class Fresher extends Ghost {

  // static config = {
  //     spriteKey: 'Ghost.Fresher',
  //     x: 0,
  //     y: 0
  // };

  // constructor(game: Phaser.Game, player: Player) {
  //   super(game, 0, 0, 'Ghost.Fresher');
  //   //test
  //   this.game.physics.arcade.enable(this);
  //   // this.body.velocity.set(0, 0);
  //   // this.body.moveTo(2000, 1000, 45);
  //   this.game.physics.arcade.moveToObject(this, player.sprite, 120);

  //   this.update = () => {
  //     console.log('----fresher update');
  //     this.game.physics.arcade.overlap(player.sprite, this, () => {
  //       // this.fresher.sprite.body.stopMovement(true);
  //       this.body.velocity.set(0);
  //     });
  //   };
  // }

  player: Player;

  constructor(game: Phaser.Game, player: Player) {
    super(game, game.world.randomX, game.world.randomY, 'Ghost.Fresher');
    this.player = player;
    //test
    // this.game.physics.arcade.moveToObject(this, player.body, 300);
    this.game.physics.arcade.accelerateToObject(this, player, 200);
    
  }

  update() {
    console.log('------fresher update');
    // this.game.physics.arcade.overlap(this, this.player, () => {
    //   console.log('-----fresher overlap');
    //   this.body.velocity.setTo(0);
    //   // this.kill();
    //   // this.destroy();
    // });
    this.game.physics.arcade.collide(this, this.player, () => {
      console.log('-----fresher collide');
      this.body.acceleration.setTo(0);
      this.body.velocity.setTo(0);
    });
  }
  
  initializeAnimations() {
    let animations = this.animations, frameRate = Ghost.defaultRate;
    //normal
    animations.add('normal', ['normal']);
    //attack
    animations.add('attack', Utils.concatRepeat([], 'attack/1', 4, 'attack/2', 5, 'attack/3', 5, 'attack/4', 5, 'attack/5', 5, 'attack/6', 5, 'attack/7', 1), frameRate);
    //hurt
    let hurt = animations.add('hurt', Utils.concatRepeat([], 'hurt/1', 4, 'hurt/2', 5, 'hurt/3', 5, 'hurt/4', 5, 'hurt/5', 21), frameRate);
    hurt.onComplete.add(() => animations.play('normal'));

    //test
    setTimeout(() => animations.play('attack'), 2000);
    setTimeout(() => animations.play('hurt'), 2000 * 2);
    // setTimeout(() => this.kill(), 2000 * 3);
    // setTimeout(() => disappear.start(), 2000 * 4);
  }

  // //执行死亡
  // kill() {
  //   let disappear = this.game.add.tween(this).to({ alpha: 0 }, 1000, 'Linear', true);
  //   disappear.onComplete.addOnce(() => {
  //     this.game.tweens.remove(disappear);
  //     // this.kill();
  //     this.destroy();
  //   });
  // }

}

export default Fresher;