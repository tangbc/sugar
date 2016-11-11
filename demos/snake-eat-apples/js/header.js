;(function (exports, Config) {

	// score localStorage
	var Storage = {
		set: function (score) {
			localStorage.setItem('BESTSCORE', score);
		},
		get: function () {
			return localStorage.getItem('BESTSCORE') || '-';
		}
	}

	// keep a single number with 0
	function keepDouble (num) {
		return (num > 9 ? '' : '0') + num;
	}

	// AppHeader component definition
	var Header = Sugar.Component.extend({
		init: function (config) {
			this.Super('init', config, {
				class: 'header',
				template: './template/header.html',
				model: {
					best: Storage.get(),
					score: 0,
					broke: false,
					minute: '--',
					secound: '--'
				},
				cbRender: 'initState'
			});
		},

		initState: function () {
			this.minute = 0;
			this.secound = 0;
			this.timer = null;
			this.over = false;
			this.hasRecord = this.vm.get('best') !== '-';
		},

		// start to count game time
		startTime: function () {
			var self = this;
			this.timer = window.setTimeout(function () {
				self.secound++;

				if (self.secound === 60) {
					self.minute++;
					self.secound = 0;
				}

				self.vm.set({
					minute: keepDouble(self.minute),
					secound: keepDouble(self.secound)
				});

				self.startTime();
			}, 1000);
		},

		// pause game time
		pauseTime: function (force) {
			if (this.timer || force) {
				window.clearTimeout(this.timer);
				this.timer = null;
			} else if (!this.over) {
				this.startTime();
			}
			return this;
		},

		// game over
		end: function () {
			this.over = true;
			this.pauseTime(true);

			// for the frist play
			if (!this.hasRecord) {
				this.saveScore();
			}
		},

		// add score with eaten an apple
		addScore: function () {
			var data = this.vm.$data;
			data.score = data.score + Config.SCORE;

			// is current score breaking record
			if (this.hasRecord && (data.score > data.best)) {
				this.saveScore();
				data.broke = true;
			}
		},

		// save the socre if it's best record
		saveScore: function () {
			var data = this.vm.$data;
			data.best = data.score;
			Storage.set(data.best);
		},

		// reset component, be ready to restart
		reset: function () {
			this.pauseTime(true);
			this.initState();
			this.vm.reset();
			this.vm.set('best', Storage.get());
		}
	});

	exports.AppHeader = Header;

})(window, AppConfig);
