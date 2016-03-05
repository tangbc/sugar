require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<ul>',
						'<li v-for="item in teams">',
							'<span>{{item.text}}</span>',
							'<span v-for="t in item.ts">',
								'<i>{{t}}</i>',
							'</span>',
						'</li>',
					'</ul>',
					'<hr/>',
					'<ul>',
						'<li v-for="item in players">',
							'<span>{{item.text}}</span>',
							'<span v-for="p in item.ps">',
								'<b>{{p}}</b>',
							'</span>',
						'</li>',
					'</ul>',
				].join(''),
				'model': {
					'teams': [
						{'text': '金州勇士', 'ts': [1, 2, 3]},
						{'text': '圣安东尼奥马刺', 'ts': [4,5]},
						{'text': '俄克拉荷马雷霆', 'ts': [6,7]}
					],
					'players': [
						{'text': '库里', 'ps': [1]},
						{'text': '汤普森', 'ps': [2,3,4]},
						{'text': '格林', 'ps': [5]}
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