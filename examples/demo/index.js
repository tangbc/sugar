require([
	'../../dist/sugar',
	'../../src/mvvm-observer'
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
					'<header class="header"></header>',
					'<h1 v-show="showH1" v-text="message" style="display:inline;"></h1>',
					'<h2 v-if="showH2">好多东西这里面</h2>',
					'<div v-bind:class="hasLv1:lv1" class="div1 div2">',
						'<p v-bind:data-id="dataId">',
							'<em v-text="small"></em>',
						'</p>',
					'</div>',
					'<span v-html="info"></span>',
				].join(''),
				'model': {
					'showH1' : true,
					'showH2' : false,
					'message': 'h1 test',
					'info'   : '<a href="#">信息</a>',
					'small'  : '',
					'hasLv1' : true,
					'dataId' : 'p1'
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			// console.log(this.vm);
			// this.vm.$data.message = 'vm -> message';

			// this.vm.$data.small = 'vm -> small';

			// this.setTimeout(function() {
			// 	this.vm.$data.info = '<hr/>';
			// }, 1000);

			// this.setTimeout(function() {
			// 	this.vm.$data.showH1 = true;
			// }, 2000);

			// this.setTimeout(function() {
			// 	this.vm.$data.showH1 = false;
			// }, 2000);

		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});