define([
	'../../../../bundle/sugar',
], function (imports) {
	var sugar = imports.default;

	var Header = sugar.Component.extend({
		init: function (config) {
			config = this.cover(config, {
				'template': 'header.html',
				'model': {
					'title': 'Header'
				}
			});
			this.Super('init', arguments);
		}
	});

	return Header;
});