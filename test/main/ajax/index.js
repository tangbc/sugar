require([
	'../../../src/main/index'
], function(sugar) {

	var MainPage = sugar.Component.extend({
		init: function(config) {
			this.Super('init', arguments);
		},

		viewReady: function() {
			// request 1
			sugar.ajax.get('../../../bin/test1.json', function(err, data) {
				console.log('test1', err, data);
			});

			// request 2
			sugar.ajax.get('../../../bin/test2.json', function(err, data) {
				console.log('test2', err, data);
			});

			// request 3
			sugar.ajax.get('../../../bin/test3.json', function(err, data) {
				console.log('test3', err, data);
			});
		}
	});


	sugar.core.create('mainPage', MainPage, {
		'target': document.querySelector('body')
	});
});