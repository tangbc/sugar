require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML = [
		'<ul>',
			'<li v-for="item in items">',
				'<b v-text="item.text"></b>',
				'<div v-for="p in item.ps">',
					'<span v-el="p.el">{{p.number}}</span>',
				'</div>',
			'</li>',
		'</ul>'
	].join('');

	var vm = new VM(body, {
		'items': [
			{'text': '库里', 'ps': [{'number': 30}, {'number': 13}]},
			{'text': '汤普森', 'ps': [{'number': 11}]},
			{'text': '格林', 'ps': [{'number': 23}]}
		]
	});

	window.vm = vm.get();
});