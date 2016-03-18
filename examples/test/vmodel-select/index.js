require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					// without value
					// '<select v-model="selected">',
					// 	'<option>库里</option>',
					// 	'<option>汤普森</option>',
					// 	'<option>格林</option>',
					// '</select>',
					// '<span>Selected: {{ selected }}</span>'

					// width value
					// '<select v-model="selected">',
					// 	'<option value="curry">库里</option>',
					// 	'<option value="kelay">汤普森</option>',
					// 	'<option value="green">格林</option>',
					// '</select>',
					// '<span>Selected: {{ selected }}</span>'

					// multi selection
					'<select v-model="selecteds" multiple>',
						'<option value="curry">库里</option>',
						'<option value="kelay">汤普森</option>',
						'<option value="green">格林</option>',
					'</select>',
					'<span>Selected: {{ selecteds }}</span>'

					// without value in vfor
					// '<select v-model="selected">',
					// 	'<option v-for="option in options" v-bind:value="option.value">',
					// 	'{{ option.text }}',
					// 	'</option>',
					// '</select>',
					// '<span>Selected: {{ selected }}</span>'

					// with value in vfor
					// '<select v-model="selected">',
					// 	'<option v-for="option in options" v-bind:value="option.value">',
					// 	'{{ option.text }}',
					// 	'</option>',
					// '</select>',
					// '<span>Selected: {{ selected }}</span>'
				].join(''),
				'model': {
					// without value
					// 'selected': '库里'

					// with value
					// 'selected': 'kelay'

					// multi selection
					'selecteds': ['curry', 'green']

					// without value in vfor
					// 'selected': '',
					// 'options': [
					// 	{'value': 'curry', 'text': '库里'},
					// 	{'value': 'curry', 'text': '库里'},
					// 	{'value': 'curry', 'text': '库里'},
					// ]
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