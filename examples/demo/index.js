require([
	'../../dist/sugar',
	'../../src/mvvm-observe'
], function(sugar, Observer) {
	var $ = sugar.jquery;

	var test = {
		'okc': {
			'rwb': true,
			'kdr': '35',
			'sib': {
				'blr': 12
			}
		}
	}

	var ob = new Observer(test, function (name, newVal, oldVal) {
		console.log(name, newVal, oldVal);
	});
	ob.init();


	test.okc.rwb = {
		'number': 0
	}

	test.okc.rwb = {
		'number': 12
	}

	test.okc.rwb = 12;

	test.okc.sib.blr = {
		'hehe': 0
	}

	// test.okc.sib.blr = 100002;

	// console.log(test)


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