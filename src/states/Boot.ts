import { State } from '../core/state/State';

/**
 * 游戏初始化，设置相关配置
 */
export class Boot extends State {

  init() {
    //目前仅有一个触点
    this.input.maxPointers = 1;
    // //切换窗口时禁止游戏暂停
    // this.stage.disableVisibilityChange = true;
    if (this.game.device.desktop) { //处于桌面环境
      //TODO
    } else { //手机端环境
      //TODO
    }
    //默认背景
    this.game.stage.setBackgroundColor('0xFFFFFF');
  }

  preload() {
    //加载进度条背景等资源，用于Preloader这个场景
  }

  create() {
    //进度条加载完毕后，切换到Preloader场景
    this.state.start('Preloader');
  }

}