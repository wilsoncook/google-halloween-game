import Ghost from '../core/sprite/Ghost';

/**
 * 用于ghost的血条显示和管理
 */
export class LifeFigure {

  private ghost: Ghost; //所属ghost
  private figureDatas: FigureData[] = []; //存放血块类型和图像对象
  private options: LifeFigureOptions; //选项配置

  //给某ghost对象添加血条显示和管理
  constructor(ghost: Ghost, lifeValues: LifeFigureValue[], options?: LifeFigureOptions) {
    this.ghost = ghost;
    this.options = Object.assign({
      // offset: { //起始点相对位置（默认考虑了anchor的位置偏移）
      //   x: - (this.ghost.body.width * this.ghost.anchor.x),
      //   y: - (this.ghost.body.height * this.ghost.anchor.y)
      // }
    }, options);
    //在ghost头顶按顺序创建血块图像
    let create = this.ghost.game.add;
    for (let figure of lifeValues) {
      let image = create.image(0, 0, 'Misc', `figure/${LifeFigureMap[figure]}`);
      ghost.addChild(image);
      this.figureDatas.push({ figure: figure, image: image });
    }
    //位置排列
    this.arrangeFigures();
  }

  //重新排列figures图像位置
  private arrangeFigures() {
    let
      flipHorizontal = this.ghost.options.flipHorizontal, figureWidth = 26, figureHeight = 24,
      startPos = flipHorizontal ? this.ghost.getBodyTopRight(-figureWidth, -figureHeight) : this.ghost.getBodyTopLeft(0, -figureHeight), //起始点位置
      offsetX = 0; //累加x坐标
    console.log('--arrangeFigures', this.ghost.body.width, this.ghost.anchor.x, this.ghost.body.height, this.ghost.anchor.y);
    this.figureDatas.forEach((data) => {
      data.image.x = startPos.x + offsetX;
      data.image.y = startPos.y;
      offsetX += flipHorizontal ? -figureWidth : figureWidth; //向右 或 左继续排列
    });
  }

  //获取当前图形
  getCurrentFigure(): LifeFigureValue|null {
    return this.figureDatas.length ? this.figureDatas[0].figure : null;
  }

  //减少一个figure图形，并调整显示位置
  reduceFigure() {
    this.figureDatas.shift().image.destroy();
    this.arrangeFigures();
  }

}

//资源字符串映射表
export const LifeFigureMap = {
  [LifeFigureValue.BULGE]: 'bugle',
  [LifeFigureValue.SUNKEN]: 'sunken',
  [LifeFigureValue.VERTICAL]: 'vertical',
  [LifeFigureValue.HORIZONTAL]: 'horizontal',
  [LifeFigureValue.LIGHTNING]: 'lightning',
  [LifeFigureValue.HEART]: 'heart'
}

//血条值（形状）
export const enum LifeFigureValue {
  BULGE = 1, SUNKEN = 2, //上凸、下凹
  VERTICAL = 3, HORIZONTAL = 4, //竖线、横线
  LIGHTNING = 5, HEART = 6 //闪电、桃心
}

interface FigureData {
  figure: LifeFigureValue; //所属图形
  image: Phaser.Image; //显示图像
}

export interface LifeFigureOptions {
  // flipHorizontal: boolean; //是否水平翻转 - 从左上角到右上角依次显示（否则是反方向: 从右上角到左上角依次显示） [该选项直接在SpriteOptions中获取]
  // offset?: { x: number, y: number }; //图像的初始显示位置
}

export default LifeFigure;