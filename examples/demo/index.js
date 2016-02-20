require(['../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					// radio base test
					// '<input type="radio" value="curry" v-model="mvp">',
					// 'Curry',
					// '<input type="radio" value="durant" v-model="mvp">',
					// 'Durant',
					// '<input type="radio" value="westbrook" v-model="mvp">',
					// 'Westbrook',
					// '<hr>',
					// '<input type="radio" value="1" v-model="number">',
					// '1',
					// '<input type="radio" value="2" v-model="number">',
					// '2',
					// '<input type="radio" value="3" v-model="number">',
					// '3',

					// checkboxs base test
					'<input type="checkbox" value="curry" v-model="players">',
					'Curry',
					'<input type="checkbox" value="durant" v-model="players">',
					'Durant',
					'<input type="checkbox" value="westbrook" v-model="players">',
					'Westbrook',

					'<hr>',

					// checkbox base test
					'<input type="checkbox" value="mvp" v-model="isCheckMvp">',
					'MVP',
					'<hr>',
					'<button v-on:click="clickBtn">按钮</button>'
				].join(''),
				'model': {
					// 'mvp': 'durant',
					// 'number': 2

					'players': ['curry', 'westbrook'],

					'isCheckMvp': false,

					'clickBtn': this.clickBtn.bind(this)
				}
			});
			this.Super('init', arguments);
		},
		clickBtn: function() {
			console.log(this.vm.$data.isCheckMvp, this.vm.$data.players.slice(0));
		},
		viewReady: function() {
			var vm = this.vm.$data;

			// this.setTimeout(function() {
			// 	vm.mvp = 'curry';
			// 	vm.number = 1;

			// 	this.setTimeout(function() {
			// 		vm.mvp = 'westbrook';
			// 		vm.number = 3;
			// 	}, 3000);

			// }, 3000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});