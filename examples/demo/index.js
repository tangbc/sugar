require(['../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<ul>',
						'<li v-for="item in items">',
							'<p v-text="item.text"></p>',
							'<div v-for="arr in item.arrs">',
								'<a v-text="item.arr.text"></a>',
								'<b v-for="s in item.arrs.ss">',
									'<i style="display:block;" v-text="s.text"></i>',
								'</b>',
							'</div>',
						'</li>',
					'</ul>'
				].join(''),
				'model': {
					'hehe': 111,
					'items': [
						{
							'text': 'AAAA',
							'arrs': [
								{'text': 'aaa', 'ss': [{'text': 'i'},{'text': 'ii'},{'text': 'iii'},{'text': 'iiii'}]},
								{'text': 'bbb'},
								{'text': 'ccc', 'ss': [{'text': 'k'},{'text': 'kk'}]}
							]
						},
						{
							'text': 'BBBBB',
							'arrs': [
								{'text': 'aaa', 'ss': [{'text': 'l'},{'text': 'll'},]},
								{'text': 'aaaa', 'ss': [{'text': 'm'},{'text': 'mm'},{'text': 'mmm'}]},
								{'text': 'aaaaa', 'ss': [{'text': 'n'},{'text': 'nn'},{'text': 'nnn'},{'text': 'nnn'}]}
							]
						}
					]
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			var vm = this.vm.$data;

			this.setTimeout(function() {
				vm.items[0].style = {'background': '#adcdef'};
			}, 5000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});