require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML = [
		'<h1 v-text="name"></h1>',
		'<ul>',
			'<li v-for="item in items">',
				'号码：{{$index}}，名字：<span v-text="name"></span>',
				'<p style="text-indent:2em;" v-for="p in item.ps">',
					'<b>{{p.text}}</b> | ',
					'<i>{{item.number}}</i>',
				'</p>',
			'</li>',
		'</ul>'
	].join('');

	var vm = new VM(body, {
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
	});

	window.vm = vm.get();
});