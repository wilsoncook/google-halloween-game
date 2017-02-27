/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../node_modules/phaser/typescript/phaser.d.ts" />
	/// <reference path="../node_modules/phaser/typescript/pixi.d.ts" />
	/// <reference path="../definitions/definitions.d.ts" /> //通用声明
	"use strict";
	// //引入全局性的库，将暴露出PIXI,P2这种全局变量
	// import 'pixi';
	// import 'p2';
	// import 'phaser';
	const Game_1 = __webpack_require__(/*! ./Game */ 1);
	window.onload = () => {
	    new Game_1.default().run();
	};


/***/ },
/* 1 */
/*!*********************!*\
  !*** ./src/Game.ts ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const AudioManager_1 = __webpack_require__(/*! ./lib/AudioManager */ 2);
	//基本场景
	const Boot_1 = __webpack_require__(/*! ./states/Boot */ 3);
	const Preloader_1 = __webpack_require__(/*! ./states/Preloader */ 5);
	//引入关卡管理
	const GameLevel_1 = __webpack_require__(/*! ./states/GameLevel */ 6);
	/**
	 * 游戏入口对象
	 */
	class Game extends Phaser.Game {
	    constructor() {
	        super(640, 360, Phaser.AUTO, 'content');
	        // super(1000, 360, Phaser.AUTO, 'content');
	        //音效管理
	        this.audio = new AudioManager_1.default(this);
	        //基本场景
	        this.state.add('Boot', Boot_1.default);
	        this.state.add('Preloader', Preloader_1.default);
	        //游戏关卡
	        this.state.add('GameLevel', GameLevel_1.default);
	    }
	    //开始游戏
	    run() {
	        this.state.start('Boot');
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Game;


/***/ },
/* 2 */
/*!*********************************!*\
  !*** ./src/lib/AudioManager.ts ***!
  \*********************************/
/***/ function(module, exports) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments)).next());
	    });
	};
	/**
	 * 管理整个游戏的全局音效
	 */
	class AudioManager {
	    constructor(game) {
	        //施法音效
	        this.drawAudio = ['draw-1', 'draw-2', 'draw-3', 'draw-4'];
	        this.drawAudioIndex = 0; //标记当前施法音效（若施法间隔超过1秒，则此值会置为0，表示从头开始）
	        this.drawAudioTimer = null; //用于记录施法间隔，便于清零
	        this.game = game;
	    }
	    /*
	    -------------------------------------------------------------
	    | 对外调用api
	    -------------------------------------------------------------
	    */
	    //播放背景音乐
	    playBg(play = true) {
	        play ? this.bgAudio.play('bg') : this.bgAudio.stop();
	    }
	    //播放指定音效
	    playEffect(name) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (!name) {
	                this.effectAudio.stop();
	                return;
	            } //停止播放
	            //是否是合成音效
	            let combo = AudioManager.ComboEffect[name];
	            if (combo) {
	                // return combo.reduce((sofar, marker) => {
	                //   return sofar.then(() => {
	                //     return new Promise((resolve) => {
	                //       this.effectAudio.play(marker).onStop.addOnce(resolve);
	                //     });
	                //   });
	                // }, Promise.resolve());
	                for (let marker of combo) {
	                    yield new Promise((resolve) => this.effectAudio.play(marker).onStop.addOnce(resolve));
	                }
	            }
	            else {
	                yield new Promise((resolve) => this.effectAudio.play(name).onStop.addOnce(resolve)); //注：若连续两次调用同一个marker，那么addOnce添加的两个事件，会在第二个marker完成时一起触发
	            }
	        });
	    }
	    //播放施法音效
	    playDraw() {
	        if (this.drawAudioTimer) {
	            this.game.time.events.remove(this.drawAudioTimer);
	        } //连续施法时，延长时间
	        if (this.drawAudioIndex >= this.drawAudio.length) {
	            this.drawAudioIndex = 0;
	        } //超出时恢复到起始位置
	        this.effectAudio.play(this.drawAudio[this.drawAudioIndex++]); //按顺序播放施法音效
	        this.drawAudioTimer = this.game.time.events.add(2000, () => {
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
	                }
	                else {
	                    this.playEffect(name);
	                }
	            }, null, 0, 1, 2);
	            // button.smoothed = false;
	            var text = this.game.add.text(x, y + 2, name, { font: 'Arial', fontSize: 12 });
	            text.x += (button.width / 2) - (text.width / 2);
	        }
	    }
	}
	AudioManager.ComboEffect = {
	    'level-success': ['level-success-0', 'level-success-1', 'level-success-2']
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AudioManager;


/***/ },
/* 3 */
/*!****************************!*\
  !*** ./src/states/Boot.ts ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const State_1 = __webpack_require__(/*! ../core/state/State */ 4);
	/**
	 * 游戏初始化，设置相关配置
	 */
	class Boot extends State_1.default {
	    init() {
	        let game = this.game, scale = this.game.scale;
	        //目前仅有一个触点
	        this.input.maxPointers = 1;
	        scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	        // //切换窗口时禁止游戏暂停
	        // this.stage.disableVisibilityChange = true;
	        if (game.device.desktop) {
	            //debug
	            scale.scaleMode = Phaser.ScaleManager.NO_SCALE; //调整为正常模式
	        }
	        else {
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Boot;


/***/ },
/* 4 */
/*!*********************************!*\
  !*** ./src/core/state/State.ts ***!
  \*********************************/
/***/ function(module, exports) {

	"use strict";
	const IMAGE_FOLDER = 'assets/images'; //图片所在web目录
	/**
	 * state基类，用于实现不同场景
	 */
	class State extends Phaser.State {
	    //加载多个atlas，键名为定义的资源名，值为加载所在assets/images下的文件名（不含后缀，后缀必须为.png和.json，且是JSONArray格式）
	    loadAtlases(atlases) {
	        for (let key in atlases) {
	            let filename = atlases[key];
	            this.game.load.atlasJSONArray(key, `${IMAGE_FOLDER}/${filename}.png`, `${IMAGE_FOLDER}/${filename}.json`);
	        }
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = State;


/***/ },
/* 5 */
/*!*********************************!*\
  !*** ./src/states/Preloader.ts ***!
  \*********************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const State_1 = __webpack_require__(/*! ../core/state/State */ 4);
	/**
	 * [场景]开始前的加载
	 */
	class Preloader extends State_1.default {
	    constructor() {
	        super(...arguments);
	        this.ready = false; //标记是否已全部加载完毕
	    }
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
	        this.game.load.spritesheet('button', 'assets/images/flixel-button.png', 80, 20);
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Preloader;


/***/ },
/* 6 */
/*!*********************************!*\
  !*** ./src/states/GameLevel.ts ***!
  \*********************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments)).next());
	    });
	};
	const State_1 = __webpack_require__(/*! ../core/state/State */ 4);
	const Player_1 = __webpack_require__(/*! ../players/Player */ 7);
	const Level1_1 = __webpack_require__(/*! ../levels/Level1 */ 12);
	/**
	 * 游戏关卡管理器（控制关卡的生成和切换）
	 */
	class GameLevel extends State_1.default {
	    constructor() {
	        super(...arguments);
	        this.score = 0; //当前总得分
	        //关卡顺序
	        this.levels = [
	            Level1_1.default //第一关
	        ];
	        //当前关卡索引
	        this.currentIndex = -1;
	        this.currentLevel = null;
	    }
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
	        this.player = new Player_1.default(this.game);
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
	        //调用关卡的render()
	        if (this.currentLevel) {
	            this.currentLevel.render();
	        }
	    }
	    /*
	    -------------------------------------------------------------
	    | 内部工具
	    -------------------------------------------------------------
	    */
	    //开始下一关
	    startNext() {
	        return __awaiter(this, void 0, void 0, function* () {
	            //创建下一关对象
	            let levelClass = this.levels[++this.currentIndex];
	            if (levelClass) {
	                this.currentLevel = new levelClass(this);
	                //设置player的攻击对象
	                this.player.setGhostGroup(this.currentLevel.ghosts);
	                //场景切换，过场动画
	                yield this.playCutscene();
	                //创建ghosts
	                this.currentLevel.setupGhosts();
	            }
	        });
	    }
	    //播放过场动画（用于两个场景之间衔接）
	    playCutscene() {
	        return __awaiter(this, void 0, void 0, function* () {
	            //主角从当前位置往右跑到边界
	            yield this.player.runTo({ x: this.game.width + 100, y: this.player.y });
	            //开始移动黑幕（待黑幕到达左边界后）
	            yield this.startMask();
	            console.log('----黑幕到达左边界');
	            //将主角x坐标设为0，并继续往右跑，直到舞台中央（此处过场动画结束）
	            this.player.x = -120;
	            //布置场景
	            this.currentLevel.setupScene();
	            //播放背景音乐
	            this.game.audio.playBg();
	            //主角移动到中央
	            yield this.player.runTo({ x: this.game.width / 2 + this.player.body.width / 2, y: this.player.y });
	            // this.game.paused = true;
	        });
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
	            if (mask.x <= -(mask.width)) {
	                mask.visible = false; //隐藏黑幕，移动结束
	            }
	            else {
	                let callback = mask.data.reachLeftCallback;
	                if (mask.x <= 0 && callback) {
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
	        let pallete = this.game.add.bitmapData(this.game.width, this.game.height), ctx = pallete.ctx;
	        pallete.addToWorld();
	        ctx.strokeStyle = 'blue';
	        ctx.lineWidth = 1;
	        ctx.moveTo(this.game.width / 2, 0);
	        ctx.lineTo(this.game.width / 2, 1000);
	        ctx.moveTo(0, this.game.height / 2);
	        ctx.lineTo(1000, this.game.height / 2);
	        ctx.stroke();
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = GameLevel;


/***/ },
/* 7 */
/*!*******************************!*\
  !*** ./src/players/Player.ts ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments)).next());
	    });
	};
	const Sprite_1 = __webpack_require__(/*! ../core/sprite/Sprite */ 8);
	const Utils_1 = __webpack_require__(/*! ../core/Utils */ 9);
	const LineBuilder_1 = __webpack_require__(/*! ../lib/LineBuilder */ 10);
	const LifeFigure_1 = __webpack_require__(/*! ../lib/LifeFigure */ 11);
	class Player extends Sprite_1.default {
	    constructor(game) {
	        super({
	            game: game,
	            x: game.width / 2, y: game.height / 2,
	            // x: 0, y: 0,
	            key: 'Player', maxHealth: 4, speed: Player.defaultRate * 6,
	            // bodySize: { width: 87, height: 74 }
	            bodySize: { width: 87, height: 74, offsetX: 44, offsetY: 76 }
	        });
	        this.processor = null; //当前画线处理器，用于记录每次画线的线段（有值则代表当前正处于画线中）
	        // this.body.immovable = true;
	        // //位置调整
	        // this.anchor.setTo(0.46, 0.65);
	        //创建画板
	        this.pallete = this.createPallete();
	        //播放初始动画
	        this.play('waiting');
	    }
	    /*
	    -------------------------------------------------------------
	    | 对外api
	    -------------------------------------------------------------
	    */
	    //设置当前可攻击的ghost对象Group
	    setGhostGroup(ghosts) {
	        this.ghosts = ghosts;
	    }
	    /*
	    -------------------------------------------------------------
	    | 动作
	    -------------------------------------------------------------
	    */
	    onBeforeHurt() {
	        return this.exPlay('hurt');
	    }
	    die() {
	        return __awaiter(this, void 0, void 0, function* () {
	            //让所有ghost逐渐淡出消失
	            //TODO
	            //播放失败音效
	            this.game.audio.playFail();
	            //播放死亡动画
	            yield this.exPlay('die');
	            //等待若干秒后，显示结束失败场景
	            this.game.time.events.add(Phaser.Timer.SECOND * 10, () => {
	                alert('TODO:此时应该跳转到失败场景');
	            });
	        });
	    }
	    //移动到指定地方（并播放跑步动画和声音）
	    runTo(target) {
	        return __awaiter(this, void 0, void 0, function* () {
	            this.playRun();
	            yield this.moveTo(target);
	            this.playRun(false); //恢复正常状态
	        });
	    }
	    //对ghost实施攻击
	    attack(figure) {
	        if (null === figure) {
	            this.play('waiting');
	            return;
	        }
	        this.playDrawAnimation(figure); //播放施法动画
	        this.playDrawAudio(figure); //播放施法音效
	        if (this.ghosts && this.ghosts.length) {
	            console.log(this.ghosts);
	            this.damageGhosts(figure);
	        }
	    }
	    //通过figure寻找ghost，找到一个立即返回（主要用于闪电）
	    findGhostByFigure(figure) {
	        for (let i = 0, len = this.ghosts.children.length; i < len; i++) {
	            let ghost = this.ghosts.children[i];
	            if (ghost.alive && ghost.getCurrentFigure() === figure) {
	                return ghost;
	            }
	        }
	        return null;
	    }
	    //对单个ghost施法
	    damageGhosts(figure) {
	        //若是闪电并且ghost中有一个带有闪电图形，则所有ghost减血
	        if (5 /* LIGHTNING */ === figure) {
	            if (this.findGhostByFigure(figure)) {
	                this.ghosts.forEachAlive((ghost) => ghost.hurt(false), null);
	            }
	        }
	        else {
	            this.ghosts.forEachAlive((ghost) => {
	                let isMatched = ghost.getCurrentFigure() === figure;
	                if (isMatched) {
	                    if (6 /* HEART */ === figure) {
	                        this.cure();
	                    }
	                    //该ghost减血
	                    ghost.hurt(false);
	                }
	            }, null);
	        }
	    }
	    //针对不同figure，播放不同音效
	    playDrawAudio(figure) {
	        switch (figure) {
	            case 5 /* LIGHTNING */:
	                this.game.audio.playEffect('lightning');
	                break;
	            case 6 /* HEART */:
	                this.game.audio.playEffect('heart');
	                break;
	            default:
	                this.game.audio.playDraw();
	        }
	    }
	    playDrawAnimation(figure) {
	        this.play(`draw-${LifeFigure_1.LifeFigureMap[figure]}`);
	    }
	    /*
	    -------------------------------------------------------------
	    | 画板
	    -------------------------------------------------------------
	    */
	    //创建画板对象
	    createPallete() {
	        let pointer = this.game.input.activePointer, pallete = this.game.add.bitmapData(this.game.width, this.game.height), ctx = pallete.ctx;
	        pallete.addToWorld();
	        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
	        ctx.lineWidth = 20;
	        ctx.lineCap = ctx.lineJoin = 'round';
	        let pointGap = 0; //ctx.lineWidth / 2;
	        //[事件]鼠标按下
	        this.game.input.onDown.add(() => {
	            this.play('drawing'); //播放施法中动画
	            this.processor = new LineBuilder_1.LineBuilder(ctx.lineWidth); //新的一个画线开始
	            this.processor.addPoint(this.getActivePoint(pointGap)); //一个开始的坐标点
	        });
	        //[事件]鼠标移动
	        this.game.input.addMoveCallback(() => {
	            if (this.processor) {
	                this.processor.addPoint(this.getActivePoint(pointGap)); //加入移动时的坐标点
	                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //清空画板，重新绘制以前的画线
	                //---开始重新绘制画板，显示已画的线段图形
	                let points = this.processor.getPoints(), p1 = points[0], p2 = points[1], middlePoint;
	                ctx.beginPath();
	                ctx.moveTo(p1.x, p1.y); //移动到起始点
	                for (let i = 1, len = points.length; i < len; i++) {
	                    middlePoint = Utils_1.Point.getMiddlePoint(p1, p2); //we pick the point between pi+1 & pi+2 as the end point and p1 as our control point
	                    ctx.quadraticCurveTo(p1.x, p1.y, middlePoint.x, middlePoint.y); //draw a curve line to the middle
	                    p1 = points[i], p2 = points[i + 1];
	                }
	                ctx.lineTo(p1.x, p1.y); // Draw last line as a straight line while we wait for the next point to be able to calculate the bezier control point
	                ctx.stroke();
	                this.processor.calculate(); //执行一次线段计算
	                //debug 绘制所有线段及其信息
	                this.processor.drawDebugInfo(pallete);
	                //debug end
	                pallete.dirty = true; //标记该bitmap对象已脏，需要重绘
	            }
	        }, null);
	        //[事件]鼠标抬起
	        this.game.input.onUp.add(() => {
	            if (this.processor) {
	                //计算最终画线结果
	                this.processor.calculate(true);
	                //计算当前图形
	                let figure = this.processor.calculateFigure();
	                //实施攻击
	                this.attack(figure);
	                //debug
	                console.log('----画线完毕: ', this.processor);
	                //debug 绘制所有线段及其信息
	                this.processor.drawDebugInfo(pallete);
	                //debug end
	                this.processor = null;
	            }
	        });
	        return pallete;
	    }
	    /*
	    -------------------------------------------------------------
	    | 动画及音频
	    -------------------------------------------------------------
	    */
	    //初始化创建动画
	    initializeAnimations() {
	        let animations = this.animations, frameRate = Sprite_1.default.defaultRate; //默认频率
	        //等待状态
	        animations.add('waiting', Utils_1.Utils.concatRepeat([], 'waiting/1', 25, 'waiting/2', 5, 'waiting/3', 5, 'waiting/4', 4, 'waiting/5', 5, 'waiting/6', 15, 'waiting/5', 6, 'waiting/4', 5, 'waiting/3', 5, 'waiting/2', 5, 'waiting/1', 10, 'waiting/7', 5, 'waiting/8', 5, 'waiting/9', 5, 'waiting/10', 5, 'waiting/11', 15, 'waiting/10', 5, 'waiting/9', 5, 'waiting/8', 5, 'waiting/7', 5), frameRate, true);
	        //跑动
	        animations.add('run', Utils_1.Utils.concatRepeat([], 'run/1', 5, 'run/2', 5, 'run/3', 4, 'run/4', 5, 'run/5', 5, 'run/6', 5), frameRate, true);
	        //scared状态
	        animations.add('scared', Utils_1.Utils.concatRepeat([], 'scared/1', 5, 'scared/2', 5, 'scared/3', 1), frameRate, false);
	        //施法中状态
	        animations.add('drawing', Utils_1.Utils.concatRepeat([], 'drawing/1', 5, 'drawing/2', 5, 'drawing/3', 4, 'drawing/4', 5, 'drawing/5', 5, 'drawing/6', 5), frameRate, true);
	        //画横线（结束后需立马跳转到waiting）
	        let drawHorizontal = animations.add('draw-horizontal', Utils_1.Utils.concatRepeat([], 'draw-horizontal/1', 8, 'draw-horizontal/2', 6, 'draw-horizontal/3', 5, 'draw-horizontal/4', 5, 'draw-horizontal/5', 5), frameRate, false);
	        drawHorizontal.onComplete.add(() => { console.log('-----drawHorizontal on complete'); animations.play('waiting'); });
	        //画竖线
	        let drawVertical = animations.add('draw-vertical', Utils_1.Utils.concatRepeat([], 'draw-vertical/1', 5, 'draw-vertical/2', 5, 'draw-vertical/3', 5, 'draw-vertical/4', 5, 'draw-vertical/5', 5), frameRate, false);
	        drawVertical.onComplete.add(() => animations.play('waiting'));
	        //画上凸bugle
	        let drawBugle = animations.add('draw-bugle', Utils_1.Utils.concatRepeat([], 'draw-bugle/1', 9, 'draw-bugle/2', 5, 'draw-bugle/3', 5, 'draw-bugle/4', 5, 'draw-bugle/5', 5), frameRate, false);
	        drawBugle.onComplete.add(() => animations.play('waiting'));
	        //画下凹sunken
	        let drawSunken = animations.add('draw-sunken', Utils_1.Utils.concatRepeat([], 'draw-sunken/1', 9, 'draw-sunken/2', 5, 'draw-sunken/3', 5, 'draw-sunken/4', 5, 'draw-sunken/5', 5), frameRate, false);
	        drawSunken.onComplete.add(() => animations.play('waiting'));
	        //画闪电lightning
	        let drawLightning = animations.add('draw-lightning', Utils_1.Utils.concatRepeat([], 'draw-lightning/1', 10, 'draw-lightning/2', 4, 'draw-lightning/3', 5, 'draw-lightning/4', 5, 'draw-lightning/5', 5), frameRate, false);
	        drawLightning.onComplete.add(() => animations.play('waiting'));
	        //画桃心heart
	        let drawHeart = animations.add('draw-heart', Utils_1.Utils.concatRepeat([], 'draw-heart/1', 9, 'draw-heart/2', 5, 'draw-heart/3', 5, 'draw-heart/4', 5, 'draw-heart/5', 5), frameRate, false);
	        drawHeart.onComplete.add(() => animations.play('waiting'));
	        //受伤hurt
	        let hurt = animations.add('hurt', Utils_1.Utils.concatRepeat([], 'hurt/1', 4, 'hurt/2', 5, 'hurt/3', 5, 'hurt/4', 7), frameRate, false);
	        hurt.onComplete.add(() => animations.play('waiting'));
	        //胜利victory
	        animations.add('victory', Utils_1.Utils.concatRepeat([], 'victory/1', 9, 'victory/2', 5, 'victory/3', 5, 'victory/4', 5, 'victory/5', 5, 'victory/6', 5, 'victory/7', 5, 'victory/8', 5, 'victory/9', 5, 'victory/10', 5, 'victory/11', 5, 'victory/12', 5, 'victory/13', 5, 'victory/14', 5, 'victory/15', 5, 'victory/16', 5, 'victory/17', 5, 'victory/18', 1), frameRate, false);
	        //死亡die
	        animations.add('die', Utils_1.Utils.concatRepeat([], 'die/1', 5, 'die/2', 9, 'die/3', 11, 'die/4', 10, 'die/5', 5, 'die/6', 5, 'die/7', 5, 'die/8', 5, 'die/9', 5, 'die/10', 5, 'die/11', 20, 'die/12', 5, 'die/13', 5, 'die/14', 5, 'die/15', 5, 'die/16', 1), frameRate, false);
	    }
	    //播放跑动动画及音频
	    playRun(play = true) {
	        if (play) {
	            this.play('run');
	            this.game.audio.playEffect('player-run');
	        }
	        else {
	            this.play('waiting');
	            this.game.audio.playEffect(null);
	        }
	    }
	    /*
	    -------------------------------------------------------------
	    | 内部工具
	    -------------------------------------------------------------
	    */
	    //获取当前触点所在坐标
	    getActivePoint(gap = 0) {
	        let pointer = this.game.input.activePointer;
	        return new Utils_1.Point(pointer.x - gap, pointer.y - gap);
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Player;


/***/ },
/* 8 */
/*!***********************************!*\
  !*** ./src/core/sprite/Sprite.ts ***!
  \***********************************/
/***/ function(module, exports) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments)).next());
	    });
	};
	/**
	 * 所有精灵的基类，这里用于提供一些方法
	 */
	class Sprite extends Phaser.Sprite {
	    constructor(options) {
	        super(options.game, options.x, options.y, options.key, options.frame);
	        this.collisionQueue = new Map(); //碰撞检测队列（用于update时进行碰撞检测）
	        this.tweens = {}; //补间动画键值对
	        //初始化基本属性
	        this.options = options;
	        this.health = this.maxHealth = options.maxHealth;
	        this.speed = options.speed || Sprite.defaultRate;
	        //初始化body
	        this.game.physics.arcade.enable(this);
	        if (options.bodySize) {
	            this.body.setSize(options.bodySize.width, options.bodySize.height, options.bodySize.offsetX || 0, options.bodySize.offsetY || 0);
	        }
	        // //默认基础点定位位置
	        // let anchor = options.anchor || { x: 0.5, y: 0.5 }; //默认处于最中间
	        // this.anchor.setTo(anchor.x, anchor.y);
	        //确定定位点（位于body偏移后指定区域的正中心）
	        let bodyOffsetX = options.bodySize.offsetX || 0, bodyOffsetY = options.bodySize.offsetY, anchorX = (this.body.width / 2 + bodyOffsetX) / this.width, anchorY = (this.body.height / 2 + bodyOffsetY) / this.height;
	        this.anchor.setTo(anchorX, anchorY);
	        //添加到
	        if (options.toStage) {
	            this.game.stage.addChild(this);
	        }
	        else {
	            this.game.add.existing(this);
	        }
	        //创建镜像
	        if (options.shadow) {
	            this.shadow = this.addChild(this.game.make.sprite(options.shadow.x || 0, options.shadow.y || 0, options.shadow.key, options.shadow.frame));
	            //水平翻转
	            if (options.flipHorizontal) {
	                this.shadow.width *= -1;
	                this.shadow.x -= this.shadow.width;
	            }
	        }
	        //动画初始化
	        this.initializeAnimations();
	    }
	    //更新事件（主要用于碰撞检测）
	    update() {
	        // console.log('[Sprite]update');
	        let arcade = this.game.physics.arcade;
	        for (let [target, task] of this.collisionQueue) {
	            if (target instanceof Sprite) {
	                arcade.overlap(this, target, task.callback);
	            }
	            else if ('number' === typeof target.x
	                && 'number' === typeof target.y
	                && this.body.hitTest(target.x, target.y)) {
	                task.callback();
	            }
	        }
	    }
	    /*
	    ------------------------------------------------------------------
	    | 基本流程函数
	    ------------------------------------------------------------------
	    */
	    //受伤（减血）
	    onBeforeHurt() { }
	    hurt(hurtWhileDie = true) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (this.alive) {
	                this.health--;
	                let dead = this.health <= 0; //是否已经算死亡
	                if (!dead || (dead && hurtWhileDie)) {
	                    yield this.onBeforeHurt();
	                    yield this.onAfterHurt();
	                }
	                if (dead) {
	                    this.die();
	                }
	            }
	        });
	    }
	    onAfterHurt() { }
	    //受治疗(非死亡状态有效)
	    onBeforeCure() { }
	    cure() {
	        return __awaiter(this, void 0, void 0, function* () {
	            yield this.onBeforeCure();
	            this.heal(1);
	            yield this.onAfterCure();
	        });
	    }
	    onAfterCure() { }
	    //死亡
	    onBeforeDie() { }
	    die(destroy = true) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (!this.alive) {
	                return;
	            } //已死亡，不再执行
	            this.alive = false; //标记为未存活，以免重复被调用
	            yield this.onBeforeDie();
	            if (destroy) {
	                this.destruct();
	            }
	            yield this.onAfterDie();
	        });
	    }
	    onAfterDie() { }
	    //析构函数，回收资源并删除对象及其子对象
	    destruct() {
	        //移除关联的tween对象
	        this.game.tweens.removeFrom(this, true);
	        //销毁
	        this.destroy(true);
	    }
	    /*
	    ------------------------------------------------------------------
	    | 工具函数
	    ------------------------------------------------------------------
	    */
	    //将该sprite的body内部的相对于左上角的坐标转换为相对于中心点的坐标（意即body中坐标系的原点在中心点处）
	    toBodyPos(x, y) {
	        return { x: x - this.body.width / 2, y: y - this.body.height / 2 };
	    }
	    //获取相对于body的各个角的坐标
	    getBodyCorner(place, offsetX, offsetY) {
	        let basePos = { x: 0, y: 0 };
	        switch (place) {
	            case 'top-left':
	                break;
	            case 'top-right':
	                basePos.x = this.body.width;
	                break;
	            case 'bottom-left':
	                basePos.y = this.body.height;
	                break;
	            case 'bottom-right':
	                basePos.x = this.body.width, basePos.y = this.body.height;
	                break;
	        }
	        if ('number' === typeof offsetX) {
	            basePos.x += offsetX;
	        }
	        if ('number' === typeof offsetY) {
	            basePos.y += offsetY;
	        }
	        return this.toBodyPos(basePos.x, basePos.y);
	    }
	    getBodyTopLeft(offsetX, offsetY) { return this.getBodyCorner('top-left', offsetX, offsetY); }
	    getBodyTopRight(offsetX, offsetY) { return this.getBodyCorner('top-right', offsetX, offsetY); }
	    getBodyBottomLeft(offsetX, offsetY) { return this.getBodyCorner('bottom-left', offsetX, offsetY); }
	    getBodyBottomRight(offsetX, offsetY) { return this.getBodyCorner('bottom-right', offsetX, offsetY); }
	    //移动到某个精灵对象或点
	    moveTo(target, speed = this.speed) {
	        let queue = this.collisionQueue;
	        this.game.physics.arcade.moveToObject(this, target, speed);
	        // this.game.physics.arcade.moveToXY(this, target.x, target.y, speed);
	        return new Promise((resolve, reject) => {
	            queue.set(target, {
	                callback: () => {
	                    //删除该碰撞检测任务
	                    queue.delete(target);
	                    //自动停止移动
	                    this.body.velocity.setTo(0);
	                    this.body.acceleration.setTo(0);
	                    //解决此promise
	                    resolve();
	                }
	            });
	        });
	    }
	    /**
	     * 为当前或镜像sprite对象创建一个补间动画
	     * @param  {string} name? 若空，则不缓存，也无法通过getTween获取
	     * @param  {boolean=false} shadow 是否是为shadow创建
	     */
	    createTween(name, shadow = false) {
	        if (name && this.tweens[name]) {
	            return this.tweens[name];
	        }
	        let tween = this.game.add.tween(shadow ? this.shadow : this);
	        if (name) {
	            this.tweens[name] = tween;
	        }
	        return tween;
	    }
	    //获取某个补间动画
	    getTween(name) {
	        return this.tweens[name];
	    }
	    //播放一个补间动画
	    playTween(name, play = true) {
	        let tween = this.tweens[name];
	        if (play) {
	            tween.start();
	        }
	        else {
	            tween.pause();
	        }
	        return tween;
	    }
	    //promise方式播放tween（注：该tween不能是loop或repeatAll(-1)的，否则promise永远不会返回，onComplete永远不会被调用）
	    promisePlayTween(name) {
	        let tween = this.getTween(name);
	        if (!tween) {
	            return;
	        }
	        return new Promise((resolve) => {
	            tween.onComplete.addOnce(resolve);
	            tween.start();
	        });
	    }
	    // //[禁用原生play]override当前promisePlay方式和原play函数混用时，可能会导致promisePlay返回的promise无法完成(onComplete事件不被触发)，所以这里暂时禁止使用原生play
	    // play(name: string, frameRate?: number, loop?: boolean, killOnComplete?: boolean): Phaser.Animation {
	    //   throw new Error('为避免冲突，请采用promisePlay()方法');
	    // }
	    //重写原生play，以便支持将上一个动画stop
	    play(name, frameRate, loop, killOnComplete) {
	        return this.exPlay(name, false, false, frameRate, loop, killOnComplete);
	    }
	    /**
	     * play函数的封装（支持动画播放完毕后才返回）
	     * @param  {string} name
	     * @param  {boolean=false} shadow 是否play镜像的动画
	     * @param  {boolean=true} promise 是否返回Promise
	     * @param  {...} originParams 其他用于Animation.play的参数
	     */
	    exPlay(name, shadow = false, promise = true, ...originParams) {
	        let animations = (shadow ? this.shadow : this).animations, currentAnimation = animations.currentAnim, animation = animations.getAnimation(name);
	        //若当前有正在播放的动画，结束它并触发他之前绑定有的onComplete事件（否则以前动画的promise可能永远无法返回）
	        if (currentAnimation) {
	            console.debug('[promisePlay]当前有正在播放的动画，将结束此动画后重新播放新的动画. 当前动画的onComplete监听函数个数为: ', currentAnimation.onComplete.getNumListeners());
	            currentAnimation.stop(true, true);
	        }
	        if (promise) {
	            return new Promise((resolve) => {
	                //播放新的动画
	                animation.onComplete.addOnce(() => resolve(animation));
	                animation.play.call(animation, ...originParams);
	            });
	        }
	        else {
	            return animation.play.call(animation, ...originParams);
	        }
	    }
	}
	Sprite.defaultRate = 60; //[常数]默认频率
	exports.Sprite = Sprite;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Sprite;


