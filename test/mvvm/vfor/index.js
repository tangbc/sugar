require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML = [
		// normal vfor
		// '<ul>',
		// 	'<li v-for="item in items">',
		// 		'<p v-text="item.text"></p>',
		// 		'<div v-for="arr in item.arrs">',
		// 			'<a v-text="item.arr.text"></a>',
		// 			'<b v-for="s in item.arrs.ss">',
		// 				'<i style="display:block;" v-text="s.text"></i>',
		// 			'</b>',
		// 		'</div>',
		// 	'</li>',
		// '</ul>'

		// bind property in top element
		// '<ul>',
		// 	'<li v-for="item in items" v-bind:data-id="did" v-bind:id="item.id">',
		// 		'<span v-text="item.text"></span>',
		// 		'<b>{{item.text}}</b>',
		// 	'</li>',
		// '</ul>',

		// double vfor test
		'<div v-for="item in items" v-bind="{data-id: did, id: item.id}">',
			'<i>{{item.text}}</i>',
		'</div>',
		'<p v-for="item in items" v-bind="{id: item.id, data-id: did}">',
			'<b>{{item.text}}</b>',
		'</p>',
	].join('');

	var vm = new VM(body, {
		// 'hehe': 111,
		// 'items': [
		// 	{
		// 		'text': 'AAAA',
		// 		'arrs': [
		// 			{'text': 'aaa', 'ss': [{'text': 'i'},{'text': 'ii'},{'text': 'iii'},{'text': 'iiii'}]},
		// 			{'text': 'bbb'},
		// 			{'text': 'ccc', 'ss': [{'text': 'k'},{'text': 'kk'}]}
		// 		]
		// 	},
		// 	{
		// 		'text': 'BBBBB',
		// 		'arrs': [
		// 			{'text': 'aaa', 'ss': [{'text': 'l'},{'text': 'll'},]},
		// 			{'text': 'aaaa', 'ss': [{'text': 'm'},{'text': 'mm'},{'text': 'mmm'}]},
		// 			{'text': 'aaaaa', 'ss': [{'text': 'n'},{'text': 'nn'},{'text': 'nnn'},{'text': 'nnn'}]}
		// 		]
		// 	}
		// ]

		// bind property in top element
		'did': 'gsw',
		'items': [
			{'id': 'curry', 'text': '库里'},
			{'id': 'kelay', 'text': '克莱'},
			{'id': 'green', 'text': '格林'}
		],
		// 'items': null
	});

	window.vm = vm.get();
});