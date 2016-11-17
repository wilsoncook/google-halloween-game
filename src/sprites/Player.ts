import { Sprite } from '../core/Sprite';
import { Point } from '../core/Utils';

export class Player extends Sprite {
  
  private processor: LineProcessor = null; //当前画线处理器，用于记录每次画线的线段（有值则代表当前正处于画线中）
  private pallete: Phaser.BitmapData; //画板对象，用于画线

  //初始化
  initialize() {
    this.createPallete();
  }

  preload() {
    console.log(`Player's resources is all loaded`);
  }

  //创建画板对象
  private createPallete(): void {
    let pointer = this.game.input.activePointer;
    this.pallete = this.game.add.bitmapData(this.game.width, this.game.height);
    this.pallete.addToWorld();
    let ctx = this.pallete.ctx;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 20;
    ctx.lineCap = ctx.lineJoin = 'round';

    let pointGap = 0; //ctx.lineWidth / 2;
    //[事件]鼠标按下
    this.game.input.onDown.add(() => {
      this.processor = new LineProcessor(ctx.lineWidth / 2); //新的一个画线开始
      this.processor.addPoint(this.getActivePoint(pointGap)); //一个开始的坐标点
    });
    //[事件]鼠标移动
    this.game.input.addMoveCallback(() => {
      if (this.processor) {
        this.processor.addPoint(this.getActivePoint(pointGap)); //加入移动时的坐标点
        this.processor.calculate(); //执行一次线段计算
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
        this.pallete.dirty = true; //标记该bitmap对象已脏，需要重绘
      }
    }, null);
    //[事件]鼠标抬起
    this.game.input.onUp.add(() => {
      if (this.processor) { //由于及时没有产生ondown事件，鼠标从外面移入游戏中时，也会触发onup，所以这里需要判断下
        this.processor.calculate(true);
        console.log('----画线完毕: ', this.processor);

        //debug 绘制所有线段
        this.drawMagicLines(this.processor.getLines());
        //debug end

        this.processor = null;
      }
    });
  }

  //DEBUG 画出所有线段
  private drawMagicLines(lines: Line[]) {
    let ctx = this.pallete.ctx;
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.font = '12px serif';
    lines.forEach((line) => {
      let start = line.startPoint, end = line.endPoint;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      
      //绘制中间的角度值
      let middlePoint = Point.getMiddlePoint(start, end), label = '';
      switch (line.type) {
        case LineType.DOWN: label = 'DOWN'; break;
        case LineType.UP: label = 'UP'; break;
        case LineType.RIGHT: label = 'RIGHT'; break;
        case LineType.LEFT: label = 'LEFT'; break;
        case LineType.UP_LEFT: label = 'UP_LEFT'; break;
        case LineType.UP_RIGHT: label = 'UP_RIGHT'; break;
        case LineType.DOWN_LEFT: label = 'DOWN_LEFT'; break;
        case LineType.DOWN_RIGHT: label = 'DOWN_RIGHT'; break;
      }
      ctx.fillText(`${line.angle}度, ${label}`, middlePoint.x, middlePoint.y);
    });
    //显示当前图形判断
    let figure = this.processor.calculateCurrentFigure(), label = '';
    switch (figure) {
      case LineFigure.VERTICAL: label = 'VERTICAL'; break;
      case LineFigure.HORIZONTAL: label = 'HORIZONTAL'; break;
      case LineFigure.BULGE: label = 'BULGE'; break;
      case LineFigure.SUNKEN: label = 'SUNKEN'; break;
      case LineFigure.LIGHTNING: label = 'LIGHTNING'; break;
      case LineFigure.HEART: label = 'HEART'; break;
    }
    ctx.fillText(`当前图形: ${label}`, 600, 12);

    this.pallete.dirty = true; //更新显示
    ctx.restore();
  }

  // //whether match a pattern
  // private isPattern(points: Point[], pattern: string): boolean {
  //   if (!points.length) { return false; }
  //   if (pattern == 'vertical-line') {
  //     let head = points[0];
  //     for (let point of points) {
  //       if (Math.abs(point.x - head.x) > 80) {
  //         return false;
  //       }
  //     }
  //   }
  // }

};


