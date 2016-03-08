require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<ul>',
						'<b>不要把头移除了</b>',
						'<li v-for="item in teams">',
							'<span>{{item.text}}</span>',
							'<b> 二层头</b>',
							'<span v-for="t in item.ts">',
								'<i><{{t}}></i>',
							'</span>',
							'<b> 二层尾</b>',
						'</li>',
						'<b>不要把尾巴移除了</b>',
					'</ul>',
					'<hr/>',
					// '<ul>',
					// 	'<li v-for="item in players">',
					// 		'<span>{{item.text}}</span>',
					// 		'<span v-for="p in item.ps">',
					// 			'<b>{{p}}</b>',
					// 		'</span>',
					// 	'</li>',
					// '</ul>',
				].join(''),
				'model': {
					'teams': [
						{'text': '金州勇士', 'ts': ['a','b','c']},
						{'text': '圣安东尼奥马刺', 'ts': ['d','e','f']},
						{'text': '俄克拉荷马雷霆', 'ts': ['g','h','i']}
					],
					// 'players': [
					// 	{'text': '库里', 'ps': [1,2,3]},
					// 	{'text': '汤普森', 'ps': [1,2,3]},
					// 	{'text': '格林', 'ps': [1,2,3]}
					// ]
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			var vm = this.vm.$data;

			this.setTimeout(function() {
				vm.teams[0].ts.unshift('o');
				// vm.teams.shift();

				this.setTimeout(function() {
					vm.teams[0].ts[0] = 'OOO';
					vm.teams[0].ts[1] = 'AAA';
					vm.teams[0].ts[2] = 'BBB';
					vm.teams[0].ts[3] = 'CCC';


					vm.teams[0].text = '勇士';
					vm.teams[1].text = '马刺';
				}, 2000)
			}, 2000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});