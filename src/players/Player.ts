import Sprite from '../core/sprite/Sprite';
import Ghost from '../core/sprite/Ghost';
import { Point, Utils } from '../core/Utils';
import { LineBuilder } from '../lib/LineBuilder';
import { LifeFigureValue, LifeFigureMap } from '../lib/LifeFigure';

class Player extends Sprite {
  
  private processor: LineBuilder = null; //当前画线处理器，用于记录每次画线的线段（有值则代表当前正处于画线中）
  private pallete: Phaser.BitmapData; //画板对象，用于画线
  private ghosts: Phaser.Group; //存放当前关卡的所有ghosts（每过一关都可能被替换）

  constructor(game: Phaser.Game) {
    super({
      game: game,
      x: game.width / 2, y: game.height / 2,
      // x: 0, y: 0,
      key: 'Player', maxHealth: 4, speed: Player.defaultRate * 6,
      bodySize: { width: 87, height: 74, offsetX: 44, offsetY: 76 }
      // bodySize: { width: 190, height: 170, offsetX: 0, offsetY: 0 }
    });
    // this.body.immovable = true;
    //位置调整
    this.anchor.setTo(0.46, 0.65);
    //创建画板
    this.pallete = this.createPallete();
    //播放初始动画
    this.play('waiting');
  }

  /*
  -------------------------------------------------------------
  | 对外api
  -------------------------------------------------------------
  */

  //设置当前可攻击的ghost对象Group
  setGhostGroup(ghosts: Phaser.Group) {
    this.ghosts = ghosts;
  }

  /*
  -------------------------------------------------------------
  | 动作
  -------------------------------------------------------------
  */

  onBeforeHurt() {
    return this.exPlay('hurt');
  }

  async die() { //重写die
    //让所有ghost逐渐淡出消失
    //TODO
    //播放失败音效
    this.game.audio.playFail();
    //播放死亡动画
    await this.exPlay('die');
    //等待若干秒后，显示结束失败场景
    this.game.time.events.add(Phaser.Timer.SECOND * 10, () => {
      alert('TODO:此时应该跳转到失败场景');
    })
  }

  //移动到指定地方（并播放跑步动画和声音）
  async runTo(target: Sprite|Coordinate) {
    this.playRun();
    await this.moveTo(target);
    this.playRun(false); //恢复正常状态
  }

  //对ghost实施攻击
  attack(figure: LifeFigureValue) {
    if (null === figure) { //本次施法失败，停止施法动作
      this.play('waiting');
      return ;
    }
    this.playDrawAnimation(figure); //播放施法动画
    this.playDrawAudio(figure); //播放施法音效
    if (this.ghosts && this.ghosts.length) {
      console.log(this.ghosts);
      this.damageGhosts(figure);
    }
  }

  //通过figure寻找ghost，找到一个立即返回（主要用于闪电）
  private findGhostByFigure(figure: LifeFigureValue): Ghost|null {
    for (let i = 0, len = this.ghosts.children.length; i < len; i++) {
      let ghost = <Ghost>this.ghosts.children[i];
      if (ghost.alive && ghost.getCurrentFigure() === figure) { return ghost; }
    }
    return null;
  }

  //对单个ghost施法
  private damageGhosts(figure: LifeFigureValue) {
    //若是闪电并且ghost中有一个带有闪电图形，则所有ghost减血
    if (LifeFigureValue.LIGHTNING === figure) {
      if (this.findGhostByFigure(figure)) {
        this.ghosts.forEachAlive((ghost) => (<Ghost>ghost).hurt(false), null);
      }
    } else { //其他情况，按匹配减血
      this.ghosts.forEachAlive((ghost: Ghost) => {
        let isMatched = ghost.getCurrentFigure() === figure;
        if (isMatched) {
          if (LifeFigureValue.HEART === figure) { //将player加一滴血
            this.cure();
          }
          //该ghost减血
          ghost.hurt(false);
        }
      }, null);
    }
  }

  //针对不同figure，播放不同音效
  private playDrawAudio(figure: LifeFigureValue) {
    switch(figure) {
      case LifeFigureValue.LIGHTNING:
        this.game.audio.playEffect('lightning');
        break;
      case LifeFigureValue.HEART:
        this.game.audio.playEffect('heart');
        break;
      default:
        this.game.audio.playDraw();
    }
  }
  private playDrawAnimation(figure: LifeFigureValue) {
    this.play(`draw-${LifeFigureMap[figure]}`);
  }