/***/ },
/* 9 */
/*!***************************!*\
  !*** ./src/core/Utils.ts ***!
  \***************************/
/***/ function(module, exports) {

	"use strict";
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
	    static concatRepeat(origin, ...repeaters) {
	        if (repeaters.length % 2 != 0) {
	            throw new Error('参数格式不正确');
	        }
	        for (let i = 0, len = repeaters.length; i < len; i += 2) {
	            let value = repeaters[i], repeat = repeaters[i + 1];
	            for (let j = 0; j < repeat; j++) {
	                origin.push(value);
	            }
	        }
	        return origin;
	    }
	}
	exports.Utils = Utils;
	/**
	 * 坐标点
	 */
	class Point extends Phaser.Point {
	    //获取两点间的中点
	    static getMiddlePoint(p1, p2) {
	        return new Point(p1.x + (p2.x - p1.x) / 2, p1.y + (p2.y - p1.y) / 2);
	    }
	    //获取两线段（向量）间的夹角（由4个点代表）
	    static getAngleBetween(A, B, C, D) {
	        let AB = { x: B.x - A.x, y: B.y - A.y }, CD = { x: D.x - C.x, y: D.y - C.y };
	        let dividend = AB.x * CD.x + AB.y * CD.y, divisor = Math.sqrt(Math.pow(AB.x, 2) + Math.pow(AB.y, 2)) * Math.sqrt(Math.pow(CD.x, 2) + Math.pow(CD.y, 2)), //[注]这里可能出现dividend=549，divisor=548.99999999的情况，其实此时他们应该是相等才对，所以导致出现divide>1的情况，从而导致acos()返回NaN
	        divide = dividend / divisor;
	        if (divide > 1) {
	            divide = 1;
	        } //修正由于求根divisor导致失精度的情况
	        let radian = Math.acos(divide), angle = radian * 180 / Math.PI;
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
	    static filterByPrecision(points, precision, startIndex = 0) {
	        if (precision < 1) {
	            throw new Error('精度至少为1');
	        }
	        let len = points.length, keyPoint = points[startIndex], //第一个点作为关键点
	        resultPoints = [];
	        //拷贝以前的关键点(startIndex之前的)
	        for (let i = 0; i < startIndex && i < len; i++) {
	            resultPoints.push(points[i]);
	        }
	        //加入第一个关键点
	        resultPoints.push(keyPoint);
	        //找寻后面的关键点
	        for (let i = startIndex + 1; i < len; i++) {
	            if (Point.distance(keyPoint, points[i]) > precision) {
	                keyPoint = points[i]; //将此点作为下一个关键点
	                resultPoints.push(keyPoint); //记录此关键点
	            }
	        }
	        //返回新的关键点列表
	        return resultPoints;
	    }
	}
	exports.Point = Point;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Utils;


/***/ },
/* 10 */
/*!********************************!*\
  !*** ./src/lib/LineBuilder.ts ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const Utils_1 = __webpack_require__(/*! ../core/Utils */ 9);
	//画线处理器
	class LineBuilder {
	    //初始化
	    constructor(lineWidth = 20) {
	        this.maxLines = 20; //限制最大线段数量，0表示不限制（若超出后，老的线段会被移除）注：若设置过小，可能导致判断失效
	        this.points = [];
	        this.keyPoints = [];
	        this.lines = [];
	        this.lastIndex = 0;
	        this.lineWidth = lineWidth;
	        this.precision = lineWidth / 2;
	    }
	    //获取所有线段列表
	    getLines() {
	        return this.lines;
	    }
	    //添加新的散列点
	    addPoint(point) {
	        this.points.push(point);
	        this.keyPoints.push(point);
	    }
	    //获取当前所有散列点列表
	    getPoints() {
	        return this.points;
	    }
	    //累加计算线段
	    calculate(isEnd = false) {
	        let line = null, { lines, maxLines } = this;
	        while (line = this.calculateOneLine(isEnd)) {
	            console.debug('[Player.calculateLines]新增了一条线段');
	            if (maxLines && lines.length > maxLines) {
	                console.debug('[Player.calculateLines]移除一条旧的线段');
	                lines.shift();
	            }
	        }
	    }
	    /**
	     * 计算指定线段所构成的图形
	     * @param  {Line[]} lines 指定线段列表，默认为当前线段列表
	     */
	    calculateFigure(lines = this.lines, debugCtx) {
	        let rules = LineBuilder.FigureRules;
	        //按顺序判断基本图形
	        for (let rule of rules) {
	            if (this.isMatchFigureRule(lines, rule)) {
	                return rule.figure;
	            }
	        }
	        //匹配桃心
	        if (this.isMatchHeart(lines, this.lineWidth, debugCtx)) {
	            return 6 /* HEART */;
	        }
	        return null;
	    }
	    /**
	     * DEBUG 画出所有线段及其相关信息
	     * @param  {Phaser.BitmapData} pallete 将要画写到的画板对象（注：此画板的尺寸必须囊括所有线段的点，比如直接是Player的pallete属性）
	     */
	    drawDebugInfo(pallete) {
	        let ctx = pallete.ctx, lines = [].concat(this.lines); //创建一个新的线段数组用于显示，避免影响原数组
	        if (this.lastFakeLine) {
	            lines.push(this.lastFakeLine);
	        }
	        // console.log('--------lines length: ', lines.length);
	        ctx.save();
	        ctx.strokeStyle = 'red';
	        ctx.lineWidth = 1;
	        ctx.font = '12px serif';
	        lines.forEach((line) => {
	            let start = line.startPoint, end = line.endPoint;
	            ctx.beginPath();
	            ctx.moveTo(start.x, start.y);
	            ctx.lineTo(end.x, end.y);
	            ctx.stroke();
	            //绘制中间的角度值
	            let middlePoint = Utils_1.Point.getMiddlePoint(start, end), label = '';
	            switch (line.type) {
	                case 3 /* DOWN */:
	                    label = 'DOWN';
	                    break;
	                case 2 /* UP */:
	                    label = 'UP';
	                    break;
	                case 1 /* RIGHT */:
	                    label = 'RIGHT';
	                    break;
	                case 0 /* LEFT */:
	                    label = 'LEFT';
	                    break;
	                case 5 /* UP_LEFT */:
	                    label = 'UP_LEFT';
	                    break;
	                case 4 /* UP_RIGHT */:
	                    label = 'UP_RIGHT';
	                    break;
	                case 7 /* DOWN_LEFT */:
	                    label = 'DOWN_LEFT';
	                    break;
	                case 6 /* DOWN_RIGHT */:
	                    label = 'DOWN_RIGHT';
	                    break;
	            }
	            ctx.fillText(`${line.angle}度, ${label}`, middlePoint.x, middlePoint.y);
	        });
	        //显示当前图形判断
	        let figure = this.calculateFigure(lines, ctx);
	        let label = '';
	        switch (figure) {
	            case 3 /* VERTICAL */:
	                label = 'VERTICAL';
	                break;
	            case 4 /* HORIZONTAL */:
	                label = 'HORIZONTAL';
	                break;
	            case 1 /* BULGE */:
	                label = 'BULGE';
	                break;
	            case 2 /* SUNKEN */:
	                label = 'SUNKEN';
	                break;
	            case 5 /* LIGHTNING */:
	                label = 'LIGHTNING';
	                break;
	            case 6 /* HEART */:
	                label = 'HEART';
	                break;
	        }
	        ctx.fillText(`当前图形: ${label}`, pallete.width - 100, 12);
	        pallete.dirty = true; //更新显示
	        ctx.restore();
	    }
	    //创建一个线段对象
	    createLine(startPoint, endPoint, isFake = false) {
	        // let vector = new Point(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
	        let { start, end } = LineBuilder.baseVector, angle = Utils_1.Point.getAngleBetween(startPoint, endPoint, start, end);
	        let line = {
	            startPoint: startPoint,
	            endPoint: endPoint,
	            // angle: Point.angle(vector, MagicLineProcessor.baseVector) //相对基线向量的角度
	            angle: angle,
	            type: this.getLineType(startPoint, endPoint, angle),
	            isFake: isFake
	        };
	        if (line.isFake) {
	            this.lastFakeLine = line;
	            return null;
	        }
	        else {
	            this.lastFakeLine = null; //清除原模拟线，表示已经终结
	            return line;
	        }
	    }
	    //通过两点计算出所代表线段的图形
	    getLineType(start, end, angle) {
	        if (Utils_1.Point.equals(start, end)) {
	            throw new Error('[getFigureBetween]意外情况，线段的起始点和终点相同');
	        }
	        if (typeof angle == 'undefined') {
	            let { start: baseStart, end: baseEnd } = LineBuilder.baseVector;
	            angle = Utils_1.Point.getAngleBetween(start, end, baseStart, baseEnd);
	        }
	        let { x: x1, y: y1 } = start, { x: x2, y: y2 } = end, a = LineBuilder.softAngle, type = null;
	        switch (true) {
	            case (x1 < x2 && (angle >= 0 && angle <= a)):
	                type = 1 /* RIGHT */;
	                break;
	            case (x1 > x2 && (angle >= 180 - a && angle <= 180)):
	                type = 0 /* LEFT */;
	                break;
	            case (y1 > y2 && (angle >= 90 - a && angle <= 90 + a)):
	                type = 2 /* UP */;
	                break;
	            case (y1 < y2 && (angle >= 90 - a && angle <= 90 + a)):
	                type = 3 /* DOWN */;
	                break;
	            case (y1 > y2 && (angle > a && angle < 90 - a)):
	                type = 4 /* UP_RIGHT */;
	                break;
	            case (y1 < y2 && (angle > a && angle < 90 - a)):
	                type = 6 /* DOWN_RIGHT */;
	                break;
	            case (y1 > y2 && (angle > 90 + a && angle < 180 - a)):
	                type = 5 /* UP_LEFT */;
	                break;
	            case (y1 < y2 && (angle > 90 + a && angle < 180 - a)):
	                type = 7 /* DOWN_LEFT */;
	                break;
	        }
	        return type;
	    }
	    /**
	     * 判断是否满足某个图形匹配规则
	     * @param  {Line[]} lines
	     * @param  {LineFigureRule} figureRule
	     */
	    isMatchFigureRule(lines, figureRule) {
	        if (!lines.length) {
	            return false;
	        }
	        let ruleList = figureRule.ruleList, currentIndex = lines.length - 1; //从最后往前找
	        //遍历规则
	        for (let i = 0, len = ruleList.length; i < len; i++) {
	            let rule = ruleList[i];
	            //统一格式
	            if (typeof rule == 'number') {
	                rule = { types: [rule] };
	            } //转换为LineTypeSetInfo对象
	            if (!Array.isArray(rule.types)) {
	                rule.types = [rule.types];
	            } //转换types成数组
	            if (!rule.range) {
	                rule.range = [1, 1];
	            } //默认仅判断1个
	            //遍历查询比对
	            let appearTimes = 0, [min, max] = rule.range;
	            for (; currentIndex >= 0; currentIndex--) {
	                // console.log('currentIndex: ', currentIndex);
	                // console.log('------当前线段的类型和需要匹配的类型列表：', lines[currentIndex].type, rule.types);
	                if (rule.types.indexOf(lines[currentIndex].type) != -1) {
	                    appearTimes++;
	                    if (appearTimes > max) {
	                        // console.log('------appearTimes超出: ', appearTimes);
	                        return false;
	                    }
	                }
	                else {
	                    // console.log('不匹配，继续下一个匹配break;');
	                    break; //继续下一个类型的匹配（要根据后面的监测看是否匹配成功）
	                }
	            }
	            //核算匹配次数
	            if (appearTimes >= min && appearTimes <= max) {
	                continue; //标记此type被匹配上[继续下一个type的匹配]
	            }
	            else {
	                // console.log('------匹配失败: ', appearTimes);
	                return false; //本次匹配失败[直接退出]
	            }
	        }
	        //检查是否需要完整匹配
	        if (figureRule.exactMatch && currentIndex > -1) {
	            // console.log('-----需要完整匹配，而原线段列表还未遍历完，所以匹配失败');
	            return false;
	        }
	        //全部已匹配
	        return true;
	    }
	    /**
	     * 是否匹配桃心图形
	     * @param  {Line[]} lines
	     * @param  {number} lineWidth 线宽（用于计算封口处的误差）
	     * @param  {CanvasRenderingContext2D} debugCtx? 指定ctx对象来进行调试，将画出外边框和内边框
	     */
	    isMatchHeart(lines, lineWidth, debugCtx) {
	        let keyPoints = this.keyPoints;
	        if (lines.length < 3) {
	            return false;
	        } //[判断条件-1]线段数量须>=3
	        if (Utils_1.Point.distance(keyPoints[0], keyPoints[keyPoints.length - 1]) > lineWidth * 2) {
	            return false;
	        } //[判断条件-2]第一个点和最后一个点距离不得超过ctx.lineWidth * n
	        //算出最外的点坐标
	        let firstPoint = this.keyPoints[0], top = firstPoint.y, bottom = firstPoint.y, left = firstPoint.x, right = firstPoint.x; //将第一个点坐标作为计算的初始值
	        //计算外框矩形
	        this.keyPoints.forEach((point) => {
	            if (point.y < top) {
	                top = point.y;
	            }
	            if (point.y > bottom) {
	                bottom = point.y;
	            }
	            if (point.x < left) {
	                left = point.x;
	            }
	            if (point.x > right) {
	                right = point.x;
	            }
	        });
	        let outerRect = new Phaser.Rectangle(left, top, right - left, bottom - top);
	        //内框矩形
	        let leftGap = outerRect.width * 0.2, innerWidth = outerRect.width - leftGap * 2, topGap = outerRect.height * 0.4, innerHeight = outerRect.height - topGap - outerRect.height * 0.2;
	        if (innerWidth < 10 || innerHeight < 10) {
	            return false;
	        } //[判断条件-3]内框宽高须>=10
	        let innerRect = new Phaser.Rectangle(outerRect.x + leftGap, outerRect.y + topGap, innerWidth, innerHeight);
	        // //边框的4个角的点
	        // let leftTop = new Point(left, top), rightTop = new Point(right, top), leftBottom = new Point(left, bottom), rightBottom = new Point(right, bottom);
	        //在内框中，关键点的个数
	        let invalidNum = 0, invalidPercent = 0;
	        this.keyPoints.forEach((point) => {
	            if (innerRect.contains(point.x, point.y)) {
	                invalidNum++;
	            }
	        });
	        invalidPercent = Math.floor((invalidNum / this.keyPoints.length) * 100);
	        if (invalidPercent > 10) {
	            return false;
	        } //[判断条件-4]内框中关键点个数不得超过10%
	        //[DEBUG]画出debug图形
	        if (debugCtx) {
	            debugCtx.save();
	            //画出外边框
	            debugCtx.strokeStyle = 'blue';
	            debugCtx.lineWidth = 1;
	            debugCtx.strokeRect(outerRect.x, outerRect.y, outerRect.width, outerRect.height);
	            //画出内边框
	            debugCtx.strokeStyle = 'green';
	            debugCtx.strokeRect(innerRect.x, innerRect.y, innerRect.width, innerRect.height);
	            debugCtx.restore();
	        }
	        //所有条件通过，返回true
	        return true;
	    }
	    /**
	     * 从计算结果对象中，计算出下一条线段（若未能找到，则返回null）
	     * @param  {boolean=false} isEnd 当前是否是处于画线结尾（用于暂时找不到转折点的情况下，当遇到最后一个点时，该点即作为线段的结尾）
	     * @returns MagicLine | null 返回找到的那条线段
	     */
	    calculateOneLine(isEnd = false) {
	        let { lines, lastIndex } = this;
	        //---关键点过滤（精度过滤）
	        let points = this.keyPoints = Utils_1.Point.filterByPrecision(this.keyPoints, this.precision, lastIndex);
	        //---初始位置
	        let firstPoint = points[lastIndex], secondPoint = points[lastIndex + 1], line = null;
	        //---遍历关键点
	        for (let i = lastIndex, len = points.length; i < len; i++) {
	            let startPoint = points[i], middlePoint = points[i + 1], endPoint = points[i + 2]; //它的下一个点作为中间点，后一个点作为第三个点（这样用于计算三点构成的两向量间的夹角）
	            if (!middlePoint) {
	                break;
	            }
	            else if (!endPoint) {
	                if (isEnd) {
	                    line = this.createLine(firstPoint, middlePoint);
	                    this.lastIndex = i + 1;
	                    break;
	                }
	                else {
	                    this.createLine(firstPoint, middlePoint, true); //创建保存一个模拟线段，仅用于实时显示信息，不加入线段计算中
	                    return null; //[直接退出]
	                }
	            }
	            //3.三点都存在
	            let startAngle = Utils_1.Point.getAngleBetween(startPoint, middlePoint, middlePoint, endPoint), firstAngle = Utils_1.Point.getAngleBetween(firstPoint, secondPoint, firstPoint, endPoint);
	            if (isNaN(startAngle)) {
	                console.error(`[MagicLineProcessor.calculateOneLine]startAngle值意外地变为了NaN，需要检查4个点的坐标是否有重合嫌疑: (${startPoint.x}, ${startPoint.y}), (${middlePoint.x}, ${middlePoint.y}), (${middlePoint.x}, ${middlePoint.y}), (${endPoint.x}, ${endPoint.y})`);
	                throw new Error('startAngle的值变为了NaN，需要排查程序');
	            }
	            if (isNaN(firstAngle)) {
	                console.error(`[MagicLineProcessor.calculateOneLine]firstAngle值意外地变为了NaN，需要检查4个点的坐标是否有重合嫌疑: (${firstPoint.x}, ${firstPoint.y}), (${secondPoint.x}, ${secondPoint.y}), (${firstPoint.x}, ${firstPoint.y}), (${endPoint.x}, ${endPoint.y})`);
	                throw new Error('firstAngle的值变为了NaN，需要排查程序');
	            }
	            // console.log(`startAngle: ${startAngle}, firstAngle: ${firstAngle}`);
	            if (startAngle < 40 && firstAngle < 20) {
	                continue; //继续下一个判断（直到找到该线段的终点）
	            }
	            else {
	                line = this.createLine(firstPoint, middlePoint); //初始点和当前中间点作为一条线段
	                this.lastIndex = i + 1; //记录最后一点（便于后续新增散列点后，继续计算）
	                break;
	            }
	        }
	        if (line) {
	            lines.push(line);
	        }
	        return line;
	    }
	}
	// static baseVector: Point = new Point(1, 0); //基线向量，用于计算线段的相对角度
	LineBuilder.baseVector = {
	    start: new Utils_1.Point(0, 0),
	    end: new Utils_1.Point(1, 0)
	};
	LineBuilder.softAngle = 10; //[配置值]横竖线的容错角度（此值越大，则越容易匹配为横竖线，而非斜线）
	// private resultFigure: LineFigure; //最终计算所得的图形
	//图形匹配规则（用于直接匹配为指定图形）
	LineBuilder.FigureRules = [{
	        exactMatch: true,
	        figure: 3 /* VERTICAL */,
	        ruleList: [{ types: [3 /* DOWN */, 2 /* UP */], range: [1, 2] }]
	    }, {
	        exactMatch: true,
	        figure: 4 /* HORIZONTAL */,
	        ruleList: [{ types: [0 /* LEFT */, 1 /* RIGHT */], range: [1, 2] }]
	    }, {
	        exactMatch: true,
	        figure: 1 /* BULGE */,
	        ruleList: [
	            { types: 6 /* DOWN_RIGHT */, range: [1, 4] },
	            { types: 1 /* RIGHT */, range: [0, 2] },
	            { types: [2 /* UP */, 4 /* UP_RIGHT */], range: [1, 4] } // 3|5 [1,4]
	        ]
	    }, {
	        exactMatch: true,
	        figure: 1 /* BULGE */,
	        ruleList: [
	            3 /* DOWN */,
	            { types: 6 /* DOWN_RIGHT */, range: [0, 3] },
	            { types: 1 /* RIGHT */, range: [0, 2] },
	            { types: 4 /* UP_RIGHT */, range: [1, 4] } // 5 [1,4]
	        ]
	    }, {
	        exactMatch: true,
	        figure: 1 /* BULGE */,
	        ruleList: [
	            { types: 7 /* DOWN_LEFT */, range: [1, 4] },
	            { types: 0 /* LEFT */, range: [0, 2] },
	            { types: [2 /* UP */, 5 /* UP_LEFT */], range: [1, 4] } // 3|7 [1,4]
	        ]
	    }, {
	        exactMatch: true,
	        figure: 1 /* BULGE */,
	        ruleList: [
	            3 /* DOWN */,
	            { types: 7 /* DOWN_LEFT */, range: [0, 3] },
	            { types: 0 /* LEFT */, range: [0, 2] },
	            { types: 5 /* UP_LEFT */, range: [1, 4] } // 7 [1,4]
	        ]
	    }, {
	        exactMatch: true,
	        figure: 2 /* SUNKEN */,
	        ruleList: [
	            { types: 4 /* UP_RIGHT */, range: [1, 4] },
	            { types: 1 /* RIGHT */, range: [0, 2] },
	            { types: [3 /* DOWN */, 6 /* DOWN_RIGHT */], range: [1, 4] } // 4|6 [1,4]
	        ]
	    }, {
	        exactMatch: true,
	        figure: 2 /* SUNKEN */,
	        ruleList: [
	            2 /* UP */,
	            { types: 4 /* UP_RIGHT */, range: [0, 3] },
	            { types: 1 /* RIGHT */, range: [0, 2] },
	            { types: 6 /* DOWN_RIGHT */, range: [1, 4] } // 6 [1,4]
	        ]
	    }, {
	        exactMatch: true,
	        figure: 2 /* SUNKEN */,
	        ruleList: [
	            { types: 5 /* UP_LEFT */, range: [1, 4] },
	            { types: 0 /* LEFT */, range: [0, 2] },
	            { types: [3 /* DOWN */, 7 /* DOWN_LEFT */], range: [1, 4] } // 4|8 [1,4]
	        ]
	    }, {
	        exactMatch: true,
	        figure: 2 /* SUNKEN */,
	        ruleList: [
	            2 /* UP */,
	            { types: 5 /* UP_LEFT */, range: [0, 3] },
	            { types: 0 /* LEFT */, range: [0, 2] },
	            { types: 7 /* DOWN_LEFT */, range: [1, 4] } // 8 [1,4]
	        ]
	    }, {
	        figure: 5 /* LIGHTNING */,
	        ruleList: [
	            { types: [7 /* DOWN_LEFT */, 3 /* DOWN */], range: [1, 4] },
	            { types: [1 /* RIGHT */, 6 /* DOWN_RIGHT */], range: [1, 4] },
	            { types: [7 /* DOWN_LEFT */, 3 /* DOWN */], range: [1, 4] } // 8|4 [1,4]
	        ]
	    }];
	exports.LineBuilder = LineBuilder;


