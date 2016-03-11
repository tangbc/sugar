require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<ul>',
						'<b>不要把头移除了</b>',
						'<li v-for="item in teams">',
							'<span>{{$index}}</span>',
							'<span>{{item.text}}</span>',
							'<b>^</b>',
							'<span v-for="t in item.ts">',
								'<span><i><{{$index}}</i>{{t}}></span>',
							'</span>',
							'<b>$</b>',
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
				// vm.teams = [{'text': '96公牛', 'ts': ['x','y','z']}];
				// vm.teams.unshift({'text': '芝加哥公牛'});
				// vm.teams.push({'text': '洛杉矶快船', 'ts': ['j', 'k', 'l']})
				// vm.teams.shift();
				vm.teams[1].ts.unshift('@');

				this.setTimeout(function() {
					// vm.teams[3].ts.push('m')
					// vm.teams[0].text = '马刺'
					// vm.teams[1].text = '雷霆'
					// vm.teams[1].ts[1] = 'FFF'
				}, 2000)
			}, 2000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});