require(['../../sugar.pack.js'], function(su) {
	var sugar = su;
	var con = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'class': 'heheda',
				'html': '呵呵哒'
			});
			this.Super('init', arguments);
		}
	});


	sugar.core.create('my', con, {
		'target': sugar.jquery('body').empty()
	});
});