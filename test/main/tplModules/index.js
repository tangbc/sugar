require([
	'../../../src/main/index',
	'sub1',
	'sub2',
	'sub3'
], function(sugar, sub1, sub2, sub3) {

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = this.cover(config, {
				'target'  : document.querySelector('body'),
				'template': 'tpl.html'
			});
			this.Super('init', arguments);
		},

		viewReady: function() {
			this.createTemplateModules({
				'sub1': {
					'module': sub1
				},
				'sub2': {
					'module': sub2
				},
				'sub3': {
					'module': sub3
				}
			});
		}
	});


	sugar.core.create('mainPage', MainPage);
});