/***/ },
/* 11 */
/*!*******************************!*\
  !*** ./src/lib/LifeFigure.ts ***!
  \*******************************/
/***/ function(module, exports) {

	"use strict";
	/**
	 * 用于ghost的血条显示和管理
	 */
	class LifeFigure {
	    //给某ghost对象添加血条显示和管理
	    constructor(ghost, lifeValues, options) {
	        this.figureDatas = []; //存放血块类型和图像对象
	        this.ghost = ghost;
	        this.options = Object.assign({}, options);
	        //在ghost头顶按顺序创建血块图像
	        let create = this.ghost.game.add;
	        for (let figure of lifeValues) {
	            let image = create.image(0, 0, 'Misc', `figure/${exports.LifeFigureMap[figure]}`);
	            ghost.addChild(image);
	            this.figureDatas.push({ figure: figure, image: image });
	        }
	        //位置排列
	        this.arrangeFigures();
	    }
	    //重新排列figures图像位置
	    arrangeFigures() {
	        let flipHorizontal = this.ghost.options.flipHorizontal, figureWidth = 26, figureHeight = 24, startPos = flipHorizontal ? this.ghost.getBodyTopRight(-figureWidth, -figureHeight) : this.ghost.getBodyTopLeft(0, -figureHeight), //起始点位置
	        offsetX = 0; //累加x坐标
	        console.log('--arrangeFigures', this.ghost.body.width, this.ghost.anchor.x, this.ghost.body.height, this.ghost.anchor.y);
	        this.figureDatas.forEach((data) => {
	            data.image.x = startPos.x + offsetX;
	            data.image.y = startPos.y;
	            offsetX += flipHorizontal ? -figureWidth : figureWidth; //向右 或 左继续排列
	        });
	    }
	    //获取当前图形
	    getCurrentFigure() {
	        return this.figureDatas.length ? this.figureDatas[0].figure : null;
	    }
	    //减少一个figure图形，并调整显示位置
	    reduceFigure() {
	        this.figureDatas.shift().image.destroy();
	        this.arrangeFigures();
	    }
	}
	exports.LifeFigure = LifeFigure;
	//资源字符串映射表
	exports.LifeFigureMap = {
	    [1 /* BULGE */]: 'bugle',
	    [2 /* SUNKEN */]: 'sunken',
	    [3 /* VERTICAL */]: 'vertical',
	    [4 /* HORIZONTAL */]: 'horizontal',
	    [5 /* LIGHTNING */]: 'lightning',
	    [6 /* HEART */]: 'heart'
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = LifeFigure;


/***/ },
/* 12 */
/*!******************************!*\
  !*** ./src/levels/Level1.ts ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const Level_1 = __webpack_require__(/*! ../core/Level */ 13);
	/**
	 * 第一关
	 */
	class Level1 extends Level_1.default {
	    setupScene() {
	        this.setBackground('level-1');
	    }
	    setupGhosts() {
	        let game = this.scene.game, player = this.scene.player;
	        this.fresher = this.createGhost('Fresher', 100, 100, {
	            lifeValues: [1 /* BULGE */, 6 /* HEART */, 2 /* SUNKEN */, 3 /* VERTICAL */, 4 /* HORIZONTAL */, 5 /* LIGHTNING */]
	        });
	        // this.fresher = this.createGhost('Fresher', game.width / 2, game.height / 2, {
	        //   // lifeValues: [LifeFigureValue.BULGE, LifeFigureValue.HEART, LifeFigureValue.SUNKEN, LifeFigureValue.VERTICAL, LifeFigureValue.HORIZONTAL, LifeFigureValue.LIGHTNING]
	        //   lifeValues: [LifeFigureValue.BULGE]
	        // });
	        console.log('Level1', this.ghosts.children);
	        //test
	        // window['fresher'] = this.fresher;
	        // window['player'] = player;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Level1;


/***/ },
/* 13 */
/*!***************************!*\
  !*** ./src/core/Level.ts ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const Fresher_1 = __webpack_require__(/*! ../ghosts/Fresher */ 14);
	/**
	 * 游戏关卡虚基类
	 */
	class Level {
	    constructor(scene) {
	        this.scene = scene;
	        this.ghosts = new Phaser.Group(this.scene.game);
	    }
	    //[子类可重写]
	    render() {
	        // //【性能消耗】显示所有ghost的body、sprite本身、shadow本身的轮廓
	        // this.ghosts.forEachAlive((ghost) => {
	        //   if (ghost instanceof Ghost) {
	        //     let debug = this.scene.game.debug;
	        //     debug.body(ghost, 'rgba(0, 255, 0, 0.3)'); //body - 绿色
	        //     debug.spriteBounds(ghost, 'rgba(255, 0, 0, 0.3)'); //sprite本身 - 红色
	        //     if (ghost.shadow) { debug.spriteBounds(ghost.shadow, 'rgba(0, 0, 255, 0.3)'); } //shadow本身 - 蓝色
	        //   }
	        // }, null);
	    }
	    //创建ghost
	    createGhost(name, x, y, options) {
	        let ghostClass = Level.GhostTypes[name], player = this.scene.player, game = this.scene.game;
	        if (ghostClass) {
	            let ghost = new ghostClass(player, Object.assign({
	                game: game,
	                x: x, y: y,
	                flipHorizontal: x < game.width / 2 //若处于左边区域，则进行水平翻转
	            }, options));
	            return this.ghosts.add(ghost);
	        }
	        else {
	            throw new Error('找不到要创建的Ghost对象');
	        }
	    }
	    // //ghost生成器
	    // generateGhosts(name: string, options: GenerateOptions) {
	    //   options = Object.assign({
	    //     positions: new Phaser.Point(0, 0),
	    //     regionRadius: 0, //默认在基础点上生成
	    //     amount: 1 //默认仅生成一个
	    //   }, options);
	    //   // let
	    //   //   totalPoints = Array.isArray(options.positions) ? options.positions.length : 1, //总基础点数
	    //   //   average = options.amount > 1 ? Math.floor(options.amount / totalPoints) : 1; //平均生成个数
	    //   // for (let count = 0; count < options.amount; i++) {}
	    // }
	    //切换背景图片（切换帧），若frameName为空，则隐藏背景
	    setBackground(frameName) {
	        let background = this.scene.background;
	        if (frameName) {
	            background.frameName = frameName;
	            background.visible = true; //显示
	        }
	        else {
	            background.visible = false; //隐藏
	        }
	    }
	}
	//ghost类型
	Level.GhostTypes = {
	    'Fresher': Fresher_1.default
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Level;


/***/ },
/* 14 */
/*!*******************************!*\
  !*** ./src/ghosts/Fresher.ts ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const Ghost_1 = __webpack_require__(/*! ../core/sprite/Ghost */ 15);
	const Utils_1 = __webpack_require__(/*! ../core/Utils */ 9);
	/**
	 * [初级]ghost
	 */
	class Fresher extends Ghost_1.Ghost {
	    constructor(player, options) {
	        super(player, Object.assign({
	            // game: game, 
	            // x: 100, y: 100, key: 'Ghost.Fresher', frame: 'normal',
	            shadow: {
	                x: -75, y: -75,
	                // x: 0, y: 0,
	                key: 'GhostFresher',
	                frame: 'normal'
	            },
	            speed: Ghost_1.Ghost.defaultRate * 0.6,
	            // lifeOptions: {
	            //   offset: { x: -30, y: -35 }
	            // },
	            // anchor: { x: 0, y: 0 },
	            // anchor: { x: 0.9, y: 1.1 },
	            bodySize: { width: 59, height: 75, offsetX: 0, offsetY: 0 }
	        }, options));
	        //初始动画
	        // this.play('normal');
	        //     this.playUpdown();
	        // console.log('----fresher', this);
	        // super(game, game.world.randomX, game.world.randomY, 'Ghost.Fresher');
	        //test
	        // this.game.physics.arcade.moveToObject(this, player.body, 300);
	        // this.game.physics.arcade.accelerateToObject(this, player, 200);
	    }
	    onBeforeMarch() {
	        this.playUpdown();
	    }
	    onAfterMarch() {
	        this.stopUpdown();
	    }
	    onBeforeAttack() {
	        this.game.audio.playEffect('fresher-attack-disappear');
	        this.shadow.play('attack');
	    }
	    onAfterAttack() {
	        this.alive = false; //直接静默式地死亡(不摧毁，后面手动摧毁)
	        console.log('-----onAfterAttack');
	        this.game.time.events.add(Phaser.Timer.HALF, () => {
	            console.log('-----not occur');
	            this.playTween('disappear').onComplete.addOnce(() => this.destruct());
	        });
	    }
	    onBeforeHurt() {
	        super.onBeforeHurt();
	        return this.exPlay('hurt', true);
	    }
	    onBeforeDie() {
	        super.onBeforeDie();
	        return this.exPlay('die', true);
	    }
	    initializeAnimations() {
	        let animations = this.shadow.animations, frameRate = Ghost_1.Ghost.defaultRate;
	        //normal
	        animations.add('normal', ['normal']);
	        //attack
	        animations.add('attack', Utils_1.default.concatRepeat([], 'attack/1', 4, 'attack/2', 5, 'attack/3', 5, 'attack/4', 5, 'attack/5', 5, 'attack/6', 5, 'attack/7', 1), frameRate);
	        //hurt
	        let hurt = animations.add('hurt', Utils_1.default.concatRepeat([], 'hurt/1', 4, 'hurt/2', 5, 'hurt/3', 5, 'hurt/4', 5, 'hurt/5', 21), frameRate);
	        hurt.onComplete.add(() => animations.play('normal'));
	        //die
	        animations.add('die', Utils_1.default.concatRepeat([], 'die/1', 4, 'die/2', 5, 'die/3', 5, 'die/4', 5, 'die/5', 5, 'die/6', 5, 'die/7', 5, 'die/8', 5), frameRate);
	        //disappear（攻击完毕后消失）
	        this.createTween('disappear', true).to({ alpha: 0 }, 1000, 'Linear', false);
	        //updown上下游荡
	        let shadowY = this.shadow.y;
	        this.createTween('updown', true)
	            .to({ y: shadowY - 5 }, 500).to({ y: shadowY }, 500)
	            .to({ y: shadowY + 5 }, 500).to({ y: shadowY }, 500)
	            .loop();
	    }
	    playUpdown() { this.getTween('updown').start(); }
	    stopUpdown() { this.getTween('updown').pause(); }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Fresher;


/***/ },
/* 15 */
/*!**********************************!*\
  !*** ./src/core/sprite/Ghost.ts ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments)).next());
	    });
	};
	const Sprite_1 = __webpack_require__(/*! ./Sprite */ 8);
	const LifeFigure_1 = __webpack_require__(/*! ../../lib/LifeFigure */ 11);
	/**
	 * ghost基类
	 */
	class Ghost extends Sprite_1.Sprite {
	    constructor(player, options) {
	        options.maxHealth = options.lifeValues.length; //ghost的生命值等于血条长度
	        super(options);
	        //初始化
	        this.player = player;
	        this.life = new LifeFigure_1.LifeFigure(this, options.lifeValues, options.lifeOptions);
	        //准备move到player
	        this.march();
	    }
	    /*
	    -------------------------------------------------------------
	    | 对外api
	    -------------------------------------------------------------
	    */
	    //获得当前血块图形
	    getCurrentFigure() {
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
	    onBeforeMarch() { }
	    march() {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (false !== (yield this.onBeforeMarch())) {
	                yield this.moveTo(this.player);
	                this.onAfterMarch();
	                //开始进行攻击
	                if (this.player.alive) {
	                    this.attack();
	                }
	            }
	        });
	    }
	    onAfterMarch() { } //进军完成，已移动到指定位置
	    //发起一次攻击
	    onBeforeAttack() { }
	    attack() {
	        return __awaiter(this, void 0, void 0, function* () {
	            yield this.onBeforeAttack();
	            this.player.hurt();
	            console.log('-----hurt over');
	            yield this.onAfterAttack();
	        });
	    }
	    onAfterAttack() { }
	}
	exports.Ghost = Ghost;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Ghost;


/***/ }
/******/ ]);
//# sourceMappingURL=main.bundle.js.map