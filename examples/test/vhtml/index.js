require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<ul>',
						'<li v-for="item in items">',
							'前缀{{item.text}}后缀',
							'<br>',
							'<span>I love you {{{$index}}} times</span>',
							// '<span v-text="$index"></span>',
							'<span v-text="item.text"></span>',
							'<div v-for="p in item.ps">',
								'<p>___{{{p.hp}}}___</p>',
								'<p>****{{{item.html}}}***</p>',
							'</div>',
						'</li>',
					'</ul>'
				].join(''),
				'model': {
					'items': [
						{'text': '_粗体文本_', 'html': '<b>粗体</b>', 'ps': [{'hp': '粗体'}]},
						{'text': '_斜体文本_', 'html': '<i>斜体</i>', 'ps': [{'hp': '斜体'}]},
						{'text': '_小号文本_', 'html': '<small>小号</small>', 'ps': [{'hp': '小号'}]},
					]
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			window.vm = this.vm.$data;

			this.setTimeout(function() {

				this.setTimeout(function() {

				}, 2000)
			}, 2000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});