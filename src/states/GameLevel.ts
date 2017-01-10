import State from '../core/state/State';
import Player from '../players/Player';
//关卡
import Level from '../core/Level';
import Level1 from '../levels/Level1';

/**
 * 游戏关卡管理器（控制关卡的生成和切换）
 */
class GameLevel extends State {

  score: number = 0; //当前总得分
  player: Player; //游戏唯一主角
  background: Phaser.Image; //背景图
  blackMask: Phaser.Graphics; //场景切换黑幕遮罩

  //关卡顺序
  levels = [
    Level1 //第一关
  ];
  //当前关卡索引
  currentIndex: number = -1;
  currentLevel: Level = null;

  /*
  -------------------------------------------------------------
  | 流程相关
  -------------------------------------------------------------
  */

  //创建初始对象
  create() {
    //全局背景图
    this.background = this.game.add.image(0, 0, 'Background');
    this.background.visible = false; //默认隐藏
    //主角
    this.player = new Player(this.game);
    //黑幕
    this.blackMask = this.game.add.graphics(0, 0);
    this.blackMask.visible = false;
    this.blackMask.beginFill();
    this.blackMask.drawRect(0, 0, this.game.width + 100, this.game.height);
    this.blackMask.endFill();
    this.blackMask.data.reachLeftCallback = null; //到达左边界的callback
    //开始第一关
    this.startNext();

    //---test
    //音频按钮
    // this.game.audioManager.makeTestButtons();
    //十字交叉线
    this.drawCrossLine();
  }

  update() {
    //移动黑幕并检测位置
    this.moveMaskAndCheck();
  }

  render() {
    let pointer = this.game.input.activePointer, debug = this.game.debug;
    debug.text(`当前鼠标位置: ${pointer.x}, ${pointer.y}`, 10, 20, '0x000000');
    // debug.bodyInfo(this.player, 15, 30);
    //所有body
    this.game.world.forEachAlive((child) => {
      debug.body(child);
    }, null);
    //调用关卡的render()
    if (this.currentLevel) { this.currentLevel.render(); }
  }

  /*
  -------------------------------------------------------------
  | 内部工具
  -------------------------------------------------------------
  */

  //开始下一关
  async startNext() {
    //创建下一关对象
    let levelClass = this.levels[++this.currentIndex];
    if (levelClass) {
      this.currentLevel = new levelClass(this);
      //设置player的攻击对象
      this.player.setGhostGroup(this.currentLevel.ghosts);
      //场景切换，过场动画
      await this.playCutscene();
      //创建ghosts
      this.currentLevel.setupGhosts();
    }
  }

  //播放过场动画（用于两个场景之间衔接）
  async playCutscene() {
    //主角从当前位置往右跑到边界
    await this.player.runTo({ x: this.game.width + 100, y: this.player.y });
    //开始移动黑幕（待黑幕到达左边界后）
    await this.startMask();
    console.log('----黑幕到达左边界');
    //将主角x坐标设为0，并继续往右跑，直到舞台中央（此处过场动画结束）
    this.player.x = -120;
    //布置场景
    this.currentLevel.setupScene();
    //播放背景音乐
    this.game.audio.playBg();
    //主角移动到中央
    await this.player.runTo({ x: this.game.width / 2 + this.player.body.width / 2, y: this.player.y });

    // this.game.paused = true;
  }

  //黑幕相关
  //开始移动黑幕（黑幕达到左边界后，此promise就将返回）
  startMask() {
    //重置以便重新开始
    this.blackMask.x = this.game.width;
    this.blackMask.visible = true;
    return new Promise((resolve) => {
      this.blackMask.data.reachLeftCallback = resolve;
    });
  }
  moveMaskAndCheck() {
    let mask = this.blackMask;
    if (mask.visible) {
      if (mask.x <= -(mask.width)) { //整体结束
        mask.visible = false; //隐藏黑幕，移动结束
      } else { //继续移动
        let callback = mask.data.reachLeftCallback;
        if (mask.x <= 0 && callback) { //已到达左边界，执行回调
          console.log('----reachLeftCallback执行了一次');
          mask.data.reachLeftCallback = null; //清理
          callback();
        }
        mask.x -= 12; //向左移动
      }
    }
  }

  /*
  -------------------------------------------------------------
  | test/debug
  -------------------------------------------------------------
  */

  //在界面上画出中心点的十字交叉线
  drawCrossLine() {
    let
      pallete = this.game.add.bitmapData(this.game.width, this.game.height),
      ctx = pallete.ctx;
    pallete.addToWorld();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.moveTo(this.game.width/2, 0);
    ctx.lineTo(this.game.width/2, 1000);
    ctx.moveTo(0, this.game.height/2);
    ctx.lineTo(1000, this.game.height/2);
    ctx.stroke();
  }

}

export default GameLevel;