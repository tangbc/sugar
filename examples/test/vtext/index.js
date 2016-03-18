require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<h1 v-text="name"></h1>',
					'<ul>',
						'<li v-for="item in items">',
							'号码：{{$index}}，名字：<span v-text="name"></span>',
							// '<p style="text-indent:2em;" v-for="p in item.ps">',
							// 	'<b>{{p.text}}</b> | ',
							// 	'<i>{{item.number}}</i>',
							// '</p>',
						'</li>',
					'</ul>'
				].join(''),
				'model': {
					'name': '金州勇士',
					'items': [
						{
							'name': '库里',
							'number': 30,
							'ps': [
								{'text': 'mvp'},
								{'text': '三分冠军'},
								{'text': '得分王'}
							]
						},
						{
							'name': '伊戈达拉',
							'number': 9,
							'ps': [
								{'text': 'fmvp'},
								{'text': '精神领袖'}
							]
						},
						{
							'name': '汤普森',
							'number': 11,
							'ps': [
								{'text': '单节37分'}
							]
						}
					]
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			window.vm = this.vm.$data;

			this.setTimeout(function() {
				// vm.items[0].number = '333333333000000';
				// vm.items[1].number = '999999999999999';
				// vm.items[2].number = '111111111111111';
			}, 3000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});