import { Sprite } from '../core/Sprite';
import { Point } from '../core/Utils';
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
    //等待状态
    let waiting: string[] = [
      'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 
      'w-2.png', 'w-2.png', 'w-2.png', 'w-2.png', 'w-2.png', 
      'w-3.png', 'w-3.png', 'w-3.png', 'w-3.png', 'w-3.png', 
      'w-4.png', 'w-4.png', 'w-4.png', 'w-4.png', 
      'w-5.png', 'w-5.png', 'w-5.png', 'w-5.png', 'w-5.png', 
      'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 'w-6.png', 
      'w-5.png', 'w-5.png', 'w-5.png', 'w-5.png', 'w-5.png', 'w-5.png', 
      'w-4.png', 'w-4.png', 'w-4.png', 'w-4.png', 'w-4.png', 
      'w-3.png', 'w-3.png', 'w-3.png', 'w-3.png', 'w-3.png', 
      'w-2.png', 'w-2.png', 'w-2.png', 'w-2.png', 'w-2.png', //注，这里可能是w-12
      'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 'w-1.png', 
      'w-7.png', 'w-7.png', 'w-7.png', 'w-7.png', 'w-7.png', 
      'w-8.png', 'w-8.png', 'w-8.png', 'w-8.png', 'w-8.png', 
      'w-9.png', 'w-9.png', 'w-9.png', 'w-9.png', 'w-9.png', 
      'w-10.png', 'w-10.png', 'w-10.png', 'w-10.png', 'w-10.png', 
      'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 'w-11.png', 
      'w-10.png', 'w-10.png', 'w-10.png', 'w-10.png', 'w-10.png', 
      'w-9.png', 'w-9.png', 'w-9.png', 'w-9.png', 'w-9.png', 
      'w-8.png', 'w-8.png', 'w-8.png', 'w-8.png', 'w-8.png', 
      'w-7.png', 'w-7.png', 'w-7.png', 'w-7.png', 'w-7.png'
    ];
    this.sprite.animations.add('waiting', waiting, 60, true, true);
    //test
    this.sprite.animations.play('waiting');
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