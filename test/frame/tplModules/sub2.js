define(['sub2'], function(sugar) {
	var sugar = require('../../../src/index');

	var Sub2 = sugar.Container.extend({
		init: function(config) {
			config = this.cover(config, {
				'class': 'sub-2',
				'html': '<h1>Sub2</h1>'
			});
			this.Super('init', arguments);
		}
	});

	return Sub2;
});