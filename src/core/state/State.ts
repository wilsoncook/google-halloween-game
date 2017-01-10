import Game from '../../Game';

const IMAGE_FOLDER = 'assets/images'; //图片所在web目录

/**
 * state基类，用于实现不同场景
 */
abstract class State extends Phaser.State {

  state: Phaser.StateManager; //phaser.d.ts里面没有描述这个属性，但这里属性是存在的。。。
  game: Game; //[重新声明]该game已变为我们自定义的Game类
  
  //加载多个atlas，键名为定义的资源名，值为加载所在assets/images下的文件名（不含后缀，后缀必须为.png和.json，且是JSONArray格式）
  loadAtlases(atlases: Object) {
    for (let key in atlases) {
      let filename = atlases[key];
      this.game.load.atlasJSONArray(key, `${IMAGE_FOLDER}/${filename}.png`, `${IMAGE_FOLDER}/${filename}.json`);
    }
  }

}

export default State;