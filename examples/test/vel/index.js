require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<ul>',
						'<li v-for="item in items">',
							'<b v-text="item.text"></b>',
							'<div v-for="p in item.ps">',
								'<span v-el="p.el">{{p.number}}</span>',
							'</div>',
						'</li>',
					'</ul>'
				].join(''),
				'model': {
					'items': [
						{'text': '库里', 'ps': [{'number': 30}, {'number': 13}]},
						{'text': '汤普森', 'ps': [{'number': 11}]},
						{'text': '格林', 'ps': [{'number': 23}]}
					]
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			window.vm = vm = this.vm.$data;

			this.setTimeout(function() {

				this.setTimeout(function() {

				}, 2000)
			}, 2000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});