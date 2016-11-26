import { Sprite } from '../core/Sprite';
import { Point, Utils } from '../core/Utils';
import { LineProcessor } from '../lib/LineProcessor';

export class Player extends Sprite {
  
  private processor: LineProcessor = null; //当前画线处理器，用于记录每次画线的线段（有值则代表当前正处于画线中）
  private pallete: Phaser.BitmapData; //画板对象，用于画线

  //设置
  protected setConfig() {
    return {
      spriteKey: 'Player',
      x: 200,
      y: 200
    };
  }

  //初始化
  initialize() {
    //创建画板
    this.pallete = this.createPallete();
    //创建动画
    this.initializeAnimations();
  }

  //初始化创建动画
  private initializeAnimations() {
    let animations = this.sprite.animations, frameRate = 60;
    //等待状态
    let waiting: string[] = Utils.concatRepeat([], 'waiting/1', 25, 'waiting/2', 5, 'waiting/3', 5, 'waiting/4', 4, 'waiting/5', 5, 'waiting/6', 15, 'waiting/5', 6, 'waiting/4', 5, 'waiting/3', 5, 'waiting/2', 5, 'waiting/1', 10, 'waiting/7', 5, 'waiting/8', 5, 'waiting/9', 5, 'waiting/10', 5, 'waiting/11', 15, 'waiting/10', 5, 'waiting/9', 5, 'waiting/8', 5, 'waiting/7', 5);
    animations.add('waiting', waiting, frameRate, true);
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

    //test
    animations.play('waiting');
    let gap  = 2000;
    setTimeout(() => animations.play('scared'), gap * 1);
    setTimeout(() => animations.play('drawing'), gap * 2);
    setTimeout(() => animations.play('draw-horizontal'), gap * 3);
    setTimeout(() => animations.play('draw-horizontal'), gap * 4);
    setTimeout(() => animations.play('draw-vertical'), gap * 5);
    setTimeout(() => animations.play('draw-bugle'), gap * 6);
    setTimeout(() => animations.play('draw-sunken'), gap * 7);
    setTimeout(() => animations.play('draw-lightning'), gap * 8);
    setTimeout(() => animations.play('draw-heart'), gap * 9);
  }

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
      this.processor = new LineProcessor(ctx.lineWidth); //新的一个画线开始
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
        this.processor.calculate(true);
        console.log('----画线完毕: ', this.processor);
        //debug 绘制所有线段及其信息
        this.processor.drawDebugInfo(pallete);
        //debug end
        this.processor = null;
      }
    });
    return pallete;
  }

};