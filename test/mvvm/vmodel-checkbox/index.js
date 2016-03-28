require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML =  [
		// single selection
		'<input type="checkbox" v-model="mvp"> mvp',
		'<br/>',
		'选择结果：<span v-html="mvp"></span>',

		// multi selection
		// '<input type="checkbox" value="curry" v-model="players"> 库里',
		// '<input type="checkbox" value="west" v-model="players"> 维斯布鲁克',
		// '<input type="checkbox" value="durant" v-model="players"> 杜兰特',
		// '<hr/>',
		// '选择结果：<span v-html="players"></span>'

		// vfor test multi selection
		// '<ul>',
		// 	'<li v-for="item in items">',
		// 		'<p>',
		// 			'<input type="checkbox" v-bind:value="item.value" v-model="item.isChecked"> {{item.title}}',
		// 			'<br/>',
		// 			'结果：是否是{{item.title}} ？<b v-html="item.isChecked"></b>',
		// 			'<div v-bind:style="style" v-for="p in item.options">',
		// 				'<input type="checkbox" v-bind:value="p.value" v-model="p.isChecked"> {{p.title}}',
		// 				'<br/>',
		// 				'结果：是否是{{p.title}} ？<b v-html="p.isChecked"></b>',
		// 			'</div>',
		// 		'</p>',
		// 	'</li>',
		// '</ul>'

		// vfor test multi selection
		'<hr/>',
		'<ul>',
			'<li v-for="item in items">',
				'<p>',
					'选择结果：<b v-html="item.res"></b>',
					'<br/>',
					'<span v-for="p in item.options">',
						'<input type="checkbox" v-bind:value="p.value" v-model="item.res"> {{p.title}}',
					'</span>',
				'</p>',
			'</li>',
		'</ul>'
	].join('');

	var vm = new VM(body, {
		'style': {
			'padding-left': '20px'
		},

		// single selection
		'mvp': true,

		// multi selection
		// 'players': []

		// vfor test single selection
		// 'items': [
		// 	{'isChecked': true, 'value': 10, 'title': '动物', 'options': [
		// 		{'isChecked': true, 'value': 101, 'title': '狐狸'},
		// 		{'isChecked': true, 'value': 102, 'title': '兔子'},
		// 		{'isChecked': true, 'value': 103, 'title': '树懒'}
		// 	]},
		// 	{'isChecked': true, 'value': 11, 'title': '电影', 'options': [
		// 		{'isChecked': false, 'value': 111, 'title': '我的少女时代'},
		// 		{'isChecked': false, 'value': 112, 'title': '疯狂动物城'},
		// 		{'isChecked': false, 'value': 113, 'title': '夏洛特烦恼'},
		// 		{'isChecked': false, 'value': 114, 'title': '功夫熊猫3'}
		// 	]},
		// 	{'isChecked': true, 'value': 12, 'title': '程序员', 'options': [
		// 		{'isChecked': true, 'value': 121, 'title': '初级前端'},
		// 		{'isChecked': true, 'value': 122, 'title': '中间前端'},
		// 		{'isChecked': true, 'value': 123, 'title': '高级前端'}
		// 	]}
		// ]


		// vfor test multi selection
		'items': [
			{
				'res': ['a3'],
				'options': [
					{'title': 'a1', 'value': 'a1'},
					{'title': 'a2', 'value': 'a2'},
					{'title': 'a3', 'value': 'a3'},
				]
			},
			{
				'res': ['b2'],
				'options': [
					{'title': 'b1', 'value': 'b1'},
					{'title': 'b2', 'value': 'b2'},
					{'title': 'b3', 'value': 'b3'},
				]
			}
		]
	});

	window.vm = vm.get();
});