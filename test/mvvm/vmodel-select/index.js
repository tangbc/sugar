require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML =  [
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
	].join('');

	var vm = new VM(body, {
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
				'type': '勇士队',
				'res': '库里',
				'opts': [
					{'text': '库里'},
					{'text': '汤普森'},
					{'text': '格林'}
				]
			},
			{
				'type': '雷霆队',
				'res': '杜兰特',
				'opts': [
					{'text': '维斯布鲁克'},
					{'text': '杜兰特'},
					{'text': '伊巴卡'}
				]
			},
			{
				'type': '湖人队',
				'res': '科比',
				'opts': [
					{'text': '拉塞尔'},
					{'text': '兰德尔'},
					{'text': '科比'}
				]
			}
		]
	});

	window.vm = vm.get();
});