//组合图形
const enum LineFigure {
  BULGE, SUNKEN, //上凸、下凹
  VERTICAL, HORIZONTAL, //竖线、横线
  LIGHTNING, HEART //闪电、桃心
}

//线段类型匹配规则及其集合（用于匹配判断图形）
interface LineRule {
  types: LineType | LineType[]; //多种类型（或的关系）
  range?: number[]; //该类型值的重复范围
}
//组合图形的匹配规则
type RuleList = (LineRule | LineType)[];
interface LineFigureRule {
  figure: LineFigure; //该规则所匹配的图形
  ruleList: RuleList; //规则列表
  exactMatch?: boolean; //是否执行完整匹配（即ruleList的最后一个规则匹配完剩余的所有线段）
}

//线段类型
const enum LineType {
  LEFT, RIGHT, //横线：左方、右方
  UP, DOWN, //竖线：上方、下方
  UP_RIGHT, UP_LEFT, //斜线：斜上右方、斜上左方
  DOWN_RIGHT, DOWN_LEFT //斜线：斜下右方、斜下左方
}

//线段
interface Line {
  // points: Point[]; //属于该线段的原始散列点集合
  startPoint: Point; //起点
  endPoint: Point; //终点
  angle: number; //与向量<0, 1>之间的角度
  type: LineType; //所属图形
}

//画线处理器
class LineProcessor {

  // static baseVector: Point = new Point(1, 0); //基线向量，用于计算线段的相对角度
  static baseVector = { //基线向量，用于计算线段的相对角度
    start: new Point(0, 0),
    end: new Point(1, 0)
  };
  static softAngle: number = 10; //[配置值]横竖线的容错角度（此值越大，则越容易匹配为横竖线，而非斜线）

  private points: Point[]; //原始散列点集合
  private keyPoints: Point[]; //关键点集合
  private lines: Line[]; //计算出的线段结果（由于图形的限制，该数组数量会被限制，目前只有“闪电”图形，会用到最多的3条线段）
  private lastIndex: number; //上次计算后，停留在的最后一个点在points中的索引（会作为下一次计算的起始位置）
  private maxLines: number; //限制最大线段数量，0表示不限制（若超出后，老的线段会被移除）注：若设置过小，可能导致判断失效
  private precision: number; //筛选关键点时使用的精度（单位：px）

