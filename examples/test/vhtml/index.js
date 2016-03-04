require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<ul>',
						'<li v-for="item in items">',
							'<span>呵呵哒</span>',
							'<span v-for="p in item.ps">',
								'<i>{{p}}</i>',
							'</span>',
						'</li>',
					'</ul>'
				].join(''),
				'model': {
					'items': [
						{'text': '金州勇士', 'ps': [1,2,3]},
						{'text': '神安东尼奥马刺'},
						{'text': '俄克拉荷马雷霆', 'ps': [11,2]}
					]
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			var vm = this.vm.$data;

			this.setTimeout(function() {
				//
			}, 3000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});