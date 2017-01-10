import { Sprite, SpriteOptions } from './Sprite';
import Player from '../../players/Player';
import { LifeFigure, LifeFigureValue, LifeFigureOptions } from '../../lib/LifeFigure';

/**
 * ghost基类
 */
abstract class Ghost extends Sprite {

  private life: LifeFigure; //血条

  protected player: Player;

  constructor(player: Player, options: GhostOptions) {
    options.maxHealth = options.lifeValues.length; //ghost的生命值等于血条长度
    super(options);
    //初始化
    this.player = player;
    this.life = new LifeFigure(this, options.lifeValues, options.lifeOptions);
    //准备move到player
    this.march();
  }

  /*
  -------------------------------------------------------------
  | 对外api
  -------------------------------------------------------------
  */

  //获得当前血块图形
  getCurrentFigure(): LifeFigureValue|null {
    return this.life.getCurrentFigure();
  }

  /*
  -------------------------------------------------------------
  | 内部流程
  -------------------------------------------------------------
  */

  onBeforeHurt() {
    this.life.reduceFigure();
  }

  //死亡
  onBeforeDie() {
    this.game.audio.playEffect('ghost-normal-die');
  }

  //向player移动
  onBeforeMarch(): any {}
  async march() {
    if (false !== await this.onBeforeMarch()) {
      await this.moveTo(this.player);
      this.onAfterMarch();
      //开始进行攻击
      if (this.player.alive) {
        this.attack();
      }
    }
  }
  onAfterMarch(): any {} //进军完成，已移动到指定位置

  //发起一次攻击
  onBeforeAttack(): any {}
  async attack() {
    await this.onBeforeAttack();
    this.player.hurt();
    console.log('-----hurt over');
    await this.onAfterAttack();
  }
  onAfterAttack(): any {}

}

//ghost特有初始化配置
interface GhostOptions extends SpriteOptions {
  lifeValues: LifeFigureValue[]; //血条值列表
  lifeOptions?: LifeFigureOptions; //其他选项
}

export default Ghost;
export { Ghost, GhostOptions };