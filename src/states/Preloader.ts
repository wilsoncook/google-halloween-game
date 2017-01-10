import State from '../core/state/State';

/**
 * [场景]开始前的加载
 */
class Preloader extends State {

  private ready: boolean = false; //标记是否已全部加载完毕

  preload() {
    //显示 背景、加载进度条
    //TODO

    //加载各种资源（图片、音频）
    //[音频]
    this.game.audio.preload();
    //[atlas]
    this.loadAtlases({
      //[杂项]
      'Misc': 'misc',
      //[背景图片]
      'Background': 'background',
      //[Player]
      'Player': 'player',
      //[Ghost/Fresher]
      'GhostFresher': 'ghost-fresher'
    });

    //测试按钮
    this.game.load.spritesheet('button', 'assets/images/flixel-button.png', 80, 20)
  }

  create() {
    //音频创建
    this.game.audio.create();
    //开启第一关
    this.state.start('GameLevel');
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

export default Preloader;