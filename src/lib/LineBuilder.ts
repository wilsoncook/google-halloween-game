import { Point } from '../core/Utils';
import { LifeFigureValue } from './LifeFigure';

//画线处理器
export class LineBuilder {

  // static baseVector: Point = new Point(1, 0); //基线向量，用于计算线段的相对角度
  static baseVector = { //基线向量，用于计算线段的相对角度
    start: new Point(0, 0),
    end: new Point(1, 0)
  };
  static softAngle: number = 10; //[配置值]横竖线的容错角度（此值越大，则越容易匹配为横竖线，而非斜线）

  private points: Point[]; //原始散列点集合
  private keyPoints: Point[]; //关键点集合
  private lines: Line[]; //计算出的线段结果（由于图形的限制，该数组数量会被限制，目前只有“闪电”图形，会用到最多的3条线段）
  private lastFakeLine: Line; //最后一条模拟线段，仅用于实时显示
  private lastIndex: number; //上次计算后，停留在的最后一个点在points中的索引（会作为下一次计算的起始位置）
  private maxLines: number = 20; //限制最大线段数量，0表示不限制（若超出后，老的线段会被移除）注：若设置过小，可能导致判断失效
  private precision: number; //筛选关键点时使用的精度，一般为lineWidth的一半（单位：px）
  private lineWidth: number; //画线的宽度

  // private resultFigure: LineFigure; //最终计算所得的图形

  //图形匹配规则（用于直接匹配为指定图形）
  static FigureRules: LineFigureRule[] = [{ //竖线
    exactMatch: true,
    figure: LifeFigureValue.VERTICAL,
    ruleList: [{ types: [LineType.DOWN, LineType.UP], range: [1, 2]  }]
  }, { //横线
    exactMatch: true,
    figure: LifeFigureValue.HORIZONTAL,
    ruleList: [{ types: [LineType.LEFT, LineType.RIGHT], range: [1, 2] }]
  }, { //上凸
    exactMatch: true,
    figure: LifeFigureValue.BULGE,
    ruleList: [
      {types: LineType.DOWN_RIGHT, range: [1, 4] }, // 6 [1,4]
      { types: LineType.RIGHT, range: [0, 2] }, // 1 [0,2]
      { types: [LineType.UP, LineType.UP_RIGHT], range: [1, 4] } // 3|5 [1,4]
    ]
  }, {
    exactMatch: true,
    figure: LifeFigureValue.BULGE,
    ruleList: [
      LineType.DOWN, // 4
      { types: LineType.DOWN_RIGHT, range: [0, 3] }, // 6 [0,3]
      { types: LineType.RIGHT, range: [0, 2] }, // 1 [0,2]
      { types: LineType.UP_RIGHT, range: [1, 4] } // 5 [1,4]
    ]
  },{
    exactMatch: true,
    figure: LifeFigureValue.BULGE,
    ruleList: [
      { types: LineType.DOWN_LEFT, range: [1, 4] }, // 8 [1,4]
      { types: LineType.LEFT, range: [0, 2] },  // 2 [0,2]
      { types: [LineType.UP, LineType.UP_LEFT], range: [1, 4] } // 3|7 [1,4]
    ]
  }, {
    exactMatch: true,
    figure: LifeFigureValue.BULGE,
    ruleList: [
      LineType.DOWN, // 4
      { types: LineType.DOWN_LEFT, range: [0, 3] }, // 8 [0,3]
      { types: LineType.LEFT, range: [0, 2] }, // 2 [0,2]
      { types: LineType.UP_LEFT, range: [1, 4] } // 7 [1,4]
    ]
  }, { //下凹
    exactMatch: true,
    figure: LifeFigureValue.SUNKEN,
    ruleList: [
      {types: LineType.UP_RIGHT, range: [1, 4] }, // 5 [1,4]
      { types: LineType.RIGHT, range: [0, 2] }, // 1 [0,2]
      { types: [LineType.DOWN, LineType.DOWN_RIGHT], range: [1, 4] } // 4|6 [1,4]
    ]
  }, {
    exactMatch: true,
    figure: LifeFigureValue.SUNKEN,
    ruleList: [
      LineType.UP, // 3
      { types: LineType.UP_RIGHT, range: [0, 3] }, // 5 [0,3]
      { types: LineType.RIGHT, range: [0, 2] }, // 1 [0,2]
      { types: LineType.DOWN_RIGHT, range: [1, 4] } // 6 [1,4]
    ]
  },{
    exactMatch: true,
    figure: LifeFigureValue.SUNKEN,
    ruleList: [
      { types: LineType.UP_LEFT, range: [1, 4] }, // 7 [1,4]
      { types: LineType.LEFT, range: [0, 2] },  // 2 [0,2]
      { types: [LineType.DOWN, LineType.DOWN_LEFT], range: [1, 4] } // 4|8 [1,4]
    ]
  }, {
    exactMatch: true,
    figure: LifeFigureValue.SUNKEN,
    ruleList: [
      LineType.UP, // 3
      { types: LineType.UP_LEFT, range: [0, 3] }, // 7 [0,3]
      { types: LineType.LEFT, range: [0, 2] }, // 2 [0,2]
      { types: LineType.DOWN_LEFT, range: [1, 4] } // 8 [1,4]
    ]
  }, { //闪电
    figure: LifeFigureValue.LIGHTNING,
    ruleList: [
      { types: [LineType.DOWN_LEFT, LineType.DOWN], range: [1, 4] }, // 8|4 [1,4]
      { types: [LineType.RIGHT, LineType.DOWN_RIGHT], range: [1, 4] }, // 1|6 [1,4]
      { types: [LineType.DOWN_LEFT, LineType.DOWN], range: [1, 4] } // 8|4 [1,4]
    ]
  }];

