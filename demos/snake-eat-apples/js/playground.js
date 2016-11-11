;(function (exports, Config, Fruit) {

	// base const definition
	var UNIT = Config.UNIT;
	var WIDTH = Config.WIDTH;
	var HEIGHT = Config.HEIGHT;
	var LENGTH = Config.LENGTH;
	var DEFAULTDIRECT = 'LEFT';
	var TYPE = { head: 'head', body: 'body', dead: 'dead' };

	// create a grid line position cssText
	function createGridLineStyle (top, left, width, height) {
		return [
			'padding:0; margin: 0;',
			'position: absolute; overflow:hidden;',
			(top ? 'border-top:1px dashed #ccc;': ''),
			(left ? 'border-left:1px dashed #ccc;' : ''),
			'top:'+ top +'px; left:'+ left +';',
			'width:'+ width +'px; height:'+ height +'px;'
		].join('');
	}

	// create a snake grub body item
	function createGrub (line, row, type) {
		return {
			row: row,
			line: line,
			type: type,
			life: '',
			direct: ''
		}
	}

	// number of rows and lines
	var ROWS = Math.floor(WIDTH / UNIT);
	var LINES = Math.floor(HEIGHT / UNIT);

	// calculate the middle grid of snake head which row/line to start
	var STARTLINE = Math.floor(LINES / 2) - 1;
	var STARTROW = Math.floor((ROWS - LENGTH) / 2);

	// create init snake, put they on the middle of playground
	var INITSNAKES = [createGrub(STARTLINE, STARTROW, TYPE.head)];
	for (var i = 1; i < LENGTH + 1 ; i++) {
		INITSNAKES.push(createGrub(STARTLINE, STARTROW + i, TYPE.body));
	}

	var _ = Sugar.util;

	// get snake current zone array
	function getZone (snakes) {
		var zone = [];
		_.each(snakes, function (snake) {
			zone.push(snake.row + ',' + snake.line);
		});
		return zone;
	}

	// AppPlayground component definition
	var Playground = Sugar.Component.extend({
		init: function (config) {
			this.Super('init', config, {
				class: 'playground',
				css: { width: WIDTH + 'px', height: HEIGHT + 'px' },
				template: './template/playground.html',
				model: {
					running: false, // if snake running or over
					showResult: false, // show result when game over
					unit: UNIT, // per step progress piex
					scale: UNIT + 'px', // per grub scale
					bgsize: UNIT + 'px ' + UNIT + 'px', // just for snake head bg
					snakes: INITSNAKES,
					fruits: []
				}
			});
		},

		afterRender: function () {
			this.initState();
			this.buildGrid();

			// fruit producer
			this.fruit = new Fruit(ROWS, LINES);
			this.addFruit();
		},

		initState: function () {
			// is there has any uneaten fruits
			this.rest = false;
			this.timer = null;

			// head row and line
			this.row = STARTROW;
			this.line = STARTLINE;

			// if game is over or not start yet
			this.over = false;
			// default direction
			this.direct = DEFAULTDIRECT;
		},

		// build grid for rectify
		buildGrid: function () {
			var i, gridDom = this.vm.$els.grid;

			// build rows
			for (i = 0; i < ROWS; i++) {
				var subRow = document.createElement('p');
				subRow.style.cssText = createGridLineStyle(0, UNIT * i, 0, HEIGHT);
				gridDom.appendChild(subRow);
			}

			// build lines
			for (i = 0; i < LINES; i++) {
				var subLine = document.createElement('p');
				subLine.style.cssText = createGridLineStyle(UNIT * i, 0, WIDTH, 0);
				gridDom.appendChild(subLine);
			}
		},

		// start game
		start: function () {
			var self = this;
			this.vm.$data.running = true;
			this.timer = window.setTimeout(function () {
				// change snake direct
				switch (self.direct) {
					case 'UP':
						self.turnUp();
						break;
					case 'DOWN':
						self.turnDown();
						break;
					case 'LEFT':
						self.turnLeft();
						break;
					case 'RIGHT':
						self.turnRight();
						break;
					default: return;
				}

				if (self.over) {
					return;
				}

				self.moveBody() // move snake body first
					.moveHead() // then move snake head
					.check() // check if snake is alive
					.start();
			}, Config.SPEED);
		},

		turnUp: function () {
			if (this.line > 0) {
				this.line--;
			} else {
				this.gameOver();
			}
		},

		turnDown: function () {
			if (this.line < LINES - 1) {
				this.line++;
			} else {
				this.gameOver();
			}
		},

		turnLeft: function () {
			if (this.row > 0) {
				this.row--;
			} else {
				this.gameOver();
			}
		},

		turnRight: function () {
			if (this.row < ROWS - 1) {
				this.row++;
			} else {
				this.gameOver();
			}
		},

		// move snake head
		moveHead: function () {
			var snakes = this.vm.$data.snakes;
			snakes[0].row = this.row;
			snakes[0].line = this.line;
			snakes[0].direct = this.direct;
			return this;
		},

		// move snake body, front grub position pass to behind grub
		moveBody: function () {
			var snakes = this.vm.$data.snakes;
			for (var i = snakes.length - 1; i > 0; i--) {
				snakes[i].row = snakes[i - 1].row;
				snakes[i].line = snakes[i - 1].line;
			}
			return this;
		},

		// check if snake is alive
		check: function () {
			this.checkEatSelf();
			this.checkEatLeftover();
			return this;
		},

		// check if sanke eat itself
		checkEatSelf: function () {
			var snakes = this.vm.$data.snakes;

			for (var i = 1; i < snakes.length; i++) {
				if (this.row === snakes[i].row && this.line === snakes[i].line) {
					this.gameOver();
				}
			}
		},

		// check if snake eat a leftover
		checkEatLeftover: function () {
			var res = this.fruit.check(this.row, this.line);

			if (res === 0) {
				this.eatFruit().addFruit();
			} else if (res === 1) {
				this.gameOver();
			}
		},

		// eat a fresh fruit
		eatFruit: function () {
			this.addGrub();
			this.rest = false;
			this.vm.$data.fruits[0].eaten = true;
			this.fruit.addEaten(this.row, this.line);
			// notify to parent component
			this.fire('eatFruit');
			return this;
		},

		// add a grub to snake body
		addGrub: function () {
			var data = this.vm.$data;
			var snakes = data.snakes;
			var last = snakes.length - 1;
			snakes.push(createGrub(snakes[last].line, snakes[last].row, TYPE.body));
		},

		// add a new/fresh fruit to playground
		addFruit: function () {
			if (!this.rest) {
				this.rest = true;
				var data = this.vm.$data;
				var zone = getZone(data.snakes);
				data.fruits.unshift(this.fruit.bear(zone));
			}
		},

		// snake dead, game over
		gameOver: function () {
			var data = this.vm.$data;
			this.pause(true);
			this.over = true;
			_.each(data.snakes, function (snake) {
				snake.life = TYPE.dead;
			});
			data.showResult = true;
			this.fire('gameOver');
		},

		// pause game
		pause: function (force) {
			if (this.timer || force) {
				window.clearTimeout(this.timer);
				this.timer = null;
			} else if (!this.over) {
				this.start();
			}
		},

		// update direction according to pressing key
		update: function (key) {
			// avoid going back
			if (
				(key === 'UP' && this.direct === 'DOWN') ||
				(key === 'DOWN' && this.direct === 'UP') ||
				(key === 'LEFT' && this.direct === 'RIGHT') ||
				(key === 'RIGHT' && this.direct === 'LEFT')
			) {
				return;
			}

			this.direct = key;
		},

		// reset state, be ready to restart
		reset: function () {
			this.pause(true);
			this.initState();
			this.vm.reset();
			this.fruit.reset();
			this.addFruit();
		}
	});

	exports.AppPlayground = Playground;

})(window, AppConfig, AppFruit);
