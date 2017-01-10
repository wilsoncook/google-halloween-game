import State from '../core/state/State';

/**
 * 游戏初始化，设置相关配置
 */
class Boot extends State {

  init() {
    let game = this.game, scale = this.game.scale;
    //目前仅有一个触点
    this.input.maxPointers = 1;
    scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // //切换窗口时禁止游戏暂停
    // this.stage.disableVisibilityChange = true;
    if (game.device.desktop) { //处于桌面环境
      //debug
      scale.scaleMode = Phaser.ScaleManager.NO_SCALE; //调整为正常模式
    } else { //手机端环境
      //强制让用户调整方向后才能继续
      scale.forceOrientation(true, false);
      scale.enterIncorrectOrientation.add(() => {
        console.log('------当前手机方向错误，需要调整，这里暂停游戏');
        game.paused = true;
      });
      scale.leaveIncorrectOrientation.add(() => {
        console.log('------手机方向已经调整正确，可以继续游戏');
        game.paused = false;
      });
    }
    //默认背景
    game.stage.setBackgroundColor('0xCCCCCC');
  }

  preload() {
    //加载进度条背景等资源，用于Preloader这个场景
  }

  create() {
    //进度条加载完毕后，切换到Preloader场景
    this.state.start('Preloader');
  }

}

export default Boot;