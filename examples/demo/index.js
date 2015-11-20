require(['../../dist/sugar'], function(sugar) {
	window.sugar = sugar;
	var $ = sugar.jquery;

	var template = [
		'<h1 v-text="message"></h1>'
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