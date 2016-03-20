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
					// '<select v-model="selecteds" multiple>',
					// 	'<option value="curry">库里</option>',
					// 	'<option value="kelay">汤普森</option>',
					// 	'<option value="green">格林</option>',
					// '</select>',
					// '<span>Selected: {{ selecteds }}</span>'

					// without value in vfor
					// '<select v-model="selected">',
					// 	'<option v-for="option in options">',
					// 	'{{ option.text }}',
					// 	'</option>',
					// '</select>',
					// '<span>Selected: {{ selected }}</span>'

					// with value in vfor
					// '<select v-model="selected" multiple>',
					// 	'<option v-for="option in options" v-bind:value="option.value">',
					// 	'{{ option.text }}',
					// 	'</option>',
					// '</select>',
					// '<p>Selected: {{ selected }}</p>'

					// nest vfor
					'<select v-for="sel in selects" v-model="sel.res">',
						'<option v-for="op in sel.opts">',
							'{{op.text}}',
						'</option>',
					'</select>',
					'<p v-for="sel in selects">',
						'{{sel.type}} Selected: ',
						'<span>{{sel.res}}</span>',
					'</p>'
				].join(''),
				'model': {
					// without value
					// 'selected': '格林'

					// with value
					// 'selected': 'kelay'

					// multi selection
					// 'selecteds': ['curry', 'green']

					// without value in vfor
					// 'selected': '汤普森',
					// 'options': [
					// 	{'text': '库里'},
					// 	{'text': '汤普森'},
					// 	{'text': '格林'},
					// ]

					// width value in vfor
					// 'selected': ['kelay'],
					// 'options': [
					// 	{'value': 'curry', 'text': '库里'},
					// 	{'value': 'kelay', 'text': '汤普森'},
					// 	{'value': 'green', 'text': '格林'},
					// ]

					// nest vfor
					'selects': [
						{
							'type': '类型A',
							'res': 'A2',
							'opts': [
								{'text': 'A1'},
								{'text': 'A2'},
								{'text': 'A3'}
							]
						},
						{
							'type': '类型B',
							'res': 'B3',
							'opts': [
								{'text': 'B1'},
								{'text': 'B2'},
								{'text': 'B3'}
							]
						}
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