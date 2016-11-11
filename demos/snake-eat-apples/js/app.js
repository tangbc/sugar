;(function (exports, Header, Playground, Keymap) {

	// Top app component definition
	var App = Sugar.Component.extend({
		init: function (config) {
			this.Super('init', config, {
				target: '#app',
				css: { width: AppConfig.WIDTH + 'px' },
				model: {
					loading: true
				},
				childs: {
					AppHeader: Header,
					AppPlayground: Playground
				}
			});
		},

		afterRender: function () {
			this.virgin = true;
			this.vm.$data.loading = false;
			this.on(document, 'keydown', this.documentKeyDown);
		},

		// listen to document keydown event
		documentKeyDown: function (e) {
			var key = Keymap[e.keyCode];
			var childs = this.getChilds();
			var header = childs.AppHeader;
			var playground = childs.AppPlayground;

			if (key === 'SPACE') {
				// first press, just to start game
				if (this.virgin) {
					this.virgin = false;
					header.startTime();
					playground.start();
					return;
				}

				header.pauseTime();
				playground.pause();
			} else if (key === 'ESC') {
				header.reset();
				playground.reset();
			} else if (key) {
				playground.update(key);
			}
		},

		// game over message from AppPlayground
		onGameOver: function () {
			this.getChild('AppHeader').end();
		},

		// snake eat a fruit, message from AppPlayground
		onEatFruit: function () {
			this.getChild('AppHeader').addScore();
		}
	});

	// Create game instance
	Sugar.core.create('app', App);

})(window, AppHeader, AppPlayground, AppKeymap);
