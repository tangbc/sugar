require([
	'../../../../bundle/sugar',
	'./header',
	'./body',
	'./footer'
], function (imports, Header, Body, Footer) {
	var sugar = imports.default;

	var Main = sugar.Component.extend({
		init: function (config) {
			config = this.cover(config, {
				'template': 'main.html',
				'model': {
					'title': 'xxdk'
				},
				'childs': {
					'SubHeader': Header,
					'SubBody'  : Body,
					'SubFooter': Footer
				}
			});
			this.Super('init', arguments);
		},

		afterRender: function () {
			console.log(this.getChilds());
		}
	});


	sugar.core.create('main', Main, {
		'target': document.querySelector('body')
	});
});