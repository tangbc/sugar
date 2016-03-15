require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					// single
					// '<div style="display:block;" v-bind:style="{color: clr}">text</div>',

					// styleobj
					// '<h1 style="display:block;" v-bind:style="obj"></h1>',

					// single stylejson
					// '<h1 style="display:block;" v-bind:style="{color: clr, border: bdr}"></h1>',

					// mutil property with styleobj
					'<h1 v-bind="{style: styleobj, id: pid}"></h1>',

				].join(''),
				'model': {
					// single
					// 'clr': 'red',

					// styleobj
					// 'obj': {
					// 	'color': 'red',
					// 	'border': '1px solid #000',
					// 	'xxx': 'yyy'
					// }

					// single stylejson
					// 'clr': 'green',
					// 'bdr': '1px solid #000'

					// mutil property with styleobj
					'styleobj': {
						'color': 'red',
						'paddingTop': '10px',
						'margin-left': '10px',
						'border': '1px solid #000',
					},
					'pid': '30'

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