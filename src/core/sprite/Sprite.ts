import { Point } from '../Utils';
import Game from '../../Game';

/**
 * 所有精灵的基类，这里用于提供一些方法
 */
abstract class Sprite extends Phaser.Sprite {

  game: Game; //[重新声明]该game已变为我们自定义的Game类
  body: Phaser.Physics.Arcade.Body; //[重新声明]

  static defaultRate = 60; //[常数]默认频率

  private collisionQueue: CollisionQueue = new Map(); //碰撞检测队列（用于update时进行碰撞检测）

  protected tweens: Tweens = {}; //补间动画键值对
  protected speed: number; //移动速度（用于moveTo等）

  public options: SpriteOptions;
  public shadow: Phaser.Sprite; //镜像精灵（当options.shadow存在时有效）

  constructor(options: SpriteOptions) {
    super(options.game, options.x, options.y, options.key, options.frame);

    //初始化基本属性
    this.options = options;
    this.health = this.maxHealth = options.maxHealth;
    this.speed = options.speed || Sprite.defaultRate;

    //初始化body
    this.game.physics.arcade.enable(this);
    if (options.bodySize) {
      this.body.setSize(options.bodySize.width, options.bodySize.height, options.bodySize.offsetX || 0, options.bodySize.offsetY || 0);
    }
    // //默认基础点定位位置
    // let anchor = options.anchor || { x: 0.5, y: 0.5 }; //默认处于最中间
    // this.anchor.setTo(anchor.x, anchor.y);
    
    //确定定位点（位于body偏移后指定区域的正中心）
    let 
      bodyOffsetX = options.bodySize.offsetX || 0, bodyOffsetY = options.bodySize.offsetY,
      anchorX = (this.body.width / 2 + bodyOffsetX) / this.width, anchorY = (this.body.height / 2 + bodyOffsetY) / this.height;
    this.anchor.setTo(anchorX, anchorY);
    
    //添加到
    if (options.toStage) {
      this.game.stage.addChild(this);
    } else {
      this.game.add.existing(this);
    }
    //创建镜像
    if (options.shadow) {
      this.shadow = <Phaser.Sprite>this.addChild(this.game.make.sprite(options.shadow.x || 0, options.shadow.y || 0, options.shadow.key, options.shadow.frame));
      //水平翻转
      if (options.flipHorizontal) {
        this.shadow.width *= -1;
        this.shadow.x -= this.shadow.width;
      }
    }
    //动画初始化
    this.initializeAnimations();
  }

  //更新事件（主要用于碰撞检测）
  update() {
    // console.log('[Sprite]update');
    let arcade = this.game.physics.arcade;
    for (let [target, task] of this.collisionQueue) {
      if (target instanceof Sprite) { //到达目标对象
        arcade.overlap(this, target, task.callback);
      } else if ('number' === typeof target.x 
        && 'number' === typeof target.y
        && this.body.hitTest(target.x, target.y)) { //到达点
        task.callback();
      }
    }
  }

  /*
  ------------------------------------------------------------------
  | 基本流程函数
  ------------------------------------------------------------------
  */
  
  //受伤（减血）
  onBeforeHurt(): any {}
  async hurt(hurtWhileDie: boolean = true) {
    if (this.alive) {
      this.health--;
      let dead = this.health <= 0; //是否已经算死亡
      if (!dead || (dead && hurtWhileDie)) { //1.未死 或 2.死之前调用hurt的逻辑
        await this.onBeforeHurt();
        await this.onAfterHurt();
      }
      if (dead) { this.die(); }
    }
  }
  onAfterHurt(): any {}

  //受治疗(非死亡状态有效)
  onBeforeCure(): any {}
  async cure() {
    await this.onBeforeCure();
    this.heal(1);
    await this.onAfterCure();
  }
  onAfterCure(): any {}