  //初始化
  constructor(lineWidth: number = 20) {
    this.points = [];
    this.keyPoints = [];
    this.lines = [];
    this.lastIndex = 0;
    this.lineWidth = lineWidth;
    this.precision = lineWidth / 2;
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
  public calculate(isEnd: boolean = false): void {
    let line: Line = null, { lines, maxLines } = this;
    while(line = this.calculateOneLine(isEnd)) {
      console.debug('[Player.calculateLines]新增了一条线段');
      if (maxLines && lines.length > maxLines) { //若线段数量超量，则移除旧的
        console.debug('[Player.calculateLines]移除一条旧的线段');
        lines.shift();
      }
    }
  }

  /**
   * 计算指定线段所构成的图形
   * @param  {Line[]} lines 指定线段列表，默认为当前线段列表
   */
  public calculateFigure(lines: Line[] = this.lines, debugCtx?: CanvasRenderingContext2D): LifeFigureValue {
    let rules = LineBuilder.FigureRules;
    //按顺序判断基本图形
    for (let rule of rules) {
      if (this.isMatchFigureRule(lines, rule)) {
        return rule.figure;
      }
    }
    //匹配桃心
    if (this.isMatchHeart(lines, this.lineWidth, debugCtx)) {
      return LifeFigureValue.HEART;
    }
    return null;
  }

  /**
   * DEBUG 画出所有线段及其相关信息
   * @param  {Phaser.BitmapData} pallete 将要画写到的画板对象（注：此画板的尺寸必须囊括所有线段的点，比如直接是Player的pallete属性）
   */
  public drawDebugInfo(pallete: Phaser.BitmapData) {
    let ctx = pallete.ctx, lines = [].concat(this.lines); //创建一个新的线段数组用于显示，避免影响原数组
    if (this.lastFakeLine) { //若有模拟线段，则加入显示
      lines.push(this.lastFakeLine);
    }
    // console.log('--------lines length: ', lines.length);
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
    let figure = this.calculateFigure(lines, ctx);
    let label = '';
    switch (figure) {
      case LifeFigureValue.VERTICAL: label = 'VERTICAL'; break;
      case LifeFigureValue.HORIZONTAL: label = 'HORIZONTAL'; break;
      case LifeFigureValue.BULGE: label = 'BULGE'; break;
      case LifeFigureValue.SUNKEN: label = 'SUNKEN'; break;
      case LifeFigureValue.LIGHTNING: label = 'LIGHTNING'; break;
      case LifeFigureValue.HEART: label = 'HEART'; break;
    }
    ctx.fillText(`当前图形: ${label}`, pallete.width - 100, 12);

    pallete.dirty = true; //更新显示
    ctx.restore();
  }

  //创建一个线段对象
  private createLine(startPoint: Point, endPoint: Point, isFake: boolean = false): Line {
    // let vector = new Point(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
    let { start, end } = LineBuilder.baseVector, angle = Point.getAngleBetween(startPoint, endPoint, start, end);
    let line = {
      startPoint: startPoint,
      endPoint: endPoint,
      // angle: Point.angle(vector, MagicLineProcessor.baseVector) //相对基线向量的角度
      angle: angle,
      type: this.getLineType(startPoint, endPoint, angle), //计算该线段的图形
      isFake: isFake
    };
    if (line.isFake) {
      this.lastFakeLine = line;
      return null;
    } else {
      this.lastFakeLine = null; //清除原模拟线，表示已经终结
      return line;
    }
  }

  //通过两点计算出所代表线段的图形
  private getLineType(start: Point, end: Point, angle?: number): LineType {
    if (Point.equals(start, end)) { throw new Error('[getFigureBetween]意外情况，线段的起始点和终点相同'); }
    if (typeof angle == 'undefined') {
      let { start: baseStart, end: baseEnd } = LineBuilder.baseVector;
      angle = Point.getAngleBetween(start, end, baseStart, baseEnd);
    }
    let { x: x1, y: y1 } = start, { x: x2, y: y2 } = end, a = LineBuilder.softAngle, type: LineType = null;
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
        // console.log('currentIndex: ', currentIndex);
        // console.log('------当前线段的类型和需要匹配的类型列表：', lines[currentIndex].type, rule.types);
        if (rule.types.indexOf(lines[currentIndex].type) != -1) { //匹配
          appearTimes++;
          if (appearTimes > max) { //这里提前作出判断，避免多余循环，浪费性能（超量，表示整个匹配失败，[直接退出]）
            // console.log('------appearTimes超出: ', appearTimes);
            return false;
          }
        } else { //类型不匹配
          // console.log('不匹配，继续下一个匹配break;');
          break; //继续下一个类型的匹配（要根据后面的监测看是否匹配成功）
        }
      }
      //核算匹配次数
      if (appearTimes >= min && appearTimes <= max) { //在合理范围，本次匹配成功
        continue; //标记此type被匹配上[继续下一个type的匹配]
      } else {
        // console.log('------匹配失败: ', appearTimes);
        return false; //本次匹配失败[直接退出]
      }
    }
    //检查是否需要完整匹配
    if (figureRule.exactMatch && currentIndex > -1) { //若需完整匹配，而当前线段列表还未遍历完，则代表遍历失败（遍历完时currentIndex应该为-1）
      // console.log('-----需要完整匹配，而原线段列表还未遍历完，所以匹配失败');
      return false;
    }
    //全部已匹配
    return true;
  }

  /**
   * 是否匹配桃心图形
   * @param  {Line[]} lines
   * @param  {number} lineWidth 线宽（用于计算封口处的误差）
   * @param  {CanvasRenderingContext2D} debugCtx? 指定ctx对象来进行调试，将画出外边框和内边框
   */
  private isMatchHeart(lines: Line[], lineWidth: number, debugCtx?: CanvasRenderingContext2D) {
    let keyPoints = this.keyPoints;
    if (lines.length < 3) { return false; } //[判断条件-1]线段数量须>=3
    if (Point.distance(keyPoints[0], keyPoints[keyPoints.length - 1]) > lineWidth * 2) { return false; } //[判断条件-2]第一个点和最后一个点距离不得超过ctx.lineWidth * n
    //算出最外的点坐标
    let
      firstPoint = this.keyPoints[0],
      top: number = firstPoint.y, bottom: number = firstPoint.y, left: number = firstPoint.x, right: number = firstPoint.x; //将第一个点坐标作为计算的初始值
    //计算外框矩形
    this.keyPoints.forEach((point) => {
      if (point.y < top) { top = point.y; }
      if (point.y > bottom) { bottom = point.y; }
      if (point.x < left) { left = point.x; }
      if (point.x > right) { right = point.x; }
    });
    let outerRect = new Phaser.Rectangle(left, top, right - left, bottom - top);
    //内框矩形
    let leftGap = outerRect.width * 0.2, innerWidth = outerRect.width - leftGap * 2, topGap = outerRect.height * 0.4, innerHeight = outerRect.height - topGap - outerRect.height * 0.2;
    if (innerWidth < 10 || innerHeight < 10) { return false; } //[判断条件-3]内框宽高须>=10
    let innerRect = new Phaser.Rectangle(outerRect.x + leftGap, outerRect.y + topGap, innerWidth, innerHeight);
    // //边框的4个角的点
    // let leftTop = new Point(left, top), rightTop = new Point(right, top), leftBottom = new Point(left, bottom), rightBottom = new Point(right, bottom);
    
    //在内框中，关键点的个数
    let invalidNum = 0, invalidPercent = 0;
    this.keyPoints.forEach((point) => {
      if (innerRect.contains(point.x, point.y)) { invalidNum++; }
    });
    invalidPercent = Math.floor((invalidNum / this.keyPoints.length) * 100);
    if (invalidPercent > 10) { return false; } //[判断条件-4]内框中关键点个数不得超过10%

    //[DEBUG]画出debug图形
    if (debugCtx) {
      debugCtx.save();

      //画出外边框
      debugCtx.strokeStyle = 'blue';
      debugCtx.lineWidth = 1;
      debugCtx.strokeRect(outerRect.x, outerRect.y, outerRect.width, outerRect.height);
      //画出内边框
      debugCtx.strokeStyle = 'green';
      debugCtx.strokeRect(innerRect.x, innerRect.y, innerRect.width, innerRect.height);

      debugCtx.restore();
    }

    //所有条件通过，返回true
    return true;
  }

  /**
   * 从计算结果对象中，计算出下一条线段（若未能找到，则返回null）
   * @param  {boolean=false} isEnd 当前是否是处于画线结尾（用于暂时找不到转折点的情况下，当遇到最后一个点时，该点即作为线段的结尾）
   * @returns MagicLine | null 返回找到的那条线段
   */
  private calculateOneLine(isEnd: boolean = false): Line {
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
        if (isEnd) { //2.1.若这此是最后一次计算（后面不会再新增散列点了），则并作一条线段，然后结束掉
          line = this.createLine(firstPoint, middlePoint);
          this.lastIndex = i + 1;
          break;
        } else { //2.2.若不是最后一次计算，则需要等待下一个转折点（新的散列点加入），才能确定这条线段的结束，所以直接退出
          this.createLine(firstPoint, middlePoint, true); //创建保存一个模拟线段，仅用于实时显示信息，不加入线段计算中
          return null; //[直接退出]
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

      // console.log(`startAngle: ${startAngle}, firstAngle: ${firstAngle}`);
      if (startAngle < 40 && firstAngle < 20) { //若两种夹角都满足，则将其归纳为同一条线段
        continue; //继续下一个判断（直到找到该线段的终点）
      } else { //若夹角不满足，则表示遇到了转折点
        line = this.createLine(firstPoint, middlePoint); //初始点和当前中间点作为一条线段
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

//线段类型匹配规则及其集合（用于匹配判断图形）
export interface LineRule {
  types: LineType | LineType[]; //多种类型（或的关系）
  range?: number[]; //该类型值的重复范围
}
//组合图形的匹配规则
export interface LineFigureRule {
  figure: LifeFigureValue; //该规则所匹配的图形
  ruleList: (LineRule | LineType)[]; //规则列表
  exactMatch?: boolean; //是否执行完整匹配（即ruleList的最后一个规则匹配完剩余的所有线段）
}

//线段类型
export const enum LineType {
  LEFT, RIGHT, //横线：左方、右方
  UP, DOWN, //竖线：上方、下方
  UP_RIGHT, UP_LEFT, //斜线：斜上右方、斜上左方
  DOWN_RIGHT, DOWN_LEFT //斜线：斜下右方、斜下左方
}

//线段
export interface Line {
  // points: Point[]; //属于该线段的原始散列点集合
  startPoint: Point; //起点
  endPoint: Point; //终点
  angle: number; //与向量<0, 1>之间的角度
  type: LineType; //所属图形
  isFake: boolean; //标记该线段是否是模拟线段（用于在画线过程中，标记最近算出来的一条线段，但它并非是最终确定的线段，所以下一次重新计算线段时，若有新的线段需要加入，则此线段必须先移除）
}