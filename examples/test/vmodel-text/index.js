require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					// '<h3>{{title}}</h3>',
					// '<input type="text" v-model="title">'

					// vfor test
					'<h3>{{title}}</h3>',
					'<ul>',
						'<li v-for="item in items">',
							'<span>{{item.title}}</span>',
							'<input type="text" v-model="item.title">',
							'<input type="text" v-model="title">',
						'</li>',
					'</ul>'
				].join(''),
				'model': {
					'title': '标题',

					'items': [
						{'title': 'aaa'},
						{'title': 'bbb'},
						{'title': 'ccc'}
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