  //死亡
  onBeforeDie(): any {}
  async die(destroy: boolean = true) {
    if (!this.alive) { return ; } //已死亡，不再执行
    this.alive = false; //标记为未存活，以免重复被调用
    await this.onBeforeDie();
    if (destroy) {
      this.destruct();
    }
    await this.onAfterDie();
  }
  onAfterDie(): any {}

  //析构函数，回收资源并删除对象及其子对象
  destruct() {
    //移除关联的tween对象
    this.game.tweens.removeFrom(this, true);
    //销毁
    this.destroy(true);
  }

  /*
  ------------------------------------------------------------------
  | 工具函数
  ------------------------------------------------------------------
  */

  //将该sprite的body内部的相对于左上角的坐标转换为相对于中心点的坐标（意即body中坐标系的原点在中心点处）
  toBodyPos(x: number, y: number): Coordinate {
    return { x: x - this.body.width / 2, y: y - this.body.height / 2 };
  }

  //获取相对于body的各个角的坐标
  getBodyCorner(place: string, offsetX?: number, offsetY?: number): Coordinate {
    let basePos = { x: 0, y: 0 };
    switch (place) {
      case 'top-left':
        break;
      case 'top-right':
        basePos.x = this.body.width; break;
      case 'bottom-left':
        basePos.y = this.body.height; break;
      case 'bottom-right':
        basePos.x = this.body.width, basePos.y = this.body.height; break;
    }
    if ('number' === typeof offsetX) { basePos.x += offsetX; }
    if ('number' === typeof offsetY) { basePos.y += offsetY; }
    return this.toBodyPos(basePos.x, basePos.y);
  }
  getBodyTopLeft(offsetX?: number, offsetY?: number): Coordinate { return this.getBodyCorner('top-left', offsetX, offsetY); }
  getBodyTopRight(offsetX?: number, offsetY?: number): Coordinate { return this.getBodyCorner('top-right', offsetX, offsetY); }
  getBodyBottomLeft(offsetX?: number, offsetY?: number): Coordinate { return this.getBodyCorner('bottom-left', offsetX, offsetY); }
  getBodyBottomRight(offsetX?: number, offsetY?: number): Coordinate { return this.getBodyCorner('bottom-right', offsetX, offsetY); }

  //移动到某个精灵对象或点
  moveTo(target: Sprite|Coordinate, speed: number = this.speed) {
    let queue = this.collisionQueue;
    this.game.physics.arcade.moveToObject(this, target, speed);
    // this.game.physics.arcade.moveToXY(this, target.x, target.y, speed);
    return new Promise((resolve, reject) => {
      queue.set(target, {
        callback: () => {
          //删除该碰撞检测任务
          queue.delete(target);
          //自动停止移动
          this.body.velocity.setTo(0);
          this.body.acceleration.setTo(0);
          //解决此promise
          resolve();
        }
      });
    });
  }

  /**
   * 为当前或镜像sprite对象创建一个补间动画
   * @param  {string} name? 若空，则不缓存，也无法通过getTween获取
   * @param  {boolean=false} shadow 是否是为shadow创建
   */
  createTween(name?: string, shadow: boolean = false) {
    if (name && this.tweens[name]) { return this.tweens[name]; }
    let tween = this.game.add.tween(shadow ? this.shadow : this);
    if (name) { this.tweens[name] = tween; }
    return tween;
  }
  //获取某个补间动画
  getTween(name: string) {
    return this.tweens[name];
  }
  //播放一个补间动画
  playTween(name: string, play: boolean = true) {
    let tween = this.tweens[name];
    if (play) {
      tween.start();
    } else {
      tween.pause();
    }
    return tween;
  }
  //promise方式播放tween（注：该tween不能是loop或repeatAll(-1)的，否则promise永远不会返回，onComplete永远不会被调用）
  promisePlayTween(name: string) {
    let tween = this.getTween(name);
    if (!tween) { return ; }
    return new Promise((resolve) => {
      tween.onComplete.addOnce(resolve);
      tween.start();
    });
  }

