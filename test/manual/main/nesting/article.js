define([
	'../../../../bundle/sugar',
], function (imports) {
	var sugar = imports.default;

	var Footer = sugar.Component.extend({
		init: function (config) {
			config = this.cover(config, {
				'template': 'article.html',
				'model': {
					'content': '<p>This is article!</p>'
				}
			});
			this.Super('init', arguments);
		}
	});

	return Footer;
});