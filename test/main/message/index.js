require(['../../../src/main/index'], function(sugar) {

	var Subpage = sugar.Container.extend({
		init: function(config) {
			config = this.cover(config, {
				'class': 'sub-page',
				'html' : [
					'<h3>This is Subpage</h3>'
				]
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			this.fire('subCreate');
		},

		onParentCast: function(ev) {
			console.log(ev);
		}
	});



	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = this.cover(config, {
				'template': 'layout.html'
			});
			this.Super('init', arguments);
		},

		viewReady: function() {

			this.create('sub', Subpage, {
				'target': this.query('.cont'),
				'class': 'sss',
				'tang': 'bc'
			});
		},

		onSubCreate: function() {
			console.log('onSubCreate')

			this.broadcast('parentCast', 123);
		}
	});


	sugar.core.create('mainPage', MainPage, {
		'target': document.querySelector('body')
	});
});