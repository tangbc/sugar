require(['../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<select v-model="selected" multiple>',
						'<option selected>A</option>',
						'<option>B</option>',
						'<option selected>C</option>',
					'</select>',
					'<span v-text="selected"></span>'
				].join(''),
				'model': {
					'selected': ['A', 'C']
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			var vm = this.vm.$data;
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});