  // //[禁用原生play]override当前promisePlay方式和原play函数混用时，可能会导致promisePlay返回的promise无法完成(onComplete事件不被触发)，所以这里暂时禁止使用原生play
  // play(name: string, frameRate?: number, loop?: boolean, killOnComplete?: boolean): Phaser.Animation {
  //   throw new Error('为避免冲突，请采用promisePlay()方法');
  // }

  //重写原生play，以便支持将上一个动画stop
  play(name: string, frameRate?: number, loop?: boolean, killOnComplete?: boolean): Phaser.Animation {
    return <Phaser.Animation>this.exPlay(name, false, false, frameRate, loop, killOnComplete);
  }

  /**
   * play函数的封装（支持动画播放完毕后才返回）
   * @param  {string} name
   * @param  {boolean=false} shadow 是否play镜像的动画
   * @param  {boolean=true} promise 是否返回Promise
   * @param  {...} originParams 其他用于Animation.play的参数
   */
  exPlay(name: string, shadow: boolean = false, promise: boolean = true, ...originParams): Promise<Phaser.Animation>|Phaser.Animation {
    let 
      animations = (shadow ? this.shadow : this).animations,
      currentAnimation = animations.currentAnim,
      animation = animations.getAnimation(name);
    //若当前有正在播放的动画，结束它并触发他之前绑定有的onComplete事件（否则以前动画的promise可能永远无法返回）
    if (currentAnimation) {
      console.debug('[promisePlay]当前有正在播放的动画，将结束此动画后重新播放新的动画. 当前动画的onComplete监听函数个数为: ', currentAnimation.onComplete.getNumListeners());
      currentAnimation.stop(true, true);
    }
    if (promise) {
      return new Promise((resolve) => {
        //播放新的动画
        animation.onComplete.addOnce(() => resolve(animation));
        animation.play.call(animation, ...originParams);
      });
    } else {
      return animation.play.call(animation, ...originParams);
    }
  }

  /*
  ------------------------------------------------------------------
  | 子类实现函数
  ------------------------------------------------------------------
  */

  // //[子类]覆盖设置配置值
  // protected abstract setConfig(): Config;
  //[子类]初始化动画
  protected abstract initializeAnimations(): void;

}

//碰撞检测任务配置
interface CollisionTask {
  callback: Function; //到达后的回调
  // autoStop: boolean; //碰撞后是否自动停止
  // autoRemove: boolean; //到达目标后，是否自动删除该碰撞检测任务
}
type CollisionQueue = Map<Sprite|Coordinate, CollisionTask>; //注：这里针对同一个点或对象，仅只会有一个回调会被触发

//补间动画键值对
export interface Tweens {
  [index: string]: Phaser.Tween
}

//sprite初始化选项
interface SpriteOptions {
  //用于sprite初始化的参数
  game?: Phaser.Game;

  x?: number; y?: number;
  key?: string; //指定texture名
  frame?: string | number;

  //特有配置项
  speed?: number; //移动速度（默认为Sprite.defaultRate）
  toStage?: boolean; //是否创建到stage对象上（将用于跨state）
  shadow?: { //是否创建一个精灵镜像（该镜像可专用于展示动画而不影响精灵本身，镜像将作为其孩子，可通过shadow属性访问）
    x?: number; y?: number; //相对父sprite的坐标位置（默认＝0）
    key?: string; //指定texture名
    frame?: string | number;
  };
  flipHorizontal?: boolean; //该sprite内的孩子是否进行水平翻转（该设置会影响shadow及其他孩子）【注】仅影响其下孩子，该sprite本身不会被翻转
  maxHealth?: number; //该精灵最大生命值（对ghost无意义，因为它用的是其他初始化方式）
  bodySize?: { //用于碰撞检测的body的尺寸和偏移量，用于body.setSize()
    width: number; height: number;
    offsetX?: number; offsetY?: number; //相对原图的偏移量
  };
  // anchor?: { //指定原点位置倍数，默认为（0.5,0.5）
  //   x: number;
  //   y: number;
  // }
}

export default Sprite;
export { Sprite, SpriteOptions };