require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					// vfor
					'<ul>',
						'<li v-for="item in items">',
							'<h3 v-text="item.family" v-if="show"></h3>',
							'<h3 v-text="item.name" v-else></h3>',
							// '<div v-for="p in item.ps">',
							// 	'<b v-text="p.big" v-if="p.show"></b>',
							// 	'<b v-text="p.small" v-else></b>',
							// '</div>',
						'</li>',
					'</ul>',

					// normal
					'<div v-if="show">',
						'<i v-text="h1"></i>',
					'</div>',
					'<p v-else>',
						'<b v-text="h2"></b>',
					'</p>'
				].join(''),
				'model': {
					// normal
					'h1': '标题1',
					'h2': '标题2',
					'show': false,
					// vfor
					'items': [
						{'family': '斯蒂芬', 'name': '库里', 'show': false, 'ps': [
							{'small': 'aaa', 'big': 'AAA', 'show': false},
							{'small': 'bbb', 'big': 'BBB', 'show': false}
						]},
						{'family': '克莱', 'name': '汤普森', 'show': false, 'ps': [
							{'small': 'ddd', 'big': 'DDD', 'show': false},
							{'small': 'eee', 'big': 'EEE', 'show': false}
						]}
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