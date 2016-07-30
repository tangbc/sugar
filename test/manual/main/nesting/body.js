define([
	'../../../../bundle/sugar',
	'./article'
], function (imports, Article) {
	var sugar = imports.default;

	var Body = sugar.Component.extend({
		init: function (config) {
			config = this.cover(config, {
				'template': 'body.html',
				'model': {
					'title': 'Body'
				},
				'childs': {
					'Article': Article
				}
			});
			this.Super('init', arguments);
		}
	});

	return Body;
});