  //图形匹配规则（用于直接匹配为指定图形）
  static FigureRules: LineFigureRule[] = [{ //竖线
    exactMatch: true,
    figure: LineFigure.VERTICAL,
    ruleList: [{ types: [LineType.DOWN, LineType.UP], range: [1, 2]  }]
  }, { //横线
    exactMatch: true,
    figure: LineFigure.HORIZONTAL,
    ruleList: [{ types: [LineType.LEFT, LineType.RIGHT], range: [1, 2] }]
  }, { //上凸
    exactMatch: true,
    figure: LineFigure.BULGE,
    ruleList: [
      {types: LineType.DOWN_RIGHT, range: [1, 4] }, // 6 [1,4]
      { types: LineType.RIGHT, range: [0, 2] }, // 1 [0,2]
      { types: [LineType.UP, LineType.UP_RIGHT], range: [1, 4] } // 3|5 [1,4]
    ]
  }, {
    exactMatch: true,
    figure: LineFigure.BULGE,
    ruleList: [
      LineType.DOWN, // 4
      { types: LineType.DOWN_RIGHT, range: [0, 3] }, // 6 [0,3]
      { types: LineType.RIGHT, range: [0, 2] }, // 1 [0,2]
      { types: LineType.UP_RIGHT, range: [1, 4] } // 5 [1,4]
    ]
  },{
    exactMatch: true,
    figure: LineFigure.BULGE,
    ruleList: [
      { types: LineType.DOWN_LEFT, range: [1, 4] }, // 8 [1,4]
      { types: LineType.LEFT, range: [0, 2] },  // 2 [0,2]
      { types: [LineType.UP, LineType.UP_LEFT], range: [1, 4] } // 3|7 [1,4]
    ]
  }, {
    exactMatch: true,
    figure: LineFigure.BULGE,
    ruleList: [
      LineType.DOWN, // 4
      { types: LineType.DOWN_LEFT, range: [0, 3] }, // 8 [0,3]
      { types: LineType.LEFT, range: [0, 2] }, // 2 [0,2]
      { types: LineType.UP_LEFT, range: [1, 4] } // 7 [1,4]
    ]
  }, { //下凹
    exactMatch: true,
    figure: LineFigure.SUNKEN,
    ruleList: [
      {types: LineType.UP_RIGHT, range: [1, 4] }, // 5 [1,4]
      { types: LineType.RIGHT, range: [0, 2] }, // 1 [0,2]
      { types: [LineType.DOWN, LineType.DOWN_RIGHT], range: [1, 4] } // 4|6 [1,4]
    ]
  }, {
    exactMatch: true,
    figure: LineFigure.SUNKEN,
    ruleList: [
      LineType.UP, // 3
      { types: LineType.UP_RIGHT, range: [0, 3] }, // 5 [0,3]
      { types: LineType.RIGHT, range: [0, 2] }, // 1 [0,2]
      { types: LineType.DOWN_RIGHT, range: [1, 4] } // 6 [1,4]
    ]
  },{
    exactMatch: true,
    figure: LineFigure.SUNKEN,
    ruleList: [
      { types: LineType.UP_LEFT, range: [1, 4] }, // 7 [1,4]
      { types: LineType.LEFT, range: [0, 2] },  // 2 [0,2]
      { types: [LineType.DOWN, LineType.DOWN_LEFT], range: [1, 4] } // 4|8 [1,4]
    ]
  }, {
    exactMatch: true,
    figure: LineFigure.SUNKEN,
    ruleList: [
      LineType.UP, // 3
      { types: LineType.UP_LEFT, range: [0, 3] }, // 7 [0,3]
      { types: LineType.LEFT, range: [0, 2] }, // 2 [0,2]
      { types: LineType.DOWN_LEFT, range: [1, 4] } // 8 [1,4]
    ]
  }, { //闪电
    figure: LineFigure.LIGHTNING,
    ruleList: [
      { types: [LineType.DOWN_LEFT, LineType.DOWN], range: [1, 4] }, // 8|4 [1,4]
      { types: [LineType.RIGHT, LineType.DOWN_RIGHT], range: [1, 4] }, // 1|6 [1,4]
      { types: [LineType.DOWN_LEFT, LineType.DOWN], range: [1, 4] } // 8|4 [1,4]
    ]
  }
  // , {
  //   figure: LineFigure.BULGE,
  //   typeList: [LineType.DOWN_LEFT, { types: LineType.LEFT, range: [0, 4] }, { types: [LineType.UP, LineType.UP_LEFT] }]
  // }, {
  //   figure: LineFigure.BULGE,
  //   typeList: [LineType.DOWN, { types: LineType.LEFT, range: [0, 4] }, LineType.UP_LEFT]
  // }
  ];

  //初始化
  constructor(precision: number = 20, maxLines: number = 20) {
    this.points = [];
    this.keyPoints = [];
    this.lines = [];
    this.lastIndex = 0;
    this.maxLines = maxLines;
    this.precision = precision;
  }

  //获取所有线段列表
  public getLines() {
    return this.lines;
  }

  //添加新的散列点
  public addPoint(point: Point) {
    this.points.push(point);
    this.keyPoints.push(point);
  }

  //获取当前所有散列点列表
  public getPoints(): Point[] {
    return this.points;
  }

  //累加计算线段
  public calculate(forceClose: boolean = false): void {
    let line: Line = null, { lines, maxLines } = this;
    while(line = this.calculateOneLine(forceClose)) {
      console.debug('[Player.calculateLines]新增了一条线段');
      if (maxLines && lines.length > maxLines) { //若线段数量超量，则移除旧的
        console.debug('[Player.calculateLines]移除一条旧的线段');
        lines.shift();
      }
    }
  }

