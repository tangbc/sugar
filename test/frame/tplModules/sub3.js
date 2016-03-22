define(['sub3'], function(sugar) {
	var sugar = require('../../../src/index');

	var Sub3 = sugar.Container.extend({
		init: function(config) {
			config = this.cover(config, {
				'class': 'sub-3',
				'html': '<h1>Sub3</h1>'
			});
			this.Super('init', arguments);
		}
	});

	return Sub3;
});