define(['sub1'], function() {
	var sugar = require('../../../src/index');

	var Sub1 = sugar.Container.extend({
		init: function(config) {
			config = this.cover(config, {
				'class': 'sub-1',
				'html': '<h1>Sub1</h1>'
			});
			this.Super('init', arguments);
		}
	});

	return Sub1;
});