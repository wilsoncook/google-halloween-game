import Ghost from '../core/sprite/Ghost';

/**
 * [初级]ghost
 */
class Fresher extends Ghost {

  setConfig() {
    return {
      spriteKey: 'Fresher',
      x: 100,
      y: 100
    };
  }
  
  initializeAnimations() {
    let animations = this.sprite.animations, frameRate = Ghost.defaultRate;
  }

}