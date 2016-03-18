require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					// '<input type="radio" value="nan" v-model="sex">男',
					// '<input type="radio" value="nv" v-model="sex">女'

					// vfor test
					'<ul>',
						'<li v-for="item in items">',
							'<input type="radio" v-bind:value="item.value" v-model="mvp"> {{item.player}}',
						'</li>',
					'</ul>'
				].join(''),
				'model': {
					'sex': 'nan',

					// vfor test
					'mvp': 'Curry',
					'items': [
						{'value': 'Curry', 'player': '斯蒂芬库里'},
						{'value': 'West', 'player': '拉塞尔维斯布鲁克'},
						{'value': 'Durant', 'player': '凯文杜兰特'},
					]
				}
			});
			this.Super('init', arguments);
		},

		viewReady: function() {
			window.vm = this.vm.$data;
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});