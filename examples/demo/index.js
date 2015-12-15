require([
	'../../dist/sugar',
	'../../src/mvvm-observe'
], function(sugar, observe) {
	window.observe = observe;
	var $ = sugar.jquery;

	// var test1 = [1,2,3];
	var test2 = {a: 1, b: 2, c: {c1: 3}}

	function foo(n, o, name, t) {
		console.log('new:', n, 'old:', o, 'target:', t);
	}

	observe.observe(test2, foo);

	// test1[0] = 11;

	// test1.push(11);

	// test1.unshift(0);

	test2.c.c1 = 4;

	var template = [
		'<h1 v-text="message"></h1>',
		'<ul class="list">',
			'<li>金州勇士</li>',
			'<li>圣安东尼奥马刺</li>',
			'<li>克利夫兰骑士</li>',
		'</ul>'
	].join('');

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': template,
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