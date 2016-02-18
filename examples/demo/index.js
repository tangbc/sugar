require([
	'../../dist/sugar',
	// '../../src/vm-observer'
], function(sugar, Observer) {
	var $ = sugar.jquery;

	// var obj = {
	// 	'okc': {
	// 		'rwb': true,
	// 		'kdr': '35',
	// 		'sib': {
	// 			'blr': 12
	// 		}
	// 	}
	// }

	// new Observer(obj, function (name, newVal, oldVal, tar) {
	// 	console.log(name, newVal, oldVal);
	// });


	// obj.okc.rwb = {
	// 	'number': 0
	// }

	// obj.okc.rwb = {
	// 	'number': 12
	// }

	// obj.okc.rwb = 12;

	// obj.okc.sib.blr = {
	// 	'hehe': 0
	// }

	// obj.okc.sib.blr = 100002;






	// deep array ---------------------
	// var arr = [
	// 	{a: ['kb','sc','kd']},
	// 	['b1',['b21', 'b22'], ['b31', 'b32']],
	// 	{c: 3}
	// ];

	// var foo = function foo(name, newVal, oldVal, tar) {
	// 	console.log(name, newVal, oldVal);
	// }

	// new Observer(arr, foo);

	// arr[0].a[2] = 'tang'; // 0*a*2 tang kd

	// arr[1][0] = 'b11'; // 1*0

	// arr[1].push('b3'); // push-1

	// arr[1][2].push('b33');

	// arr[0].a = 'worries';



	// shallow array -------------------
	// var arr = [1,2,3];

	// var foo = function foo(name, newVal, oldVal, target) {
	// 	console.log(name, newVal, oldVal);
	// }

	// new Observer(arr, foo);

	// arr.push(4);



	/* -------- deep object ----------*/
	// var obj = {
	// 	a: {
	// 		b: {
	// 			c: ['xxxx', 'yyyy', {
	// 				d: 'ddd'
	// 			}]
	// 		}
	// 	},
	// 	b: {
	// 		b: {
	// 			b: 'old'
	// 		}
	// 	}
	// }

	// new Observer(obj, function(p, n, o) {
	// 	console.log(p, n, o);
	// });

	// obj.b.b.b = 'new';

	// obj.a.b.c[0] = 'XXX';

	// obj.a.b.c[2].d = 'DDD';


	/* ---------- range test ----------- */
	// var obj = {
	// 	'a': 'aaa',
	// 	'b': 'bbb',
	// 	'c': {
	// 		'd': 'dd',
	// 		'e': 'ee'
	// 	}
	// }

	// new Observer(obj, ['c*e'], function(p, n, o) {
	// 	console.log(p, n, o);
	// });

	// obj.a = '1111';
	// obj.b = '2222';

	// obj.c.d = 'DD';
	// obj.c.e = 'EE';


	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<header class="header" v-bind="{id: span_id, name: span_name, data-id: span_data_id}"></header>',
					'<h1 v-show="showH1" v-text="message" style="display:inline"></h1>',
					'<h2 style="background: #abcdef; padding: 10px;" v-if="showH2">',
						'好多东西这里面 —— <em v-text="emTextIf"></em>',
					'</h2>',
					'<div v-bind:class="test">',
						'<p>',
							'<em v-text="small" v-on="{click: emClick($event, 123), mouseenter: emMouseenter(456)}"></em>',
						'</p>',
					'</div>',
					'<span v-html="info" v-bind:class="test"></span>',
					// "aa:fn(a,b,c),bb:fn,cc:fn(d,e)" => ["aa:fn(a,b,c)", "bb:fn", "cc:fn(d,e)"]
					// '<button v-on:click="btnClick">我是按钮</button>',
					// '<button v-on:click="btnClick(123, 456)">我是按钮</button>',
					// '<button v-on:click="btnClick($event, 123)">我是按钮</button>',
				].join(''),
				'model': {
					'showH1'  : true,

					'showH2'  : true,
					'emTextIf': 'if里面的初始化时不应该被编译才对！',

					'message' : 'h1 test',
					'info'    : '<a href="#">信息</a>',
					'small'   : 'small',
					'id_div'  : 'id_original',

					'bind_new3': true,
					'bind_new4': false,

					'span_id'     : 'id_1',
					'span_name'   : 'name_1',
					'span_data_id': 'data_id_1',

					'test': 'test_class',

					emClick: function() {
						console.log(arguments)
					},
					emMouseenter: function() {
						console.log(arguments)
					},
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			var vm = this.vm.$data;

			// this.setTimeout(function() {
			// 	vm.info = '<hr/>';
			// }, 1000);

			// this.setTimeout(function() {
			// 	vm.showH1 = true;
			// }, 2000);

			// this.setTimeout(function() {
			// 	vm.showH1 = false;

			// 	this.setTimeout(function() {
			// 		vm.showH1 = true;
			// 	}, 5000);
			// }, 5000);

			// this.setTimeout(function() {
			// 	vm.showH2 = false;

			// 	this.setTimeout(function() {
			// 		vm.showH2 = true;
			// 	}, 5000);
			// }, 5000);

			// this.setTimeout(function() {
			// 	vm.id_div = 'id_once';

			// 	this.setTimeout(function() {
			// 		vm.id_div = null;
			// 	}, 5000);
			// }, 5000);

			// this.setTimeout(function() {
			// 	vm.bind_new3 = false;
			// 	vm.bind_new4 = true;

			// 	this.setTimeout(function() {
			// 		vm.bind_new3 = true;
			// 		vm.bind_new4 = false;
			// 	}, 5000);
			// }, 5000);

			// this.setTimeout(function() {
			// 	vm.span_id = 'id_2';
			// 	vm.span_name = 'name_2';
			// 	vm.span_data_id = 'data_id_2';

			// 	this.setTimeout(function() {
			// 		vm.span_id = 'id_3';
			// 		vm.span_name = 'name_3';
			// 		vm.span_data_id = 'data_id_3';
			// 	}, 5000);
			// }, 5000);

			// this.setTimeout(function() {
			// 	vm.btnClick = function() {
			// 		console.log('click has changed!!');
			// 	}
			// }, 5000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});