  //计算当前线段所构成的图形
  public calculateCurrentFigure(): LineFigure {
    let rules = LineProcessor.FigureRules;
    //[优先]竖线
    for (let rule of rules) {
      if (this.isMatchFigureRule(this.lines, rule)) {
        return rule.figure;
      }
    }
    return null;
  }

  //创建一个线段对象
  private createMagicLine(startPoint: Point, endPoint: Point): Line {
    // let vector = new Point(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
    let { start, end } = LineProcessor.baseVector, angle = Point.getAngleBetween(startPoint, endPoint, start, end);
    return {
      startPoint: startPoint,
      endPoint: endPoint,
      // angle: Point.angle(vector, MagicLineProcessor.baseVector) //相对基线向量的角度
      angle: angle,
      type: this.getLineType(startPoint, endPoint, angle) //计算该线段的图形
    };
  }

  //通过两点计算出所代表线段的图形
  private getLineType(start: Point, end: Point, angle?: number): LineType {
    if (Point.equals(start, end)) { throw new Error('[getFigureBetween]意外情况，线段的起始点和终点相同'); }
    if (typeof angle == 'undefined') {
      let { start: baseStart, end: baseEnd } = LineProcessor.baseVector;
      angle = Point.getAngleBetween(start, end, baseStart, baseEnd);
    }
    let { x: x1, y: y1 } = start, { x: x2, y: y2 } = end, a = LineProcessor.softAngle, type: LineType = null;
    switch (true) { //[注]此处代码冗余较多，待优化
      case (x1 < x2 && (angle >= 0 && angle <= a)): type = LineType.RIGHT; break;
      case (x1 > x2 && (angle >= 180 - a && angle <= 180)): type = LineType.LEFT; break;
      case (y1 > y2 && (angle >= 90 - a && angle <= 90 + a)): type = LineType.UP; break;
      case (y1 < y2 && (angle >= 90 - a && angle <= 90 + a)): type = LineType.DOWN; break;
      case (y1 > y2 && (angle > a && angle < 90 - a)): type = LineType.UP_RIGHT; break;
      case (y1 < y2 && (angle > a && angle < 90 - a)): type = LineType.DOWN_RIGHT; break;
      case (y1 > y2 && (angle > 90 + a && angle < 180 - a)): type = LineType.UP_LEFT; break;
      case (y1 < y2 && (angle > 90 + a && angle < 180 - a)): type = LineType.DOWN_LEFT; break;
    }
    return type;
  }

  /**
   * 判断是否满足某个图形匹配规则
   * @param  {Line[]} lines
   * @param  {LineFigureRule} figureRule
   */
  private isMatchFigureRule(lines: Line[], figureRule: LineFigureRule): boolean {
    if (!lines.length) { return false; }
    let ruleList = figureRule.ruleList, currentIndex = lines.length - 1; //从最后往前找
    //遍历规则
    for (let i = 0, len = ruleList.length; i < len; i++) {
      let rule = ruleList[i];
      //统一格式
      if (typeof rule == 'number') { rule = { types: [<LineType>rule] }; } //转换为LineTypeSetInfo对象
      if (!Array.isArray(rule.types)) { rule.types = [rule.types]; } //转换types成数组
      if (!rule.range) { rule.range = [1, 1]; } //默认仅判断1个
      //遍历查询比对
      let appearTimes = 0, [ min, max ] = rule.range;
      for (; currentIndex >= 0; currentIndex--) {
        console.log('currentIndex: ', currentIndex);
        console.log('------当前线段的类型和需要匹配的类型列表：', lines[currentIndex].type, rule.types);
        if (rule.types.indexOf(lines[currentIndex].type) != -1) { //匹配
          appearTimes++;
          if (appearTimes > max) { //这里提前作出判断，避免多余循环，浪费性能（超量，表示整个匹配失败，[直接退出]）
            console.log('------appearTimes超出: ', appearTimes);
            return false;
          }
        } else { //类型不匹配
          console.log('不匹配，继续下一个匹配break;');
          break; //继续下一个类型的匹配（要根据后面的监测看是否匹配成功）
        }
      }
      //核算匹配次数
      if (appearTimes >= min && appearTimes <= max) { //在合理范围，本次匹配成功
        continue; //标记此type被匹配上[继续下一个type的匹配]
      } else {
        console.log('------匹配失败: ', appearTimes);
        return false; //本次匹配失败[直接退出]
      }
    }
    //检查是否需要完整匹配
    if (figureRule.exactMatch && currentIndex > -1) { //若需完整匹配，而当前线段列表还未遍历完，则代表遍历失败（遍历完时currentIndex应该为-1）
      console.log('-----需要完整匹配，而原线段列表还未遍历完，所以匹配失败');
      return false;
    }
    //全部已匹配
    return true;
  }

