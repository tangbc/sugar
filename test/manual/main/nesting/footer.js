define([
	'../../../../bundle/sugar',
], function (imports) {
	var sugar = imports.default;

	var Footer = sugar.Component.extend({
		init: function (config) {
			config = this.cover(config, {
				'template': 'footer.html',
				'model': {
					'title': 'Footer'
				}
			});
			this.Super('init', arguments);
		}
	});

	return Footer;
});