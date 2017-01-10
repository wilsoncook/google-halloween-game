
/**
 * 静态功能性方法
 */
class Utils {
  
  /**
   * 将重复生成的多个元素与原数组连接，将改变并返回原数组
   * @param  {any[]} origin
   * @param  {T} value
   * @param  {number=1} repeat
   */
  static concatRepeat<T>(origin: any[], ...repeaters: any[]): any[] {
    if (repeaters.length % 2 != 0) { throw new Error('参数格式不正确'); }
    for (let i = 0, len = repeaters.length; i < len; i += 2) {
      let value = repeaters[i], repeat = repeaters[i + 1];
      for (let j = 0; j < repeat; j++) {
        origin.push(value);
      }
    }
    return origin;
  }

}

/**
 * 坐标点
 */
class Point extends Phaser.Point {

  //获取两点间的中点
  static getMiddlePoint(p1: Point, p2: Point): Point {
    return new Point(p1.x + (p2.x - p1.x) / 2, p1.y + (p2.y - p1.y) / 2);
  }

  //获取两线段（向量）间的夹角（由4个点代表）
  static getAngleBetween(A: Point, B: Point, C: Point, D: Point): number {
    let
      AB = { x: B.x - A.x, y: B.y - A.y },
      CD = { x: D.x - C.x, y: D.y - C.y };
    let
      dividend = AB.x * CD.x + AB.y * CD.y,
      divisor = Math.sqrt(Math.pow(AB.x, 2) + Math.pow(AB.y, 2)) * Math.sqrt(Math.pow(CD.x, 2) + Math.pow(CD.y, 2)), //[注]这里可能出现dividend=549，divisor=548.99999999的情况，其实此时他们应该是相等才对，所以导致出现divide>1的情况，从而导致acos()返回NaN
      divide = dividend / divisor;
    if (divide > 1) { divide = 1; } //修正由于求根divisor导致失精度的情况
    let
      radian = Math.acos(divide),
      angle = radian * 180 / Math.PI;
    // console.log(`[getAngleBetween]dividend=${dividend}, divisor=${divisor}, radian=${radian}`);
    return angle;
  }

  /**
   * 通过精度进行过滤，从而仅保留关键点
   * @param  {Point[]} points 原始散列点集合
   * @param  {number} precision 精度值(单位:px像素)
   * @param  {number=0} startIndex 过滤开始的索引位置
   * @return {Point[]} 返回新的仅含关键点的数组
   */
  static filterByPrecision(points: Point[], precision: number, startIndex: number = 0): Point[] {
    if (precision < 1) { throw new Error('精度至少为1'); }
    let
      len = points.length,
      keyPoint: Point = points[startIndex], //第一个点作为关键点
      resultPoints: Point[] = [];
    //拷贝以前的关键点(startIndex之前的)
    for (let i = 0; i < startIndex && i < len; i++) {
      resultPoints.push(points[i]);
    }
    //加入第一个关键点
    resultPoints.push(keyPoint);
    //找寻后面的关键点
    for (let i = startIndex + 1; i < len; i++) {
      if (Point.distance(keyPoint, points[i]) > precision) { //精度外的点保留，精度内的将被过滤掉
        keyPoint = points[i]; //将此点作为下一个关键点
        resultPoints.push(keyPoint); //记录此关键点
      }
    }
    //返回新的关键点列表
    return resultPoints;
  }

}

export default Utils;
export { Utils, Point };