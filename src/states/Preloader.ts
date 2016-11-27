import { State } from '../core/state/State';

const IMAGE_FOLDER = '../assets/images';

/**
 * [场景]开始前的加载
 */
export class Preloader extends State {

  private ready: boolean = false; //标记是否已全部加载完毕

  preload() {
    //显示 背景、加载进度条
    //TODO
    //加载各种资源（图片、音频）
    //[Player]
    this.game.load.atlasJSONArray('Player', `${IMAGE_FOLDER}/player.png`, `${IMAGE_FOLDER}/player.json`);
    //[Ghost/Fresher]
    this.game.load.atlasJSONArray('Fresher', `${IMAGE_FOLDER}/fresher.png`, `${IMAGE_FOLDER}/fresher.json`);
  }

  create() {
    this.state.start('GameLevelOne'); //开启第一关
  }

  update() {
    //	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
    // if (!this.ready && this.cache.isSoundDecoded('xxxMusic')) {
    //   this.ready = true;
    //   this.state.start('GameLevelOne');
    // }
  }

}