require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML = [
		// single
		// '<div class="static" v-bind:class="outCls"></div>',
		// '<ul>',
		// 	'<li v-for="item in items">',
		// 		'<h1 class="static" v-bind:class="outCls"></h1>',
		// 		'<p v-for="p in item.ps">',
		// 			'<b v-bind:class="p.cls"></b>',
		// 			'<i v-bind:class="outCls"></i>',
		// 		'</p>',
		// 	'</li>',
		// '</ul>'

		// classobj
		// '<h1 class="static" v-bind:class="outClsObjs"></h1>',
		// '<ul>',
		// 	'<li v-for="item in items">',
		// 		'<h1 class="static" v-bind:class="outClsObjs"></h1>',
		// 		// '<h1 class="static" v-bind:class="item.clsobj"></h1>',
		// 		'<p v-for="p in item.ps">',
		// 			'<b v-bind:class="p.clsobj"></b>',
		// 			'<i v-bind:class="outClsObjs"></i>',
		// 		'</p>',
		// 	'</li>',
		// '</ul>'

		// single classjson
		// '<h1 class="static" v-bind:class="{curry: isCurry, kelay: isKelay}"></h1>',
		// '<ul>',
		// 	'<li v-for="item in items">',
		// 		'<h1 class="static" v-bind:class="{curry: isCurry, kelay: isKelay}"></h1>',
		// 		// '<h1 class="static" v-bind:class="{curry: item.cls1, kelay: item.cls2}"></h1>',
		// 		'<p v-for="p in item.ps">',
		// 			'<b v-bind:class="{cls_a: p.isA, cls_b: p.isB}"></b>',
		// 			'<i v-bind:class="{cls_a: isCurry, cls_b: isKelay}"></i>',
		// 		'</p>',
		// 	'</li>',
		// '</ul>'

		// mutil property with single class
		// '<h1 class="static" v-bind="{class: outCls, id: pid}"></h1>',
		// '<ul>',
		// 	'<li v-for="item in items">',
		// 		'<h1 class="static" v-bind="{class: outCls, id: item.id}"></h1>',
		// 		// '<h1 class="static" v-bind="{class: item.cls, id: item.id}"></h1>',
		// 		'<p v-for="p in item.ps">',
		// 			'<b v-bind="{class: p.cls, id: p.id}"></b>',
		// 			'<i v-bind="{class: outCls, id: p.id}"></i>',
		// 		'</p>',
		// 	'</li>',
		// '</ul>'

		// mutil property with classobj
		'<h1 class="static" v-bind="{class: outClsObj, id: pid}"></h1>',
		'<ul>',
			'<li v-for="item in items">',
				'<h1 class="static" v-bind="{class:outClsObj, id: item.pid}"></h1>',
				// '<h1 class="static" v-bind="{class: item.clsobj, id: item.pid}"></h1>',
				'<p v-for="p in item.ps">',
					'<b v-bind="{class: p.clsobj, id: p.pid}"></b>',
					'<i v-bind="{class: outClsObj, id: p.pid}"></i>',
				'</p>',
			'</li>',
		'</ul>'
	].join('');

	var vm = new VM(body, {
		'outCls': 'outsideClass',

		// single
		// 'cls': 'curry',
		// 'items': [
		// 	{'cls': 'curry', 'ps': [{'cls': 'aa'},{'cls': 'bb'}]},
		// 	{'cls': 'kelay', 'ps': [{'cls': 'cc'},{'cls': 'dd'}]},
		// 	{'cls': 'green', 'ps': [{'cls': 'ee'},{'cls': 'ff'}]}
		// ]

		// classobj
		// 'obj': {
		// 	'curry': false,
		// 	'kelay': false
		// }
		// @todo: shift和unshift后无法在watcher的displaceCallback中正确的移位clsobj定义的类
		// 'outClsObjs': {
		// 	'out1': true,
		// 	'out2': true
		// },
		// 'items': [
		// 	{'clsobj': {'curry': true, 'kelay': true}, 'ps': [{'clsobj': {'aa': true, 'bb': true}},{'clsobj': {'cc': true, 'dd': true}}]},
		// 	{'clsobj': {'brook': true, 'durant': true}, 'ps': [{'clsobj': {'ee': true}}]}
		// ]

		// single classjson
		// 'isCurry': true,
		// 'isKelay': true,
		// 'items': [
		// 	{'cls1': true, 'cls2': false, 'ps': [{'isA': true, 'isB': false}]},
		// 	{'cls1': false, 'cls2': true, 'ps': [{'isA': false, 'isB': true}]}
		// ]

		// mutil property with single class
		// 'pid': 30,
		// 'items': [
		// 	{'cls': 'curry', 'id': 30, 'ps': [{'cls': 'aaa', 'id': 1}]},
		// 	{'cls': 'kelay', 'id': 11, 'ps': [{'cls': 'bbb', 'id': 2}]},
		// 	{'cls': 'green', 'id': 23, 'ps': [{'cls': 'ccc', 'id': 3}]}
		// ]

		// mutil property with classobj
		'outClsObj': {
			'curry': true,
			'kelay': true,
			'green': true
		},
		'pid': '-',
		'items': [
			{'clsobj': {'aa': true, 'bb': false}, 'pid': 1, 'ps': [{'clsobj': {'xx': true}, 'pid': 11}]},
			{'clsobj': {'cc': false, 'dd': true}, 'pid': 2, 'ps': [{'clsobj': {'yy': true}, 'pid': 22}]}
		]

	});

	window.vm = vm.get();
});