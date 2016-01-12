require([
	'../../dist/sugar',
	'../../src/mvvm-observe'
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
	var arr = [
		{a: ['kb','sc','kd']},
		['b1',['b21', 'b22'], ['b31', 'b32']],
		{c: 3}
	];

	var foo = function foo(name, newVal, oldVal, tar) {
		console.log(name, newVal, oldVal);
	}

	new Observer(arr, foo);

	// arr[0].a[2] = 'tang'; // 0*a*2 tang kd

	// arr[1][0] = 'b11'; // 1*0

	// arr[1].push('b3'); // push-1

	arr[1][2].push('b33');

	arr[0].a = 'worries';



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


	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': '<h1 v-text="message"></h1>',
				'model': {
					'message': 'mvvm test'
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});