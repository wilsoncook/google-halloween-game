/**
 * 管理整个游戏的全局音效
 */
class AudioManager {

  static ComboEffect = { //[全局]合成音效配置
    'level-success': ['level-success-0', 'level-success-1', 'level-success-2']
  };

  game: Phaser.Game;
  effectAudio: Phaser.Sound; //音效
  bgAudio: Phaser.Sound; //背景音乐

  //施法音效
  private drawAudio = ['draw-1', 'draw-2', 'draw-3', 'draw-4'];
  private drawAudioIndex = 0; //标记当前施法音效（若施法间隔超过1秒，则此值会置为0，表示从头开始）
  private drawAudioTimer = null; //用于记录施法间隔，便于清零

  constructor(game: Phaser.Game) {
    this.game = game;
  }

  /*
  -------------------------------------------------------------
  | 对外调用api
  -------------------------------------------------------------
  */

  //播放背景音乐
  playBg(play: boolean = true): void {
    play ? this.bgAudio.play('bg') : this.bgAudio.stop();
  }

  //播放指定音效
  async playEffect(name: string) {
    if (!name) { this.effectAudio.stop(); return ; } //停止播放
    //是否是合成音效
    let combo = AudioManager.ComboEffect[name];
    if (combo) { //合成音效按顺序播放
      // return combo.reduce((sofar, marker) => {
      //   return sofar.then(() => {
      //     return new Promise((resolve) => {
      //       this.effectAudio.play(marker).onStop.addOnce(resolve);
      //     });
      //   });
      // }, Promise.resolve());
      for (let marker of combo) {
        await new Promise((resolve) => this.effectAudio.play(marker).onStop.addOnce(resolve));
      }
    } else { //基本独立音效，直接播放
      await new Promise((resolve) => this.effectAudio.play(name).onStop.addOnce(resolve)); //注：若连续两次调用同一个marker，那么addOnce添加的两个事件，会在第二个marker完成时一起触发
    }
  }

  //播放施法音效
  playDraw() {
    if (this.drawAudioTimer) { this.game.time.events.remove(this.drawAudioTimer); } //连续施法时，延长时间
    if (this.drawAudioIndex >= this.drawAudio.length) { this.drawAudioIndex = 0; } //超出时恢复到起始位置
    this.effectAudio.play(this.drawAudio[this.drawAudioIndex++]); //按顺序播放施法音效
    this.drawAudioTimer = this.game.time.events.add(2000, () => { //计时清零
      this.drawAudioTimer = null;
      this.drawAudioIndex = 0;
    });
  }

  //播放失败结束
  playFail() {
    this.bgAudio.stop();
    this.effectAudio.play('player-fail');
  }

  /*
  -------------------------------------------------------------
  | 流程相关
  -------------------------------------------------------------
  */

  //预下载音频文件（需要手动被外界调用）
  preload() {
    this.game.load.audio('main', 'assets/audios/main.ogg');
  }

  //创建音频对象（需要手动被外界调用）
  create() {
    //---主音效
    let main = this.effectAudio = this.game.add.audio('main');
    main.allowMultiple = true;
    //player
    main.addMarker('player-run', 19, 1.7, 1, true); //跑动
    main.addMarker('player-fail', 27.5, 3); //死亡，失败结束

    main.addMarker('ghost-die-1', 0, 3);
    main.addMarker('ghost-die-2', 4, 3);
    main.addMarker('ghost-die-3', 8, 4);
    main.addMarker('ghost-die-4', 13, 6);
    
    main.addMarker('victory-cheer', 21.5, 5);
    
    // main.addMarker('bg-music', 31.25, 25.25, 0.1, true);
    main.addMarker('fresher-attack-disappear', 57.5, 1.7);
    main.addMarker('ghost-normal-die', 60.2, 1.2);
    main.addMarker('ghost-laugh', 62.5, 1.9);
    main.addMarker('unknown', 70.2, 1.5);

    //施法音效，若画线间隔不到1秒，则会连续从1-4播放，若间隔较大，则从头开始
    main.addMarker('draw-1', 72.2, 1.5);
    main.addMarker('draw-2', 74.4, 1.5);
    main.addMarker('draw-3', 76.5, 1.5);
    main.addMarker('draw-4', 79, 1.5);

    //每关结束时连续播放的（注：由于需要连续播放，所以将其部分裁剪掉）
    main.addMarker('level-success-0', 65.5, 0.6); //实际完整的是 65.5, 1.5
    main.addMarker('level-success-1', 83.7, 0.8); //实际完整的是 83.8, 1.8
    main.addMarker('level-success-2', 81.5, 1.8);
    
    //施法特效
    main.addMarker('heart', 86.2, 1.8); //桃心
    main.addMarker('lightning', 88.8, 2.8); //闪电

    //背景音乐
    let bg = this.bgAudio = this.game.add.audio('main');
    bg.addMarker('bg', 31.25, 25.25, 0.6, true);
  }

  //[TEST]在界面上显示测试按钮
  makeTestButtons() {
    Object.keys(this.effectAudio.markers).concat('bg').forEach((name, index) => makeButton.call(this, name, 510, 10 + index * 24));
    this.playEffect('level-success'); //test
    //////
    function makeButton(name, x, y) {
        var button = this.game.add.button(x, y, 'button', () => {
          if ('bg' === name) {
            this.playBg();
          } else {
            this.playEffect(name);
          }
        }, null, 0, 1, 2);
        // button.smoothed = false;
        var text = this.game.add.text(x, y + 2, name, { font: 'Arial', fontSize: 12 });
        text.x += (button.width / 2) - (text.width / 2);
    }
  }

}

export default AudioManager;