  /*
  -------------------------------------------------------------
  | 画板
  -------------------------------------------------------------
  */

  //创建画板对象
  private createPallete(): Phaser.BitmapData {
    let
      pointer = this.game.input.activePointer,
      pallete = this.game.add.bitmapData(this.game.width, this.game.height),
      ctx = pallete.ctx;

    pallete.addToWorld();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 20;
    ctx.lineCap = ctx.lineJoin = 'round';

    let pointGap = 0; //ctx.lineWidth / 2;
    //[事件]鼠标按下
    this.game.input.onDown.add(() => {
      this.play('drawing'); //播放施法中动画
      this.processor = new LineBuilder(ctx.lineWidth); //新的一个画线开始
      this.processor.addPoint(this.getActivePoint(pointGap)); //一个开始的坐标点
    });
    //[事件]鼠标移动
    this.game.input.addMoveCallback(() => {
      if (this.processor) {
        this.processor.addPoint(this.getActivePoint(pointGap)); //加入移动时的坐标点
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //清空画板，重新绘制以前的画线
        //---开始重新绘制画板，显示已画的线段图形
        let points = this.processor.getPoints(), p1: Point = points[0], p2: Point = points[1], middlePoint: Point;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); //移动到起始点
        for (let i = 1, len = points.length; i < len; i++) {
          middlePoint = Point.getMiddlePoint(p1, p2); //we pick the point between pi+1 & pi+2 as the end point and p1 as our control point
          ctx.quadraticCurveTo(p1.x, p1.y, middlePoint.x, middlePoint.y); //draw a curve line to the middle
          p1 = points[i], p2 = points[i + 1];
        }
        ctx.lineTo(p1.x, p1.y); // Draw last line as a straight line while we wait for the next point to be able to calculate the bezier control point
        ctx.stroke();

        this.processor.calculate(); //执行一次线段计算
        //debug 绘制所有线段及其信息
        this.processor.drawDebugInfo(pallete);
        //debug end

        pallete.dirty = true; //标记该bitmap对象已脏，需要重绘
      }
    }, null);
    //[事件]鼠标抬起
    this.game.input.onUp.add(() => {
      if (this.processor) { //由于及时没有产生ondown事件，鼠标从外面移入游戏中时，也会触发onup，所以这里需要判断下
        //计算最终画线结果
        this.processor.calculate(true);
        //计算当前图形
        let figure = this.processor.calculateFigure();
        //实施攻击
        this.attack(figure);

        //debug
        console.log('----画线完毕: ', this.processor);
        //debug 绘制所有线段及其信息
        this.processor.drawDebugInfo(pallete);
        //debug end
        this.processor = null;
      }
    });
    return pallete;
  }

  /*
  -------------------------------------------------------------
  | 动画及音频
  -------------------------------------------------------------
  */

  //初始化创建动画
  protected initializeAnimations() {
    let animations = this.animations, frameRate = Sprite.defaultRate; //默认频率
    //等待状态
    animations.add('waiting', Utils.concatRepeat([], 'waiting/1', 25, 'waiting/2', 5, 'waiting/3', 5, 'waiting/4', 4, 'waiting/5', 5, 'waiting/6', 15, 'waiting/5', 6, 'waiting/4', 5, 'waiting/3', 5, 'waiting/2', 5, 'waiting/1', 10, 'waiting/7', 5, 'waiting/8', 5, 'waiting/9', 5, 'waiting/10', 5, 'waiting/11', 15, 'waiting/10', 5, 'waiting/9', 5, 'waiting/8', 5, 'waiting/7', 5), frameRate, true);
    //跑动
    animations.add('run', Utils.concatRepeat([], 'run/1', 5, 'run/2', 5, 'run/3', 4, 'run/4', 5, 'run/5', 5, 'run/6', 5), frameRate, true);
    //scared状态
    animations.add('scared', Utils.concatRepeat([], 'scared/1', 5, 'scared/2', 5, 'scared/3', 1), frameRate, false);
    //施法中状态
    animations.add('drawing', Utils.concatRepeat([], 'drawing/1', 5, 'drawing/2', 5, 'drawing/3', 4, 'drawing/4', 5, 'drawing/5', 5, 'drawing/6', 5), frameRate, true);
    //画横线（结束后需立马跳转到waiting）
    let drawHorizontal = animations.add('draw-horizontal', Utils.concatRepeat([], 'draw-horizontal/1', 8, 'draw-horizontal/2', 6, 'draw-horizontal/3', 5, 'draw-horizontal/4', 5, 'draw-horizontal/5', 5), frameRate, false);
    drawHorizontal.onComplete.add(() => { console.log('-----drawHorizontal on complete'); animations.play('waiting'); });
    //画竖线
    let drawVertical = animations.add('draw-vertical', Utils.concatRepeat([], 'draw-vertical/1', 5, 'draw-vertical/2', 5, 'draw-vertical/3', 5, 'draw-vertical/4', 5, 'draw-vertical/5', 5), frameRate, false);
    drawVertical.onComplete.add(() => animations.play('waiting'));
    //画上凸bugle
    let drawBugle = animations.add('draw-bugle', Utils.concatRepeat([], 'draw-bugle/1', 9, 'draw-bugle/2', 5, 'draw-bugle/3', 5, 'draw-bugle/4', 5, 'draw-bugle/5', 5), frameRate, false);
    drawBugle.onComplete.add(() => animations.play('waiting'));
    //画下凹sunken
    let drawSunken = animations.add('draw-sunken', Utils.concatRepeat([], 'draw-sunken/1', 9, 'draw-sunken/2', 5, 'draw-sunken/3', 5, 'draw-sunken/4', 5, 'draw-sunken/5', 5), frameRate, false);
    drawSunken.onComplete.add(() => animations.play('waiting'));
    //画闪电lightning
    let drawLightning = animations.add('draw-lightning', Utils.concatRepeat([], 'draw-lightning/1', 10, 'draw-lightning/2', 4, 'draw-lightning/3', 5, 'draw-lightning/4', 5, 'draw-lightning/5', 5), frameRate, false);
    drawLightning.onComplete.add(() => animations.play('waiting'));
    //画桃心heart
    let drawHeart = animations.add('draw-heart', Utils.concatRepeat([], 'draw-heart/1', 9, 'draw-heart/2', 5, 'draw-heart/3', 5, 'draw-heart/4', 5, 'draw-heart/5', 5), frameRate, false);
    drawHeart.onComplete.add(() => animations.play('waiting'));
    //受伤hurt
    let hurt = animations.add('hurt', Utils.concatRepeat([], 'hurt/1', 4, 'hurt/2', 5, 'hurt/3', 5, 'hurt/4', 7), frameRate, false);
    hurt.onComplete.add(() => animations.play('waiting'));
    //胜利victory
    animations.add('victory', Utils.concatRepeat([], 'victory/1', 9, 'victory/2', 5, 'victory/3', 5, 'victory/4', 5, 'victory/5', 5, 'victory/6', 5, 'victory/7', 5, 'victory/8', 5, 'victory/9', 5, 'victory/10', 5, 'victory/11', 5, 'victory/12', 5, 'victory/13', 5, 'victory/14', 5, 'victory/15', 5, 'victory/16', 5, 'victory/17', 5, 'victory/18', 1), frameRate, false);
    //死亡die
    animations.add('die', Utils.concatRepeat([], 'die/1', 5, 'die/2', 9, 'die/3', 11, 'die/4', 10, 'die/5', 5, 'die/6', 5, 'die/7', 5, 'die/8', 5, 'die/9', 5, 'die/10', 5, 'die/11', 20, 'die/12', 5, 'die/13', 5, 'die/14', 5, 'die/15', 5, 'die/16', 1), frameRate, false);
  }

  //播放跑动动画及音频
  playRun(play: boolean = true) {
    if (play) {
      this.play('run');
      this.game.audio.playEffect('player-run');
    } else {
      this.play('waiting');
      this.game.audio.playEffect(null);
    }
  }

  /*
  -------------------------------------------------------------
  | 内部工具
  -------------------------------------------------------------
  */

  //获取当前触点所在坐标
  public getActivePoint(gap: number = 0): Point {
    let pointer = this.game.input.activePointer;
    return new Point(pointer.x - gap, pointer.y - gap);
  }

}

export default Player;