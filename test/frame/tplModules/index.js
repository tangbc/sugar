require(['../../../src/index'], function(sugar) {

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = this.cover(config, {
				'target'  : document.querySelector('body'),
				'template': 'tpl.html'
			});
			this.Super('init', arguments);
		},

		viewReady: function() {
			this.createTemplate();
		},

		afterBuild: function() {
			var sub = this.getChild('sub2');
			this.setTimeout(function() {
				sub.destroy();
			}, 3000);
		}
	});


	sugar.core.create('mainPage', MainPage);
});