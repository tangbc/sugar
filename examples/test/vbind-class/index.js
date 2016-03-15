require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					// single
					// '<div class="static" v-bind:class="cls"></div>',
					// '<ul>',
					// 	'<li v-for="item in items">',
					// 		'<h1 class="static" v-bind:class="item.cls"></h1>',
					// 		'<p v-for="p in item.ps">',
					// 			'<b v-bind:class="p.cls"></b>',
					// 		'</p>',
					// 	'</li>',
					// '</ul>'

					// classobj
					// '<h1 class="static" v-bind:class="obj"></h1>',
					// '<ul>',
					// 	'<li v-for="item in items">',
					// 		'<h1 class="static" v-bind:class="item.clsobj"></h1>',
					// 		'<p v-for="p in item.ps">',
					// 			'<b v-bind:class="p.clsobj"></b>',
					// 		'</p>',
					// 	'</li>',
					// '</ul>'

					// single classjson
					// '<h1 class="static" v-bind:class="{curry: isCurry, kelay: isKelay}"></h1>',
					// '<ul>',
					// 	'<li v-for="item in items">',
					// 		'<h1 class="static" v-bind:class="{curry: item.cls1, kelay: item.cls2}"></h1>',
					// 		'<p v-for="p in item.ps">',
					// 			'<b v-bind:class="{cls_a: p.isA, cls_b: p.isB}"></b>',
					// 		'</p>',
					// 	'</li>',
					// '</ul>'

					// mutil property with single class
					// '<h1 class="static" v-bind="{class: cls, id: pid}"></h1>',
					// '<ul>',
					// 	'<li v-for="item in items">',
					// 		'<h1 class="static" v-bind="{class: item.cls, id: item.id}"></h1>',
					// 		'<p v-for="p in item.ps">',
					// 			'<b v-bind="{class: p.cls, id: p.id}"></b>',
					// 		'</p>',
					// 	'</li>',
					// '</ul>'

					// mutil property with classobj
					// '<h1 class="static" v-bind="{class: clsobj, id: pid}"></h1>',
					'<ul>',
						'<li v-for="item in items">',
							'<h1 class="static" v-bind="{class: item.clsobj, id: item.pid}"></h1>',
							'<p v-for="p in item.ps">',
								'<b v-bind="{class: p.clsobj, id: p.pid}"></b>',
							'</p>',
						'</li>',
					'</ul>'


				].join(''),
				'model': {
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
					// @todo: shift和unshift后无法在watcher的displaceCallback中正确的移位
					// 'items': [
					// 	{'clsobj': {'curry': true, 'kelay': true}, 'ps': [{'clsobj': {'aa': true, 'bb': true}},{'clsobj': {'cc': true, 'dd': true}}]},
					// 	{'clsobj': {'brook': true, 'durant': true}, 'ps': [{'clsobj': {'ee': true}}]}
					// ]

					// single classjson
					// 'isCurry': true,
					// 'isKelay': true
					// 'items': [
					// 	{'cls1': true, 'cls2': false, 'ps': [{'isA': true, 'isB': false}]},
					// 	{'cls1': false, 'cls2': true, 'ps': [{'isA': false, 'isB': true}]}
					// ]

					// mutil property with single class
					// 'cls': 'curry',
					// 'pid': 30
					// 'items': [
					// 	{'cls': 'curry', 'id': 30, 'ps': [{'cls': 'aaa', 'id': 1}]},
					// 	{'cls': 'kelay', 'id': 11, 'ps': [{'cls': 'bbb', 'id': 2}]},
					// 	{'cls': 'green', 'id': 23, 'ps': [{'cls': 'ccc', 'id': 3}]}
					// ]

					// mutil property with classobj
					// 'clsobj': {
					// 	'curry': true,
					// 	'kelay': true,
					// 	'green': true
					// },
					// 'pid': '-'
					'items': [
						{'clsobj': {'aa': true, 'bb': false}, 'pid': 1, 'ps': [{'clsobj': {'xx': true}, 'pid': 11}]},
						{'clsobj': {'cc': false, 'dd': true}, 'pid': 2, 'ps': [{'clsobj': {'yy': true}, 'pid': 22}]}
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