  /**
   * 从计算结果对象中，计算出下一条线段（若未能找到，则返回null）
   * @param  {boolean=false} forceClose 是否强制判断线段结尾（用于暂时找不到转折点的情况下，当遇到最后一个点时，该点即作为线段的结尾）
   * @returns MagicLine | null 返回找到的那条线段
   */
  private calculateOneLine(forceClose: boolean = false): Line {
    let { lines, lastIndex } = this;
    //---关键点过滤（精度过滤）
    let points = this.keyPoints = Point.filterByPrecision(this.keyPoints, this.precision, lastIndex);
    //---初始位置
    let firstPoint = points[lastIndex], secondPoint = points[lastIndex + 1], line: Line = null;
    //---遍历关键点
    for (let i = lastIndex, len = points.length; i < len; i++) {
      let startPoint = points[i], middlePoint = points[i + 1], endPoint = points[i + 2]; //它的下一个点作为中间点，后一个点作为第三个点（这样用于计算三点构成的两向量间的夹角）
      if (!middlePoint) { //1.若中间点不存在，则无法形成新的线段（无法找到线段终点），直接退出
        break;
      } else if (!endPoint) { //2.若第三点不存在
        if (forceClose) { //2.1.若这此是最后一次计算（后面不会再新增散列点了），则并作一条线段，然后结束掉
          line = this.createMagicLine(firstPoint, middlePoint);
          this.lastIndex = i + 1;
          break;
        } else { //2.2.若不是最后一次计算，则需要等待下一个转折点（新的散列点加入），才能确定这条线段的结束，所以直接退出
          break;
        }
      }
      //3.三点都存在
      let 
        startAngle = Point.getAngleBetween(startPoint, middlePoint, middlePoint, endPoint),
        firstAngle = Point.getAngleBetween(firstPoint, secondPoint, firstPoint, endPoint);
      if (isNaN(startAngle)) {
        console.error(`[MagicLineProcessor.calculateOneLine]startAngle值意外地变为了NaN，需要检查4个点的坐标是否有重合嫌疑: (${startPoint.x}, ${startPoint.y}), (${middlePoint.x}, ${middlePoint.y}), (${middlePoint.x}, ${middlePoint.y}), (${endPoint.x}, ${endPoint.y})`);
        throw new Error('startAngle的值变为了NaN，需要排查程序');
      }
      if (isNaN(firstAngle)) {
        console.error(`[MagicLineProcessor.calculateOneLine]firstAngle值意外地变为了NaN，需要检查4个点的坐标是否有重合嫌疑: (${firstPoint.x}, ${firstPoint.y}), (${secondPoint.x}, ${secondPoint.y}), (${firstPoint.x}, ${firstPoint.y}), (${endPoint.x}, ${endPoint.y})`);
        throw new Error('firstAngle的值变为了NaN，需要排查程序');
      }

      console.log(`startAngle: ${startAngle}, firstAngle: ${firstAngle}`);
      if (startAngle < 40 && firstAngle < 20) { //若两种夹角都满足，则将其归纳为同一条线段
        continue; //继续下一个判断（直到找到该线段的终点）
      } else { //若夹角不满足，则表示遇到了转折点
        line = this.createMagicLine(firstPoint, middlePoint); //初始点和当前中间点作为一条线段
        this.lastIndex = i + 1; //记录最后一点（便于后续新增散列点后，继续计算）
        break;
      }
    }
    if (line) { //若已计算出一条线段，则保存到结果集中
      lines.push(line);
    }
    return line;
  }

}